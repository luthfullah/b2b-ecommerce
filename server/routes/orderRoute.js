const express = require('express');
const orderModel = require('../models/orderModel');
const registerationModel = require('../models/registerationModel');
const { Op } = require('sequelize');
const verifyToken = require('../middlewares/verifyToken')
const orderItemsModel = require('../models/orderItemsModel');
const validateOrderItem = require('../middlewares/validatorOrderItem');
const router = express.Router();

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await orderModel.findAll({
      include: [
        {
          model: registerationModel,
          attributes: ['id', 'firstname', "lastname", "contactNumber", "email"],
        },
        {
          model: orderItemsModel,
          attributes: ['productId', 'quantity', 'priceIndividual'],
        },
      ],

    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error in order get' });
  }
});

// Add a new order
// router.post('/', verifyToken, async (req, res) => {
//   const {
//     //userId,
//     address,
//     totalPrice,
//     status,
//     discount,
//     paymentMethod,
//     trackingNumber,
//   } = req.body;

//   const userId = req.user.id.id;
//   // const address= req.user.id.address
//   const orderDate= req.user.id.createdAt
// // console.log(req.user);
//   try {
//     const newOrder = await orderModel.create({
//       userId,
//       address,
//       orderDate,
//       totalPrice,
//       status,
//       discount,
//       paymentMethod,
//       trackingNumber,
//     });
//     res.json(newOrder);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error in order post' });
//   }
// });

router.post('/', verifyToken, async (req, res) => {
  const { address, totalPrice, status, discount, paymentMethod, trackingNumber,
    name, email, contactNumber, zipCode, additionalInfo, city, country,
    orderItems } = req.body;
  //validator
  try {
    for (const cartItem of orderItems) {
      validateOrderItem(cartItem);
    }
  } catch (validationError) {
    return res.status(400).json({ error: validationError.message });
  }


  const userId = req.user.id.id;
  const orderDate = req.user.id.createdAt;
  console.log(orderItems);
  try {
    // Create a new order
    const order = await orderModel.create({
      userId, address, orderDate, totalPrice, status, discount, paymentMethod,
      trackingNumber, name, email, contactNumber, zipCode, additionalInfo, city, country
    });

    // Create order items associated with the order
    for (const cartItem of orderItems) {
      await orderItemsModel.create({
        orderId: order.orderId,
        shippingAddress: cartItem.shippingAddress,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        price: cartItem.price,
        discount: cartItem.discount,
        totalPrice: cartItem.totalPrice,
      });
    }

    res.json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error in order post' });
  }
});

module.exports = router;
