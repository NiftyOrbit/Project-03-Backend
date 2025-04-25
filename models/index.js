const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');
const brandcategory = require('./brandcategory');

// Import models and pass the sequelize instance
const User = require('./User')(sequelize, DataTypes);
const passwordReset = require('./passwordReset')(sequelize, DataTypes);
const category = require('./category')(sequelize, DataTypes);
const brand = require('./brand')(sequelize, DataTypes);
const subcategory = require('./subcategory')(sequelize, DataTypes);
const product = require('./product')(sequelize, DataTypes);
const Order = require('./order')(sequelize, DataTypes);
const Contact = require('./Contact')(sequelize, DataTypes);
const Newsletter = require('./Newsletter')(sequelize, DataTypes);
const Shipment = require('./Shipment')(sequelize, DataTypes);
const OrderItem = require('./orderitem')(sequelize, DataTypes);
const ActivityLog = require('./ActivityLog')(sequelize, DataTypes);
const AdminRequest = require('./AdminRequest')(sequelize, DataTypes);
const Payment = require('./Payment')(sequelize, DataTypes);
const brandcategories  = require('./brandcategory')(sequelize, DataTypes);
const Quote = require('./Quote')(sequelize,DataTypes);


// Add all models to an object for easy access
const db = {};
db.sequelize = sequelize;
db.User = User;
db.Newsletter = Newsletter;
db.passwordReset = passwordReset;
db.category = category;
db.ActivityLog = ActivityLog;
db.Order = Order;
db.AdminRequest = AdminRequest;
db.Contact = Contact;
db.Payment = Payment;
db.Shipment = Shipment;
db.OrderItem = OrderItem;
db.brand = brand;
db.Quote = Quote;
db.subcategory = subcategory;
db.product = product;
db.brandcategory = brandcategories;
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });



module.exports = db;
