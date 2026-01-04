import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import multer from "multer";
import ImageKit from "imagekit";
import { getReciverSocketId } from "../libs/socket.js";

// configure middleware, multer
const upload = multer({ storage: multer.memoryStorage() });

// initialize imagekit
let imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export const getMessage = async (req, res) => {
  const { id: userToChatId } = req.params;

  try {
    // current user is logged in
    let currentUserId = req.auth?.userId;

    // find the message based on the fromClrekId to toClerkId
    const messages = await Message.find({
      $or: [
        {
          fromClerkId: currentUserId,
          toClerkId: userToChatId,
        },
        {
          fromClerkId: userToChatId,
          toClerkId: currentUserId,
        },
      ],
    }).sort({ createdAt: 1 }); // 1 for asc -> desc, -1 fromd esc -> asc

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getting message controller", error);
    res.status(500).json({ error: "Interval Server Error" });
  }
};

export const sendMessages = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: toClerkId } = req.params;
    const fromClerkId = req.auth?.userId;

    if (!fromClerkId) {
      return res.status(400).json({ error: "Unauthorized User!" });
    }
    const fromUser = await User.findOne({ clerkUserId: fromClerkId });
    const toUser = await User.findOne({ clerkUserId: toClerkId });

    // handling the images for Imagekit

    let imageUrl;
    if (req.file) {
      const base64String = req.file.buffer.toString("base64");
      const result = await imagekit.upload({
        file: base64Image,
        fileName: `${Date.now()}.jpg`,
        useUniqueFileName: true,
      });
      imageUrl = result.url;
    }

    const newMessage = await Message.create({
      fromClerkId,
      toClerkId,
      from: fromUser._id,
      to: toUser._id,
      text,
      image: imageUrl,
    });

    // send message and receive it using Socekt.io
    console.log("hit");
    const reciverSocketId = getReciverSocketId(toClerkId);

    if (reciverSocketId) {
      io.to(reciverSocketId).emit("newMessage", newMessage);
    }

    const senderSocketId = getReciverSocketId(fromClerkId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);

      res.status(201).json(newMessage);
    }
  } catch (error) {
    console.error("Error in sending message controller", error);
  }
};

export { upload };
