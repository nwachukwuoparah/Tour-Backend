const nodemailer = require("nodemailer")


const sendEmail = async options => {
  console.log(options)
  //create a reansporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      password: process.env.EMAIL_PASSWORD
    }
  })

  // Define the email options 

  const mailOptions = {
    from: "CRUDE",
    to: options.email,
    subject: options.subject,
    text: options.message,
  }

  // Actually sending the email
  await transporter.sendMail(mailOptions)

}

module.exports = sendEmail