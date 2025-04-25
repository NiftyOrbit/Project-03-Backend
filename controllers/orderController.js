const { User, Shipment, Payment, Order, OrderItem, Cart, ActivityLog, product } = require('../models'); // Import models
const bcrypt = require('bcrypt');

// Checkout controller method
const checkout = async (req, res, next) => {

  try {
    // Find or create the user
    let user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      const hashedpass = await bcrypt.hash(req.body.password, 10);
      user = await User.create({
        name: req.body.name,
        phoneno: req.body.phoneNumber,
        email: req.body.email,
        password: hashedpass,  // Assuming password is hashed already
      });
    }
    console.log(`User created: ${user.name}`);

    // Create shipment record
    const shipment = await Shipment.create({
        shippingAddress: req.body.shippingAddress,
        shippingCity: req.body.shippingCity,
        shippingCountry: req.body.shippingCountry,
        shippingState: req.body.shippingState,
        shippingCompany: req.body.shippingCompany,
        shippingPhone: req.body.shippingPhone,
        shippingName: req.body.shippingName,
        billingName: req.body.billingName,
        billingAddress: req.body.billingAddress,
        billingCity: req.body.billingCity,
        billingState: req.body.billingState,
        billingCompany: req.body.billingCompany,
        billingPhone: req.body.billingPhone,
        billingCountry: req.body.billingCountry,
      });

    // Process payment
    const payment = await Payment.create({
      userId: user.id,
      payment_method: 'card',
      payment_name: req.body.payment_name,
      amount: req.body.orderDetails.total,
      card_number: req.body.cardNumber,
      cardCVC: req.body.cardCVC,
      cardExpire: req.body.cardExpiry,
    });
    console.log(`Payment created: ${payment.amount}`);

    // Prepare cart items (directly from request)
    const cartItems = req.body.orderDetails.items.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
      condition: item.condition,
    }));

    // Create order
    const order = await Order.create({
      userId: user.id,
      order_status: 'PENDING',
      shipment_id: shipment.shipment_id,
      subtotal: req.body.orderDetails.subtotal,
      shipping_cost: req.body.orderDetails.shipping,
      tax: req.body.orderDetails.tax,
      total_price: req.body.orderDetails.total,
      payment_id: payment.payment_id,
      
    });
    //await order.reload(); // Ensure you get the full object

    console.log(`Order created: ${order.order_id}`);


    // Create order items and update product stock
    for (const item of cartItems) {
      const products = await product.findOne({ where: { product_id: item.product_id } });

      if (!products) {
        res.status(404).json({err: `${item.product_id} not found`});
      }
      if (products.quantity < item.quantity) {
        res.status(404).json({err: `Not enough stock for product: ${item.product_id}`});
      }

      // Reduce stock
      products.quantity -= item.quantity;
      await products.save(products);
console.log(order.id)
      // Create order item
      await OrderItem.create({
        orderId: order.order_id,
        productId: item.product_id,
        quantity: item.quantity,
        price: item.price,
        condition: item.condition,
      });
      console.log(`Order Item has been created`)
    }

    // Log activity
    await ActivityLog.create({
      user_email: user.email,
      order_id: order.order_id,
      activity: 'Order created',
      details: {
        order_id: order.order_id,
        email: user.email,
        phoneNumber: user.phoneno,
        firstName: user.first_name,
        amount: order.total_price,
        shippingName: shipment.shippingName,
        shippingPhone: shipment.shippingPhone,
        shippingAddress: shipment.shippingAddress,
        shippingCity: shipment.shippingCity,
        shippingState: shipment.shippingState,
        shippingCountry: shipment.shippingCountry,
        billingName: shipment.billingName,
        billingCompany: shipment.billingCompany,
        billingPhone: shipment.billingPhone,
        billingAddress: shipment.billingAddress,
        billingCity: shipment.billingCity,
        billingState: shipment.billingState,
        billingCountry: shipment.billingCountry,
        orderDetails: {
          items: cartItems,
          subtotal: order.subtotal,
          shipping: order.shipping_cost,
          tax: order.tax,
          total: order.total_price,
        },
      },
    });

    // Respond with order details
    return res.status(201).json({
      orderId: order.order_id,
      email: user.email,
      phoneNumber: user.phoneno,
      Name: user.first_name,
      amount: order.total_price,
      cardExpiry: payment.cardExpire,
      AmountPaidBy: payment.payment_name,
      shippingDetails: shipment,
      billingDetails: shipment,
      paymentMethod: payment.payment_method,
      orderDetails: {
        items: cartItems,
        subtotal: order.subtotal,
        shipping: order.shipping_cost,
        tax: order.tax,
        total: order.total_price,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: Shipment,
          as: 'shipment',
        },
        {
          model: User,
          as: 'user',
        },
        {
          model: Payment,
          as: 'payment',
        },
        {
          model: OrderItem,
          as: 'orderItem',
        }
      ]
    });

    const formattedOrders = orders.map(order => {
      const shipment = order.shipment;
      const user = order.user;
      const payment = order.payment;
      const items = order.orderItem;
      console.log(shipment, payment)

      return {
        orderId: order.order_id,
        order_status: order.order_status,
        email: user?.email ?? null,
        phoneNumber: user?.phoneno ?? null,
        Name: user?.name ?? null,
        amount: order.total_price,
        cardExpiry: payment?.cardExpire ?? null,
        AmountPaidBy: payment?.payment_name ?? null,

        // Shipping Details
        shippingName: shipment?.shippingName ?? null,
        shippingCompany: shipment?.shippingCompany ?? null,
        shippingPhone: shipment?.shippingPhone ?? null,
        shippingAddress: shipment?.shippingAddress ?? null,
        shippingCity: shipment?.shippingCity ?? null,
        shippingState: shipment?.shippingState ?? null,
        shippingCountry: shipment?.shippingCountry ?? null,

        // Billing Details
        billingName: shipment?.billingName ?? null,
        billingCompany: shipment?.billingCompany ?? null,
        billingPhone: shipment?.billingPhone ?? null,
        billingAddress: shipment?.billingAddress ?? null,
        billingCity: shipment?.billingCity ?? null,
        billingState: shipment?.billingState ?? null,
        billingCountry: shipment?.billingCountry ?? null,

        // Order Details
        orderDetails: {
          items: items ?? [],
          subtotal: order.subtotal,
          shipping: order.shipping_cost,
          tax: order.tax,
          total: order.total_price,
        }
      };
    });

    return res.status(200).json(formattedOrders);
  } catch (error) {
    next(error);
  }
};
const trackProgress = async (req, res) => {
  try {
    const { email, orderId } = req.query;
    console.log(email, orderId);
    //const orderId = parseInt(req.params.orderId);
    if (!email || isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid email or order ID' });
    }


    const order = await Order.findOne({
      where: {
        order_id: orderId,
      },
      include: [
        {
          model: User,
          as: 'user',
          where: { email: email },
          attributes: ['name', 'email']
        },
        {
          model: OrderItem,
          as: 'orderItem',
          include: [
            {
              model: product,
              as: 'product',
              attributes: ['part_number', 'condition']
            }
          ]
        },
        {
          model: Shipment,
          as: 'shipment',
          attributes: ['shippingMethod', 'shippingDate', 'shippingPhone', 'shippingAddress']
        },
        {
          model: Payment,
          as: 'payment',
          attributes: ['payment_method']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json({
      items: order.orderItem.map(item => ({
        item: item.product?.part_number,
        condition: item.product?.condition,
        quantity: item.quantity,
      })),
      shippingMethod: order.shipment?.shippingMethod || 'N/A',
      shippingDate: order.shipment?.shippingDate || 'N/A',
      shippingPhone: order.shipment?.shippingPhone || 'N/A',
      shippingAddress: order.shipment?.shippingAddress || 'N/A',
      paymentMethod: order.payment?.payment_method || 'N/A',
      orderDate: order.created_at,
      orderId: order.order_id,
      orderstatus: order.order_status,
      leadTime: order.leadtime,
      orderPlacedBy: order.user.name,
      amountPaid: order.total_price
    });


  } catch (error) {
    console.error('Track Progress Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  const { order_id, order_status, leadTime, shippingMethod, shippingDate } = req.body;

  try {
    // Find order including shipment
    const order = await Order.findOne({
      where: { order_id },
      include: [
        {
          model: Shipment,
          as: 'shipment',
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const changes = {};

    // Update order status
    if (order_status && order.order_status !== order_status) {
      changes.order_status = order_status;
      order.order_status = order_status;
    }

    // Update leadTime
    if (leadTime) {
      const newLeadTime = new Date(leadTime);
      if (isNaN(newLeadTime.getTime())) {
        return res.status(400).json({ error: 'Invalid leadTime format. Expected YYYY-MM-DD.' });
      }
      changes.leadTime = newLeadTime;
      order.leadtime = newLeadTime;
    }

    // Check for shipment and update shipment fields
    if (order.shipment) {
      if (shippingMethod && order.shipment.shippingMethod !== shippingMethod) {
        changes.shippingMethod = shippingMethod;
        order.shipment.shippingMethod = shippingMethod;
      }

      if (shippingDate && order.shipment.shippingDate !== shippingDate) {
        changes.shippingDate = shippingDate;
        order.shipment.shippingDate = shippingDate;
      }

      // Save shipment separately if updated
      await order.shipment.save();
    } else {
      return res.status(404).json({ error: 'Shipment details not found' });
    }

    // Save order changes
    await order.save();

    res.json({ message: 'Order updated successfully', changes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
// controllers/orderController.js

const trackOrders = async (req, res) => {
  const { email } = req.query;
  if (!email ) {
    return res.status(400).json({ message: 'Invalid email' });
  }
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'user',
          where: { email },
          attributes: ['name'],
        },
        {
          model: OrderItem,
          as: 'orderItem',
          include: [
            {
              model: product,
              as: 'product',
              attributes: ['part_number', 'condition'],
            },
          ],
        },
        {
          model: Shipment,
          as: 'shipment',
        },
        {
          model: Payment,
          as: 'payment',
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: 'No orders found for this email' });
    }

    const formatted = orders.map(order => ({
      orderId: order.order_id,
      orderStatus: order.order_status,
      orderDate: order.createdAt,
      leadTime: order.leadtime,
      orderPlacedBy: order.user.name,
      amountPaid: order.total_price,
      shippingMethod: order.shipment?.shippingMethod || 'N/A',
      shippingPhone: order.shipment?.shippingPhone || 'N/A',
      shippingAddress: order.shipment?.shippingAddress || 'N/A',
      shippingDate: order.shipment?.shippingDate || 'N/A',
      paymentMethod: order.payment?.payment_method || 'N/A',
      items: order.orderItem.map(item => ({
        item: item.product.part_number,
        condition: item.product.condition,
        quantity: item.quantity,
      })),
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
const deleteOrder = async (req, res) => {
  const { orderId } = req.query;
  const order = await Order.findOne({ where: { order_id: orderId } });

  if (!order) {
    throw new Error(`Order with ID ${orderId} not found`);
  }

  await order.destroy();

  
    res.status(200).json({ success: true,
      message: `Order ${orderId} deleted successfully`, });
};








module.exports = { checkout,getAllOrders, trackProgress, updateOrderStatus, trackOrders, deleteOrder };
