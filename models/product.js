const { brandcategory } = require(".");


module.exports = (sequelize, DataTypes) => {
    const product = sequelize.define('product',{
        product_id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement: true
        },
        part_number:{
            type:DataTypes.STRING,
    
        },
        long_description:{
            type:DataTypes.TEXT,
        },
        image:{
            type:DataTypes.STRING,
            allowNull:false
        },
        condition:{
            type:DataTypes.STRING,
        },
        sub_condition:{
            type:DataTypes.STRING,

        },
        price:{
            type:DataTypes.FLOAT,
            allowNull:false
        },
        quantity:{
            type:DataTypes.INTEGER,
            
        },
        short_description:{
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
        product.hasMany(models.OrderItem, {
            foreignKey: 'productId',
            as: 'orderItem'
          });
  
      };
        return product;
    }