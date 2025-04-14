const { User, passwordReset } = require('../models');
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
        await sendEmail(
         process.env.EMAIL_USER,
         email,
         'Reset Password OTP',
         `Your OTP is ${otp} and it will expire in 10 minutes`
           
        )
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

    }catch(err){
        res.status(500).json({error: err.message})
    }
}
