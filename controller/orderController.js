const Order = require("../model/orderModel")
const User = require("../model/userModel")
const Product = require("../model/productModel")
const Cart = require("../model/cartModel")
require('dotenv').config();
const Category = require("../model/categoryModel")
const Address = require("../model/AddressModel")
const Wallet = require("../model/walletModel")
const Razorpay = require("razorpay");
const Wishlist = require("../model/wishlistModel");
const Coupon = require("../model/couponModel");
require('dotenv').config();

const RazorPayInstance = new Razorpay({
  key_id: process.env.YOUR_ID_KEY,
  key_secret:process.env.YOUR_SECRET_KEY
 
});

const calculateOrderPrice = (products) =>{
  return products.reduce((total , product)=> total + product.price,0)
}

const loadCheckOut = async(req,res)=>{
    try {
        const user_id = req.session.user_id
        const cart = await Cart.find({ user_id: user_id })
        const productId = cart.map((cart)=> cart.product_id)
        const products = await Product.find({ _id:{ $in : productId}})
        const cartCount = await Cart.countDocuments({ user_id : user_id })
        const address = await Address.find({ user_id : user_id })
        const wallet = await Wallet.find({ userId : user_id })
        const coupon = await Coupon.find({ })

        res.render("checkOut",{
            products,
            cartCount,
            cart,
            address,
            coupon,
            wallet
        })
    } catch (error) {
        console.log(error.message);
    }
}
const CashOnDelivery = async(req,res)=>{
    try {
        const user_id = req.session.user_id;
        const formData = req.body.formData;
        const totalPrice = req.body.totalPrice;
        const couponCode = req.body.formData.couponCode;
        const { address , payment } = formData
        const addressData = await Address.findById({ _id:address })
        const cartItem = await Cart.find({ user_id : user_id })
        const product = cartItem.map((item)=>({
            productId : item.product_id,
            quantity : item.quantity,
            price : item.totalPrice
        }))
        if (totalPrice >= 1000) {
          return res.status(400).json({
              success: false,
              message: "Cash On Delivery is only available for orders under 1000 rupees.",
          });
      }

        const order = new Order({
            user : user_id,
            address:{
                city:addressData.city,
                zipcode:addressData.zipcode,
                streetAddress : addressData.streetAddress
            },
            products : product.map((product)=>({
                productId : product.productId,
                quantity : product.quantity,
                price : product.price,
            })),
            status : "Pending",
            payment : payment,
            totalPrice : totalPrice,  
        })

        
        if (order) {
          await order.save();

          for (const product of order.products) {
              const productId = product.productId;
              const orderedQuantity = product.quantity;

              // Find and update the product quantity
              const productData = await Product.findById(productId);
              if (!productData) {
                  // Handle the case where the product is not found
                  return res.status(404).json({
                      success: false,
                      message: `Product with ID ${productId} not found.`,
                  });
              }

              const updateQuantity = productData.quantity - orderedQuantity;

              await Product.findByIdAndUpdate(productId, { quantity: updateQuantity });
          }

            await Cart.deleteMany({ user_id : user_id })
           if (couponCode) {
                await Coupon.findOneAndUpdate(
                { code : couponCode },
                { $push: { usedCoupon: { user_id:  user_id } } },

                { new : true }
              )
           }
            res.status(200).json({
                success : true
          })
            await Wishlist.deleteMany({ user_id : user_id }),
            res.status(200).json({
              success : true
            })
        }    
      


    } catch (error) {
        console.log(error.message);
    }
}

