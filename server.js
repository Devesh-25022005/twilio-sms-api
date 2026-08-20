const express = require("express");
const twilio = require("twilio");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(express.json());

// Serve Salesforce Marketing Cloud Custom Activity files
app.use(
    "/custom-activity",
    express.static(path.join(__dirname, "custom-activity"))
);

// Twilio credentials
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Health check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Twilio SMS API is running"
    });
});

// Direct API test endpoint
app.post("/send-sms", async (req, res) => {
    try {
        const { to, message } = req.body;

        if (!to || !message) {
            return res.status(400).json({
                success: false,
                error: "Both 'to' and 'message' are required"
            });
        }

        const sms = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        });

        console.log("SMS sent:", sms.sid);

        return res.status(200).json({
            success: true,
            messageSid: sms.sid
        });

    } catch (error) {
        console.error("SMS error:", error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Salesforce Marketing Cloud Custom Activity
app.post("/execute", async (req, res) => {
    try {
        console.log("=================================");
        console.log("SFMC request received");
        console.log(JSON.stringify(req.body, null, 2));
        console.log("=================================");

        const inArguments =
            req.body?.inArguments ||
            req.body?.arguments?.execute?.inArguments ||
            [];

        const messageArgument = inArguments.find(
            arg => arg.message !== undefined
        );

        const phoneArgument = inArguments.find(
            arg => arg.phone !== undefined
        );

        const message = messageArgument?.message;
        const phone = phoneArgument?.phone;

        console.log("Message:", message);
        console.log("Phone:", phone);

        if (!message || !phone) {
            return res.status(400).json({
                success: false,
                error: "Missing phone or message"
            });
        }

        const sms = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
        });

        console.log("Twilio SMS sent:", sms.sid);

        return res.status(200).json({
            success: true,
            messageSid: sms.sid
        });

    } catch (error) {
        console.error("Execution error:", error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
