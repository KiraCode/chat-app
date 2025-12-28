import { Webhook } from "svix";

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
      console.log("user created Triggered");
    } else if (eventType === "user.updated") {
      console.log("user updated triggered");
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export { handleClerkWebhook };
