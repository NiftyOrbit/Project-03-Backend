const { ActivityLog, Contact } = require("../models");
const { sendEmail } = require("../utils/email");

const handleContactRequest = async (req, res) => {
    const { name, email, message, phoneno } = req.body;
    try {
      const newContact = await Contact.create({ name, email, message, phoneno });
  
      const activity = await ActivityLog.create({
        user_email: email,
        activity: 'New Contact Request',
        details: { name, email, message, phoneno },
      });
  
      const subject = `📩 New Contact Request from ${name}`;
      const emailBody = `
        <p><strong>Dear Admin,</strong></p>
        <p>You have received a new contact inquiry from <strong>Nifty Orbit</strong>!</p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Message:</strong> ${message}</li>
          <li><strong>Phone:</strong> ${phoneno}</li>
          <li><strong>Submitted On:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <hr />
        <p><em>This is an automated email. No reply is needed.</em></p>
      `;
  
      const emailResponse = await sendEmail(email,process.env.MAIL_USER, subject, emailBody);
      res.status(200).json({ success: true, emailResponse });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  };
  module.exports = { handleContactRequest};