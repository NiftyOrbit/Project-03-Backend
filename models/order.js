module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', {
      order_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      order_status: { type: DataTypes.STRING, allowNull: false },
      subtotal: { type: DataTypes.DECIMAL, allowNull: false },
      shipping_cost: { type: DataTypes.DECIMAL, allowNull: false },
      tax: { type: DataTypes.DECIMAL, allowNull: false },
      total_price: { type: DataTypes.DECIMAL, allowNull: false },
      leadtime: {
        type: DataTypes.DATEONLY,
        allowNull:true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    });
  
    Order.associate = (models) => {
      Order.belongsTo(models.User, { foreignKey: 'userId' });
      Order.hasOne(models.Shipment, {
        foreignKey: 'shipment_id',
        as: 'shipment',
      });
    Order.belongsTo(models.Payment, { foreignKey: 'payment_id', as: 'payment' });
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'orderItem' });
      Order.hasMany(models.ActivityLog, { foreignKey: 'order_id'});

    };
  
    return Order;
  };
  