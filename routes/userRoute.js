const express = require('express')
const session = require('express-session')
const nocache = require('nocache')
const bodyparser = require ('body-parser')
const path = require("path")
const userController = require('../controller/userController')
const productController = require("../controller/productController")
const cartController = require('../controller/cartController')
const orderController = require("../controller/orderController")
const addressController = require("../controller/addressController")
const wishlistController = require("../controller/wishlistController")
const couponController = require("../controller/couponController")
const auth = require('../middleware/userAuth')
const user_route = express();

user_route.use(nocache())

user_route.use(session({
    secret:'secret-key',
    resave:false,
    saveUninitialized:false
}))

user_route.use(bodyparser.json())
user_route.use(bodyparser.urlencoded({extended:true}));

user_route.use("/public", express.static(path.join(__dirname, "public")));
user_route.set('view engine','ejs')
user_route.set('views','./view/users')




user_route.get('/',auth.isLogout,userController.landingLoad)
user_route.get("/register",auth.isLogout,userController.loadSignUp)
user_route.post("/register",auth.isLogout,userController.UsersignUp)
user_route.get("/OTP-verification",userController.LoadOTP)
user_route.route('/OTP-verification')
  .get(auth.isLogout, userController.verifyMail)
  .post(auth.isLogout, userController.checkOTP);


user_route.get("/login",auth.isLogout,userController.loginload)
user_route.post("/login",auth.isLogout,userController.verifylogin)

user_route.get("/forgetpassword",auth.isLogout,userController.loadforgetPassword)
user_route.post("/forgetpassword",auth.isLogout,userController.verifyforgetPassword)
user_route.get("/checkOTPpass",auth.isLogout,userController.checkOTPpass)
user_route.post("/checkOTPpass",auth.isLogout,userController.verifycheckOTPpass)
user_route.get("/resetpassword",auth.isLogout,userController.loadResetPassword)
user_route.post("/resetpassword",auth.isLogout,userController.ResetPassword)
user_route.get("/resend-otp",auth.isLogout,userController.resendOTP)

user_route.get("/home",auth.isLogin,userController.loadHome)
user_route.get("/user-profile",auth.isLogin,userController.loadUserProfile)
user_route.get("/edit-userProfile",auth.isLogin,userController.loadeditUserProfile)
user_route.post("/edit-userProfile",auth.isLogin,userController.createEditUserProfile)
user_route.get("/edit-userProfileAddress",auth.isLogin,userController.loadAddressUserProfile)
user_route.post("/edit-userProfileAddress",auth.isLogin,userController.editUserProfileAddress)
user_route.get("/edit-userProfilePassword",auth.isLogin,userController.loadeditPassword)
user_route.post("/edit-password",auth.isLogin,userController.editUserPassword)
user_route.get("/invoice",auth.isLogin,orderController.getInvoice)
user_route.get("/saveinvoice",auth.isLogin,userController.downloadInvoice)

user_route.get("/products-shop",auth.isLogin,productController.loadShop)
user_route.get("/products/category",auth.isLogin,productController.loadShop)
user_route.put("/add-to-cart-icon",auth.isLogin,cartController.AddOneItemToCart)
user_route.get("/products/product-details",auth.isLogin,productController.loadProductDetail)
//user cart
user_route.get("/add-to-cart",auth.isLogin,cartController.loadCart)
user_route.post("/products/product-details",auth.isLogin,cartController.AddProductToCart)
user_route.put("/add-to-cart-icon",auth.isLogin,cartController.AddOneItemToCart)
user_route.delete("/products/cart-delete",auth.isLogin,cartController.deleteCart)
user_route.post("/cart/qtyInc",cartController.incrememtingCount)
user_route.post("/cart/qtyDec",cartController.decrementingCount)

user_route.get("/wishlist",auth.isLogin,wishlistController.loadWishlist)
user_route.put("/add-to-wishlist-icon",auth.isLogin,wishlistController.addOneItemtoWishlist)
user_route.delete("/products/wishlist-delete",auth.isLogin,wishlistController.deleteWishlist)

user_route.get("/checkout",auth.isLogin,orderController.loadCheckOut)
user_route.post("/checkout/cash-on-delivery",auth.isLogin,orderController.CashOnDelivery)
user_route.post("/checkout/razor-pay",auth.isLogin,orderController.razorPayPayment)
user_route.post("/checkout/razor-pay/completed",auth.isLogin,orderController.razorpaySuccessfullOrder)
user_route.post("/checkout/wallet",auth.isLogin,orderController.WalletPlaceOrder)

user_route.post("/addcouponcode",auth.isLogin,couponController.CheckCoupon)

user_route.get("/success-page",auth.isLogin,orderController.orderSuccessfull)



user_route.get("/add-address",auth.isLogin,addressController.loadAddress)
user_route.post("/add-address",auth.isLogin,addressController.CreateAddress)
user_route.post("/add-address",auth.isLogin,addressController.getAddOneMoreAddress)
user_route.get("/edit-address",auth.isLogin,addressController.loadEditAddress)
user_route.post("/edit-address",auth.isLogin,addressController.createEditAddress)
user_route.get("/view-order/:orderId/:productId",auth.isLogin,userController.ShowOrderDetails )
user_route.delete("/user-profile/delete-address", auth.isLogin, addressController.userProfileAddressDelete);
user_route.put("/order-cancel/:orderId",auth.isLogin,orderController.orderCancel)
user_route.put("/order-return/:orderId",auth.isLogin,orderController.ReturnOrder)



user_route.get("/logout",auth.isLogin,userController.userLogout)







module.exports = user_route;


