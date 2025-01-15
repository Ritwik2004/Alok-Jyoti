import nodemailer from "nodemailer"
import { ApiError } from "./ApiError.js";
import { response } from "express";

const sendMail = (async (mailId, data, sub) => {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.OFFFICIAL_EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    var mailOptions = {
        from: process.env.OFFFICIAL_EMAIL,
        to: mailId,
        subject: sub,
        text: data
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return null;
        } else {
            response = 'Email sent: ', info.response;
            return response
        }
    });
})

export {sendMail};