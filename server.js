var express = require('express');
const app = express();
const db = require('./models');
const authRoutes = require('./routes/auth')
var cors = require('cors');
const productRoutes = require('./routes/productRoutes')
const categoryRoutes = require('./routes/categoryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const brandRoutes = require('./routes/brandRoutes');
require('dotenv').config();
app.use(express.json());
app.use('/categories',cors(), categoryRoutes);
app.use('/products',cors(), productRoutes);
app.use('/auth',cors(), authRoutes);
app.use('/brand',cors(), brandRoutes);
app.use('/data',cors(),uploadRoutes );


console.log(db);
db.sequelize.sync({ alter:true}).then(() => {
    return db.brandcategory.sync(); // explicitly recreate missing table
  }).then(()=>{
    console.log('Database Synced');
}).catch(err=>{
    console.log(`Synced Error: ${err}`);
})
 
app.get('/', function(req,res){
    res.send('Hello World!');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, ()=>console.log(`Server is running on port ${PORT}`));