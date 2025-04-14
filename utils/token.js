const jwt = require('jsonwebtoken')

exports.generateAccessToken = (user) =>{
    return jwt.sign(
        {id: user.id, email: user.email},
        process.env.JWT_SECRET,
        {expiresIn: '1h'}
    );

};

exports.generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1h' }
    );
};

