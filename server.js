var express = require('express');
const app = express();
const db = require('./models');
const authRoutes = require('./routes/auth')
var cors = require('cors');
const productRoutes = require('./routes/productRoutes')
const categoryRoutes = require('./routes/categoryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const brandRoutes = require('./routes/brandRoutes');
const orderRoutes = require('./routes/orderRoutes');
const ActivityLog = require('./routes/acitivityLogsRoutes')
const adminReqRoutes = require('./routes/adminRequestRoutes');
const quoteRoutes = require('./routes/qouteRoutes');
const contactRoutes = require('./routes/contantRoutes');
const newsLetterRoutes = require('./routes/newsLetterRoutes');
require('dotenv').config();
app.use(express.json());
app.use('/categories',cors(), categoryRoutes);
app.use('/data',cors(), uploadRoutes);
app.use('',cors(), ActivityLog);
app.use('/products',cors(), productRoutes);
app.use('/auth',cors(), authRoutes);
app.use('/admin-requets',cors(), adminReqRoutes);
app.use('', cors(), contactRoutes);
app.use('/brand',cors(), brandRoutes);
app.use('',cors(), orderRoutes);
app.use('', cors(), newsLetterRoutes);
app.use('', cors(), quoteRoutes);


console.log(db);
db.sequelize.sync({ alter:true, logging: console.log
  }).then(()=>{
    return db.product.sync();

  }).then(()=>{
    console.log('Database all table  Synced');
}).catch(err=>{
    console.log(`Synced Error: ${err}`);
})
 
app.get('/', function(req,res){
    res.send('Hello World!');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, ()=>console.log(`Server is running on port ${PORT}`));