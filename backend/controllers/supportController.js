const nodemailer = require('../config/nodemailer');

// Send support email
const sendSupportEmail = async (req, res) => {
  try {
    const { to, from, subject, text } = req.body;

    // Validate input
    if (!to || !from || !subject || !text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send email
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@yourrestaurant.com',
      to: to,
      subject: subject,
      text: text
    };

    const info = await nodemailer.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    
    res.json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  sendSupportEmail
};