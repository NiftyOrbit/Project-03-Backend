const nodemailer = require('nodemailer');

exports.sendEmail = async(from,to ,subject, body) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // or 'STARTTLS'
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
            }
            });
            await transporter.sendMail({
                from: from,
                to: to,
                subject: subject,
                text: body
                }, (err, info)=>{
                    if(err){
                        console.error('Email error:', err);
                    }else{
                        console.log('Email sent: ' + info.response);
                    }
                });};