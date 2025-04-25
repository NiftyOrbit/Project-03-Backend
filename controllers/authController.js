const { User, passwordReset, ActivityLog } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');
const { OAuth2Client } = require('google-auth-library');
const { sendEmail } = require('../utils/email');
const { where } = require('sequelize');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)


exports.register = async(req, res)=>{
    const { email, password, name, phoneno } = req.body;
    try {
        const exit = await User.findOne({where: {email}})
        if(exit){
            return res.status(400).json({message: 'Email already exists'})
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({email, password: hashedPassword, name, phoneno});
        res.status(201).json({message: 'User Register', user});
        const activitylog = await ActivityLog.create({
            user_email: user.email,
            activity: 'User Created',
            details: {
                user_name: user.name,
                user_phoneno: user.phoneno,
              email: user.email,
              timestamp: new Date() },});
              console.log(activitylog);     
        const subject = '📩 New User Registration';
        const emailBody =  `
        <p><strong>Dear Admin,</strong></p>
        <p>A new user has successfully registered on <strong>Nifty Orbit</strong>! 🎉</p>
        <ul>
          <li><strong>Name:</strong> ${createUserDto.name}</li>
          <li><strong>Email:</strong> ${createUserDto.email}</li>
          <li><strong>Registration Date:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <p>Please review the new user details in the system.</p>
        <hr />
        <p><em>This is an automated email. No reply is needed.</em></p>
        <p>Best regards,</p>
        <p><strong>Nifty Orbit</strong></p>
      `;
      await this.mailerService.sendEmail(
        user.email,
        process.env.MAIL_USER,
        subject,
        emailBody
  
      );
      
    }catch(err){
        res.status(500).json({ error: err.message})
    }};

exports.login = async(req,res)=>{
    const{ email, password} = req.body;
    try{
        const user = await User.findOne({where: {email}});
        if(!user){
            return res.status(400).json({message: 'User not found'})
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({ message: 'Invalid password'});
        }
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        user.refreshtoken = refreshToken;
        await user.save();
        
        res.json({ accessToken, refreshToken});
        await ActivityLog.create({
            user_email: user.email,
            activity: 'User Login',
            details: {
                user_name: user.name,
              email: user.email,
              timestamp: new Date() },});
     


    }catch(err){
        res.status(500).json({error: err.message})

    }
}

exports.googleLogin = async(req, res) => {
    const{tokenId}  = req.body;
    try{
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,})

            const {email, sub: googleId} = ticket.getPayload();
            const user = await User.findOne({where: {email}});
            if(!user){
                const hashedPassword = await bcrypt.hash(googleId, 10);
                const user = await User.create({email, password: hashedPassword, name:googleId});
                res.status(201).json({message: 'User Register', user});
                }
                const accessToken = generateAccessToken(user);
                const refreshToken = generateRefreshToken(user);
                user.refreshtoken = refreshToken;
                await user.save();
                res.json({ accessToken, refreshToken});}
                catch(err){
                    res.status(401).json({ err: err.message})
                }
}
exports.forgePassword = async(req, res) =>{
    const{email} = req.body;
    try{
        const user = await User.findOne({where: {email}});
        if(!user){
            return res.status(404).json({ err: " User Not Found"})
        }

        const otp = Math.floor(10000 + Math.random() * 90000);
        const ExpireAt = new Date(Date.now() +10*60*1000);
        console.log({
            email,
            otp: otp,
            otpType: typeof otp.toString(),
            expireAt: ExpireAt
          });
          
        await passwordReset.create({ email, 
            otp: otp.toString(),
             expireAt: ExpireAt });
             const subject = '📩 Your OTP Code';
const emailBody = `
<p><strong>Dear User,</strong></p>
<p>Your One-Time Password (OTP) for verification on <strong>Nifty Orbit</strong> is:</p>
<h2 style="color: #007BFF; text-align: center;">${otp}</h2>
<p>This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>
<p>If you did not request this OTP, please ignore this email.</p>
<hr />
<p><em>This is an automated email. No reply is needed.</em></p>
<p>Best regards,</p>
<p><strong>Nifty Orbit</strong></p>
`;

        await sendEmail(
         process.env.EMAIL_USER,
         email,
         subject,
        emailBody)
        res.json({
            message: 'OTP sent to  email',
        })
        
  
    }catch(err){
        res.status(500).json({error: err.message})
    }

}
exports.verifyOtp = async(req, res) =>{
    const {email, otp} = req.body;
    try{
        const record = await passwordReset.findOne({where: {email, otp}, order:[['createdAt', 'DESC']]});
        if(!otp){
            return res.status(404).json({ err: " OTP Not Found"})
        }
        if(!record || new Date() > record.expireAt){
            return res.status(400).json({error: ' OTP  Expired'})
        }
        if(record.otp !== otp){
            return res.status(400).json({error: 'Invalid OTP'})
        }
        res.status(200).json({message: "OTP Verified"})}catch(err){
            res.status(500).json({error: err.message})
}}
exports.resetPassword = async(req, res) =>{
    const {email, password} = req.body;
    try{
        const user = await User.findOne({where: {email}});
        if(!user){
            return res.status(404).json({ err: " User Not Found"})
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
            await user.save();
            await passwordReset.destroy({where:{email: email}});
            res.json({message: "Password Reset Successfully"})
            await ActivityLog.create({
                  user_email: user.email,
                  activity: 'Password Reset',
                  details: {
                    user: user.email,
                    timestamp: new Date()

                   
                  },
                });

    }catch(err){
        res.status(500).json({error: err.message})
    }
}

exports.updateUserRole = async (req, res) => {
  const { email, newRole } = req.body;

  if (!email || !newRole) {
    return res.status(400).json({ message: 'Email and newRole are required' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = newRole;
    await user.save();

    return res.json({
      success: true,
      message: `User role updated to '${newRole}' successfully.`,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
};

