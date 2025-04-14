const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth')
const { register, login, googleLogin, forgePassword, verifyOtp, resetPassword } = require('../controllers/authController');
const { User } = require('../models');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const { generateAccessToken, generateRefreshToken } = require('../utils/token');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth,  (req, res) =>{
    res.json({ message: 'Access granted', user: req.user});
});
 router.post('/refresh-token', async(req, res)=>{
    const {refreshToken} = req.body;
    if(!refreshToken) return res.sendStatus(401);
    console.log(refreshToken);
    try{
        console.log("entered intry box")
        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        console.log(payload);
        const user = await User.findByPk(payload.id); 
        console.log('Stored refresh token:', user.refreshtoken);
        console.log('Received refresh token:', refreshToken);
        if(!user || user.refreshtoken !== refreshToken) {
            return res.sendStatus(403);
        }
   

        const newaccessToken = generateAccessToken(user);
        const newrefreshToken = generateRefreshToken(user);
            await user.update({ refreshtoken: newrefreshToken });

        res.json({
            accessToken: newaccessToken,
            refreshToken: newrefreshToken
        })


    }catch(err){
        return res.status(403).json({ error: err.message });
    }
})
router.post('/google-login', googleLogin);
router.post('/forget-password', forgePassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);


module.exports = router;    