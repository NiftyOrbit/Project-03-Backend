

module.exports = (sequelize, DataTypes) => {
    const category = sequelize.define('category',{
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement: true
        },
        name:{
            type:DataTypes.STRING
    
        }});
        category.associate = (models) => {
            category.hasMany(models.brandcategory, { foreignKey: 'categoryId', as: 'brandcategory' });
      
          };
          
        return category;
    }