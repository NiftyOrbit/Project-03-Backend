const { brand, category, subcategory } = require(".");

module.exports = (sequelize, DataTypes) => {
  const brandcategory = sequelize.define('brandcategory', {
    id:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement: true
  },
    brandId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subcategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });
  brandcategory.associate = (models) => {
    brandcategory.hasMany(models.product, {
      foreignKey: 'brandcategoryId',
      as: 'product'
    });

    brandcategory.belongsTo(models.brand, {
      foreignKey: 'brandId',
      as: 'brand',
      onDelete: 'CASCADE',  // optional: handle deletion behavior
      onUpdate: 'CASCADE' 
    });
    brandcategory.belongsTo(models.category, {
      foreignKey: 'categoryId',
      as: 'category'
    });
    brandcategory.belongsTo(models.subcategory, {
      foreignKey: 'subcategoryId',
      as: 'subcategory'
    });
  };


 

  return brandcategory;
};
