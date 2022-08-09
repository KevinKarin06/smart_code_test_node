const nodemailer = require("nodemailer");
const transport = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
});

module.exports = function sendMail(email) {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: process.env.MAIL_FROM_ADDRESS,
            to: email,
            subject: "NewsLetter",
            text: `You have successfuly subscribed to our newsletter`,
        };

        transport.sendMail(mailOptions, (err, info) => {
            if (err) {
                reject(error)
            } else resolve(info);
        });

    })


};
