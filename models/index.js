const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

// Import models and pass the sequelize instance
const User = require('./User')(sequelize, DataTypes);
const passwordReset = require('./passwordReset')(sequelize, DataTypes);
const category = require('./category')(sequelize, DataTypes);
const brand = require('./brand')(sequelize, DataTypes);
const subcategory = require('./subcategory')(sequelize, DataTypes);
const product = require('./product')(sequelize, DataTypes);
 const brandcategory = require('./brandcategory')(sequelize, DataTypes);



// Add all models to an object for easy access
const db = {};
db.sequelize = sequelize;
db.User = User;
db.passwordReset = passwordReset;
 db.category = category;
db.brand = brand;
db.subcategory = subcategory;
db.product = product;
db.brandcategory = brandcategory;
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
  

module.exports = db;
