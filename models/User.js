

module.exports = (sequelize, DataTypes) => {
const User = sequelize.define('user',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement: true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false,

    },
    email:{
        type:DataTypes.STRING,
        unique:true,
        allowNull:false,
    },
    phoneno:{

        type:DataTypes.STRING,
        allowNull:false,

    },
    password:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    role:{
        type:DataTypes.ENUM('admin','user'),
        defaultValue:'user',
    },
    refreshtoken:{
        type:DataTypes.TEXT,
        allowNull:true
    }});
    return User;
}