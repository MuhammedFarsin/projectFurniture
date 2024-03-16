const multer = require("multer")
require("dotenv").config()

const nodemailer = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
}

const otpCheck={};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/assetsNew/uploads");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage: storage });

module.exports = {
    nodemailer,
    otpCheck,
    upload
}
