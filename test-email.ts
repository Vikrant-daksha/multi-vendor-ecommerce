import { sendEmail } from "./apps/auth-service/src/utils/send-mail/index.js";

async function test() {
    console.log("Sending test email...");
    const success = await sendEmail("vikrantdaksha05@gmail.com", "Test Email from Auth Service", "user-activation-mail", { name: "Vikrant", otp: "1234" });
    if (success) {
        console.log("Test email sent successfully.");
    } else {
        console.log("Failed to send test email.");
    }
}

test();
