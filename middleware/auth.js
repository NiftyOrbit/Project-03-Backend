const jwt = require('jsonwebtoken');
require('dotenv').config();



 exports.auth = (req, res, next)=>{
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token missing' });
    }
  
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
        } catch (ex) {
            res.status(400).send('Invalid token.');
            }
 }

 exports.authorize = (roles = [])=>{
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)){
            return res.status(403).send('Forbidden. You do not have permission to access this resource');
    }
    next();
};

 };

