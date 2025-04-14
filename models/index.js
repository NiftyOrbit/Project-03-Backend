const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

// Import models and pass the sequelize instance
const User = require('./User')(sequelize, DataTypes);
const passwordReset = require('./passwordReset')(sequelize, DataTypes);


// Add all models to an object for easy access
const db = {};
db.sequelize = sequelize;
db.User = User;
db.passwordReset = passwordReset;

module.exports = db;
