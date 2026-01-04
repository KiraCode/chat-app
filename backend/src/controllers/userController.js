import { Webhook } from "svix";
import User from "../models/userModel.js";

const handleClerkWebhook = async (req, res) => {
  try {
    console.log("UserCreation Route");
    const CLERK_WEBHOOK_SECRET_KEY = process.env.CLERK_WEBHOOK_SECRET_KEY;

    if (!CLERK_WEBHOOK_SECRET_KEY) {
      console.error(
        "❌ Error: CLERK_WEBHOOK_SECRET_KEY is missing in .ev file"
      );
      return res.status(500).json({ success: false, message: "Server Error" });
    }

    //   Extract the HTTP header from the request .These headers contain the signature tfat will be used to verify the webhook
    const svixHeaders = req.headers;

    //   extract the request body, which contains the webhook data sent by clerk
    const payloadString = req.body;

    // create a new instance of the Svix Webhook verification class, passing in key. Svix is the webhook service clerk uses
    const wh = new Webhook(CLERK_WEBHOOK_SECRET_KEY);

    // verify the webhook signature using the payload and headers. if verification fails, this will thriw an error and the execution will jump to the catch block
    const evt = wh.verify(payloadString, svixHeaders);

    // destructures the event data, extracting the id field and putting all other fields into attribute object
    const { id, ...attributes } = evt.data;

    // extract the eventType
    const eventType = evt.type;

    console.log(`✅ Received webhook: ID${id}, Event Type:${eventType}`);
    console.log(`📩 Payload Data / Attributes: ${attributes}}`);

    // check if the event Type is "user.created". This is the beginning of the specific handler code for user creation events
    if (eventType === "user.created") {
      try {
        // find if any user exist user id
        const userExists = await User.findOne({ clerkUserId: id });

        if (userExists) {
          return res
            .status(400)
            .json({ success: false, message: "user already exists" });
        }

        const newUser = new User({
          clerkUserId: id,
          email: attributes.email_addresses[0].email_address,
          username: attributes.username || "",
          firstName: attributes.first_name || "",
          lastName: attributes.last_name || "",
          profileImage: attributes.profile_image_url || "",
        });

        await newUser.save();

        res.status(200).json({ success: true, message: "User Created" });
      } catch (error) {
        res.status(400).json({ success: false, message: "user not created" });
      }
    } else if (eventType === "user.updated") {
      try {
        // find the user in mongodb
        const updateUser = await User.updateOne(
          {
            clerkUserId: id,
          },
          {
            $set: {
              email: attributes.email_addresses[0].email_address,
              firstName: attributes.first_name,
              lastName: attributes.last_name,
              username: attributes.username,
              profileImage: attributes.profile_image_url,
            },
          }
        );

        // validate
        if (updateUser.modifiedCount > 0) {
          console.log(`User with Clerk id - ${id}, Updated Successfully`);
        } else {
          console.log(`No User with Clerk id - ${id} found`);
        }

        res
          .status(200)
          .json({ success: true, message: "User updated successfully" });
      } catch (error) {
        res.status(400).json({ success: false, message: "User not updated" });
      }
    }

    if (eventType === "user.deleted") {
      try {
        const deletedUser = await User.deleteOne({ clerkUserId: id });
        if (deletedUser.deletedCount > 0) {
          console.log(`User with clerkUserId ${id} deleted Successfully`);
          res
            .status(200)
            .json({ success: true, message: "User deleted Success" });
        } else {
          console.log(
            `No user found with clerkUserId: ${id}, nothing to delete`
          );
        }
      } catch (error) {
        res.status(400).json({
          success: false,
          message: "Something went wrong, while deleting",
        });
      }
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getUsersForSidebar = async (req, res) => {
  try {
    const currentUser = req.auth?.userId;

    const filteredUsers = await User.find({
      clerkUserId: { $ne: currentUser },
    });

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUserFor Sidebar Controller: ", error.messager);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { handleClerkWebhook, getUsersForSidebar };