//================================ ORDER SUCCESSFULL ===============================================//
//====================================== CANCEL ORDER ==================================================//

  const orderCancel = async (req, res) => {
      try {
        const { orderId } = req.params;
        const user_id = req.session.user_id;
        
        const orderExists = await Order.findOne({
          _id: orderId, 
        });
       
        if (!orderExists) {
          return res.status(404).json({ message: "Order not found" });
        }

        for (const product of orderExists.products) {
          const updatedProduct = await Product.findOneAndUpdate(
            { _id: product.productId },
            { $inc: { quantity: product.quantity } },
            { new: true }
          );
    
          if (!updatedProduct) {
            return res
              .status(500)
              .json({ success: false, message: "Error updating product quantity" });
          }
        }
        
        let userWallet = await Wallet.findOne({ userId : user_id })
    
        if (!userWallet) {
          userWallet = await Wallet.create({
              userId: user_id,
              balance: 0, // Set initial balance as needed
              transactions: [],
              date: Date.now(),
          });
      }
       
        if (orderExists.payment !== "Cash on Delivery") {
            const refundAmount = calculateOrderPrice(orderExists.products)
          
            const updatedWallet = await Wallet.findOneAndUpdate(
              { userId : user_id },
              {
                $inc : { balance : refundAmount },
                $push : {
                  transactions : {
                    amount : refundAmount,
                    transactionType : "credit",
                    date : Date.now()
                  }
                }
              },
              { new : true }
            );

            if (!updatedWallet) {
              return res.status(500).json({ success : false , message : "Error in updating your Wallet..."})
            }
          } 
          
          
        orderExists.status = "Cancelled"
        const updated = await orderExists.save();
        
        if (updated) {
        
          return res.status(200).json({ message: "Order modified" });
        } else {
          
          return res.status(400).json({ message: "Order not modified" });
        }
        
      } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal Server Error" });
      }
    };

  //=============================load Admin order management======================================//

  const loadAdminOrderManagement = async(req,res)=>{
    try {
      const order = await Order.find({}).populate("user")
      res.render("orderManagement",{
        order
      })
    } catch (error) {
      console.log(error.message);
    } 
  }
  
  const loadAdnimOrderveiw = async(req,res)=>{
    try {
      
        const orderId = req.params.orderId;
       
        const orderData = await Order.findById(orderId).populate("user")
        .populate("products.productId")

        res.render("adminOrderView",{
          order : orderData,
         
        })

    } catch (error) {
      console.log(error.message);
    }

  }

  const AdminUpdateOrderStats = async(req,res)=>{
    try {
      const { orderId } = req.params
      const { newStatus } = req.body

      const orderData = await Order.findOne({ _id : orderId })
      
      if (!orderData) {
        res.status(404).json({ message : "product Not Found...!" })
      }

      orderData.status = newStatus
      const updateStatus = await orderData.save()

      if (updateStatus) {
        res.redirect("/admin/products/products-orders")
      }
      
    } catch (error) {
      console.log(error.message);
    }
  }
  const razorPayPayment = async(req,res)=>{
    try {
      const formData = req.body.formData
      const totalPrice = req.body.totalPrice
      const user_id = req.session.user_id

     
      const options = {
        amount : totalPrice * 100,
        currency : "INR",
        receipt : "order_receipt"
      }
    
      RazorPayInstance.orders.create(options, function (err, order) {
        if (!err) {
          res.status(200).send({
            success: true,
            message: "Order Created",
            order_id: order._id,
            amount: totalPrice * 100,
            key_id: process.env.YOUR_ID_KEY, // Use order.key_id instead of process.env.YOUR_ID_KEY
            productName: req.body.name,
            contact: "9845738493",
            name: "Muhammed Farsin",
            email: "farsin@gmail.com",
            formData,
          });
        
        } else {
          res.status(500).json({ success: false, message: " Payment Failed...! " });
        }
      });
      
    } catch (error) {
      console.log(error.message);
    }
  }
  const razorpaySuccessfullOrder = async(req,res)=>{
    try {
      const user_id = req.session.user_id;
      const { address } = req.body.formData
      const couponCode = req.body.formData.couponCode;
      const payment = req.body.paymentMethod
      const totalPrice = req.body.totalPrice

      const cartItem = await Cart.find({ user_id : user_id })
      const addressData = await Address.findById({ _id : address })

      const product = cartItem.map((item)=>({
        productId : item.product_id,
        quantity : item.quantity,
        price : item.totalPrice
      }))

      const order = new Order({
        user : user_id,
        address : {

          city : addressData.city,
          zipcode : addressData.zipcode,
          streetAddress : addressData.streetAddress

        },

        products : product.map((product)=>({

          productId : product.productId,
          quantity : product.quantity,
          price : product.price

        })),

        status : "Pending",
        payment : payment,
        totalPrice : totalPrice

      })

      if (order) {
        await order.save();

        for (const product of order.products) {
            const productId = product.productId;
            const orderedQuantity = product.quantity;

            // Find and update the product quantity
            const productData = await Product.findById(productId);
            if (!productData) {
                // Handle the case where the product is not found
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${productId} not found.`,
                });
            }

            const updateQuantity = productData.quantity - orderedQuantity;

            await Product.findByIdAndUpdate(productId, { quantity: updateQuantity });
        }

          await Cart.deleteMany({ user_id : user_id });
          res.status(200).json({
            success: true
        });
        
        if (couponCode) {
          await Coupon.findOneAndUpdate(
          { code : couponCode },
          { $push: { usedCoupon: { user_id:  user_id } } },

          { new : true }
        )
     }
      
      await Wishlist.deleteMany({ user_id: user_id }); // Fix the misplaced comma
      res.status(200).json({
          success: true
      });
      }  
    } catch (error) {
      console.log(error.message);
    }
  } 
const WalletPlaceOrder = async(req,res)=>{
  try {
    const user_id = req.session.user_id;
    const formData = req.body.formData;
    const totalPrice = req.body.totalPrice;
    const couponCode = req.body.formData.couponCode;
    const { address } = formData;
    const payment = req.body.paymentMethod
    const addressData = await Address.findById({ _id : address })
    const cartItem = await Cart.find({ user_id : user_id })
    const product = cartItem.map((item)=>({
      productId : item.product_id,
      quantity : item.quantity,
      price : item.totalPrice
    }))
    let walletData = await Wallet.findOne({ userId: user_id });

    if (!walletData) {
        // If the user doesn't have a wallet, create one
        walletData = await Wallet.create({
            userId: user_id,
            balance: 0, // Set initial balance as needed
            transactions: [],
            date : Date.now()
        });
    }
    const orderTotal = calculateOrderPrice(product);

    if (walletData.balance < orderTotal) {
      return res.status(400).json({ success: false, message: "Insufficient Balance...!" });
    }

    const order = new Order({
      user : user_id,
      address:{
          city:addressData.city,
          zipcode:addressData.zipcode,
          streetAddress : addressData.streetAddress
      },
      products : product.map((product)=>({
          productId : product.productId,
          quantity : product.quantity,
          price : product.price,
      })),
      status : "Pending",
      payment : payment,
      totalPrice : totalPrice,  
  })
  
  if(order){
    await order.save();

        // Update wallet balance and add a transaction record
        walletData.balance -= orderTotal;

        walletData.transactions.push({
            amount: orderTotal,
            transactionType: "debit",
            date: Date.now(),
        });

        await walletData.save();
        for (const product of order.products) {
          const productId = product.productId;
          const orderedQuantity = product.quantity;

          // Find and update the product quantity
          const productData = await Product.findById(productId);
          if (!productData) {
              // Handle the case where the product is not found
              return res.status(404).json({
                  success: false,
                  message: `Product with ID ${productId} not found.`,
              });
          }

          const updateQuantity = productData.quantity - orderedQuantity;

          await Product.findByIdAndUpdate(productId, { quantity: updateQuantity });
      }
        // Clear the cart
        console.log(couponCode);
        await Cart.deleteMany({ user_id: user_id });
        if (couponCode) {
          await Coupon.findOneAndUpdate(
          { code : couponCode },
          { $push: { usedCoupon: { user_id:  user_id } } },

          { new : true }
        )
     }
      
      await Wishlist.deleteMany({ user_id: user_id }); // Fix the misplaced comma
      res.status(200).json({
          success: true
      });
  }  
    
  } catch (error) {
    console.log(error.message);
  }
}
const ReturnOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const user_id = req.session.user_id;
    
    const orderExists = await Order.findOne({
      _id: orderId, 
    });
   
    if (!orderExists) {
      return res.status(404).json({ message: "Order not found" });
    }
    let userWallet = await Wallet.findOne({ userId : user_id })

    if (!userWallet) {
      userWallet = await Wallet.create({
          userId: user_id,
          balance: 0, // Set initial balance as needed
          transactions: [],
          date: Date.now(),
      });
  }
   
    if (orderExists.payment !== "Cash on Delivery" && orderExists.status === "Completed") {
        const refundAmount = calculateOrderPrice(orderExists.products)
      
        const updatedWallet = await Wallet.findOneAndUpdate(
          { userId : user_id },
          {
            $inc : { balance : refundAmount },
            $push : {
              transactions : {
                amount : refundAmount,
                transactionType : "credit",
                date : Date.now()
              }
            }
          },
          { new : true }
        );

        if (!updatedWallet) {
          return res.status(500).json({ success : false , message : "Error in updating your Wallet..."})
        }
      } 
      
      
    orderExists.status = "Return"
    const updated = await orderExists.save();
    
    if (updated) {
    
      return res.status(200).json({ message: "Order modified" });
    } else {
      
      return res.status(400).json({ message: "Order not modified" });
    }
    
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//=================================ORDER SUCCESS================================================//

const orderSuccessfull = async(req,res)=>{
  try {
      res.render("orderCompleted")
  } catch (error) {
      console.log(error.message);
  }
}

const getInvoice = async(req,res)=>{
  try {
    const orderId = req.query.id
    const user_id = req.session.user_id


    const userData = await User.findById(user_id)

    const order = await Order.findOne({ _id : orderId , user : user_id })
    .populate('address').populate({
        path: 'products.productId',
    });
    
    res.render("invoicePage",{
      order,
      user : userData
    })
    
  } catch (error) {
    console.log(error.message);
  }
}


  
module.exports = {
    loadCheckOut,
    CashOnDelivery,
    orderSuccessfull,
    orderCancel,
    loadAdminOrderManagement,
    loadAdnimOrderveiw,
    AdminUpdateOrderStats,
    razorPayPayment,
    razorpaySuccessfullOrder,
    WalletPlaceOrder,
    ReturnOrder,
    getInvoice
}