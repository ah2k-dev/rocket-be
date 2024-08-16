const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const sendgridTransport = require("nodemailer-sendgrid-transport");
dotenv.config({ path: "./src/config/config.env" });
const { createTransport } = nodemailer;

const sendMail = async (email, subject, html) => {
  const transport = createTransport(
    sendgridTransport({
      auth: {
        api_key: process.env.NODEMAILER_API_KEY,
      },
    })
  );
  await transport.sendMail({
    from: '"Rocket Screening" <admin@rocketscreening.com>',
    to: email,
    subject,
    html,
  });
};

module.exports = sendMail;
