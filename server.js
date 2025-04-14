var express = require('express');
const app = express();
const db = require('./models');
const cookieParser =require('cookie-parser');
const authRoutes = require('./routes/auth')
const categoryRoutes = require('./routes/categoryRoutes');
require('dotenv').config();
app.use(express.json());
app.use('/categories', categoryRoutes);
app.use('/auth', authRoutes);


db.sequelize.sync({ alter:true}).then(()=>{
    console.log('Database Synced');
}).catch(err=>{
    console.log(`Synced Error: ${err}`);
})
 
app.get('/', function(req,res){
    res.send('Hello World!');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, ()=>console.log(`Server is running on port ${PORT}`));