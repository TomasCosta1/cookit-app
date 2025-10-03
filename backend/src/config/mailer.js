const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mazzajoaquin22@gmail.com",
    pass: "zcpi majm ipgs moxy"
  }
});

module.exports = { transporter };
