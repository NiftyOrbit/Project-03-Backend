const { brandcategory } = require(".");


module.exports = (sequelize, DataTypes) => {
    const product = sequelize.define('product',{
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement: true
        },
        partnumber:{
            type:DataTypes.STRING,
    
        },
        longdescription:{
            type:DataTypes.TEXT,
        },
        image:{
            type:DataTypes.STRING,
            allowNull:false
        },
        condition:{
            type:DataTypes.STRING,
        },
        subcondition:{
            type:DataTypes.STRING,

        },
        price:{
            type:DataTypes.DECIMAL(10,2),
            allowNull:false
        },
        quantity:{
            type:DataTypes.INTEGER,
            
        },
        shortdescription:{
            type: DataTypes.TEXT,
        },
        status:{
            type:DataTypes.STRING,
            allowNull:false
        },brandcategoryId: {
            type: DataTypes.INTEGER,
            allowNull: true
          }
       


    });
    product.associate = (models) => {
        product.belongsTo(models.brandcategory, { foreignKey: 'brandcategoryId', as: 'brandcategory' });
  
      };
        return product;
    }