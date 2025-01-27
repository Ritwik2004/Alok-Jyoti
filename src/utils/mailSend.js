// import nodemailer from "nodemailer"
// import { ApiError } from "./ApiError.js";
// import { response } from "express";

// const sendMail = (async (mailId, data, sub) => {

//     var transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: process.env.OFFFICIAL_EMAIL,
//             pass: process.env.EMAIL_PASSWORD
//         }
//     });

//     var mailOptions = {
//         from: process.env.OFFFICIAL_EMAIL,
//         to: mailId,
//         subject: sub,
//         text: data
//     };

//     transporter.sendMail(mailOptions, function (error, info) {
//         if (error) {
//             return null;
//         } else {
//             response = 'Email sent: ', info.response;
//             return response
//         }
//     });
// })

// export {sendMail};
import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";

const sendMail = async (mailId, data, sub) => {
    console.log(data)
    console.log(mailId)
    try {
        // Check if environment variables are defined
        if (!process.env.OFFFICIAL_EMAIL || !process.env.EMAIL_PASSWORD) {
            throw new ApiError(500, "Email credentials are not configured.");
        }
        if (typeof data !== "string") {
            console.warn("The 'data' argument is not a string. Converting it to a string...");
            data = String(data);
        }
        // Create the transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.OFFFICIAL_EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        console.log("from here")
        // Define mail options
        const mailOptions = {
            from: process.env.OFFFICIAL_EMAIL,
            to: mailId,
            subject: sub,
            text: data,
        };
        console.log("Also here")
        // Send the mail and return response
        const info = await transporter.sendMail(mailOptions);
        return `Email sent: ${info.response}`;
    } catch (error) {
        console.error("Error sending email:", error);
        throw new ApiError(500, "Failed to send email.");
    }
};

export { sendMail };
