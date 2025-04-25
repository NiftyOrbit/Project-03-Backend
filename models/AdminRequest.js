module.exports = (sequelize, DataTypes) => {
    const AdminRequet = sequelize.define('AdminRequet', {
      admin_request_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      IsApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      user_email: {
        type: DataTypes.STRING,
        allowNull: true
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      updatedshippingAddress: {
        type: DataTypes.STRING,
        allowNull: true
      },
      updatedshippingPhone: {
        type: DataTypes.STRING,
        allowNull: true
      }
    }
    );
  
    AdminRequet.associate = (models) => {
      AdminRequet.hasMany(models.Order, {
        foreignKey: 'adminRequestId', // Make sure the FK matches in Order model
        sourceKey: 'admin_request_id',
        as: 'order'
      });
  
      AdminRequet.hasMany(models.User, {
        foreignKey: 'adminRequestId', // Ensure it's added in User model too
        sourceKey: 'user_email',
        as: 'user'
      });
    };
  
    return AdminRequet;
  };
  