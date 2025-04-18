

module.exports = (sequelize, DataTypes) => {
    const subcategory = sequelize.define('subcategory',{
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement: true
        },
        name:{
            type:DataTypes.STRING    
        }});
     
          
        return subcategory;
    }