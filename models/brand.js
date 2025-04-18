const { brandcategory } = require(".");


module.exports = (sequelize, DataTypes) => {
    const brand = sequelize.define('brand',{
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement: true
        },
        name:{
            type:DataTypes.STRING
    
        }
        
    });

brand.associate = (models) => {
        brand.hasMany(models.brandcategory, { foreignKey: 'brandId', as: 'brandcategory' });
  
      };

    
          
        return brand;
    }