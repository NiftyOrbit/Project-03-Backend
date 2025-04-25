const { ActivityLog, Newsletter } = require('../models');
const { sendEmail } = require('../utils/email');

const handleNewsletterSubscription = async (req, res) => {
  const { email } = req.body;
  try {
       const newsletter =   await Newsletter.create({ email });

     await ActivityLog.create({
      user_email: email,
      activity: 'New Newsletter Subscription',
      details: { email },
    });

    const subject = '📩 New Newsletter Subscription Alert';
    const emailBody = `
      <p><strong>Dear Admin,</strong></p>
      <p>A new user has subscribed to the <strong>Nifty Orbit Newsletter</strong>! 🎉</p>
      <ul><li><strong>Email:</strong> ${email}</li></ul>
      <p><em>This is an automated email.</em></p>
    `;

    const emailResponse = await sendEmail(email,process.env.MAIL_USER, subject, emailBody);
    console.log('Email response:', emailResponse);
    res.status(200).json({ success: true, newsletter });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

module.exports = { handleNewsletterSubscription};