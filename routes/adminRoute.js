const express = require('express')
const session = require('express-session')
const bodyparser = require('body-parser')
const admin_route = express()
const adminController = require('../controller/adminController')
const productController = require('../controller/productController')
const categoryController = require('../controller/categoryController')
const orderController = require("../controller/orderController")
const couponController = require("../controller/couponController")
const config = require("../config/config")
const auth = require("../middleware/adminAuth")
const path = require("path")

admin_route.use(
    session({
        secret:'secret-key',
        resave:false,
        saveUninitialized:true
    })
)


admin_route.use(bodyparser.json())
admin_route.use(bodyparser.urlencoded({extended:true}));

admin_route.use("/public", express.static(path.join(__dirname, "public")));
admin_route.set('view engine','ejs')
admin_route.set('views','./view/admin')

//=======================admin start here=====================================//
admin_route.get("/",auth.isLogin,adminController.loadDashboard)
admin_route.get("/user-management",auth.isLogin,adminController.loadUserManagment)
admin_route.put("/users/:userId/block",auth.isLogin,adminController.blockUser)
admin_route.get("/salesReport",auth.isLogin,adminController.salesReport)
admin_route.get("/sales-data",auth.isLogin,adminController.saleChart)
admin_route.get("/download-pdf",auth.isLogin,adminController.downloadSalesPdf)

//=======================product Mangement=============================//

admin_route.get("/products/product-management",auth.isLogin,productController.ShowProduct)
admin_route.get("/products/add-new-product",auth.isLogin,productController.addNewProduct)
admin_route.post(
    "/products/create-new-product",auth.isLogin,
    config.upload.array("images",10),
    productController.createNewProduct
    )
admin_route.delete("/products/delete-product",auth.isLogin,productController.deleteProduct)
admin_route.get("/products/edit-product",auth.isLogin,productController.editProduct)
admin_route.post("/products/create-edit-product",auth.isLogin,config.upload.array("newImages",10),productController.UpdateCreateEditProduct)
admin_route.post("/delete-single-image",auth.isLogin,productController.deleteSingleImage)
admin_route.put("/submitOffer",auth.isLogin,productController.addProductOffer)
admin_route.put("/removeProductOffer",auth.isLogin,productController.removeOffer)

//=======================category in admin side===============================================//
admin_route.get("/products/category-management",auth.isLogin,categoryController.loadCategoryManagement)
admin_route.get("/category/add-new-category",auth.isLogin,categoryController.loadAddNewCategory)
admin_route.post("/category/add-new-category",auth.isLogin,categoryController.addNewCategory)
admin_route.get("/category/edit-category",auth.isLogin,categoryController.editCategory)
admin_route.delete("/category/delete-category",auth.isLogin,categoryController.deleteCategory)
admin_route.post("/category/add-updated-category",auth.isLogin,categoryController.updateCategory)
admin_route.put("/submitCategoryOffer",auth.isLogin,categoryController.addCategoryOffer)
admin_route.put("/removeCategoryOffer",auth.isLogin,categoryController.removeCategoryOffer)

//============================================admin logout========================================================================================//
admin_route.get("/products/products-orders",auth.isLogin,orderController.loadAdminOrderManagement)
admin_route.get("/view-orderDetails/:orderId",auth.isLogin,orderController.loadAdnimOrderveiw)
admin_route.post("/update-order-status/:orderId",auth.isLogin,orderController. AdminUpdateOrderStats)


admin_route.get("/coupons",auth.isLogin,couponController.loadCouponManagement)
admin_route.get("/add-new-coupon",auth.isLogin,couponController.loadAddNewCoupon)
admin_route.post("/add-new-coupon",auth.isLogin,couponController.createCoupon)
admin_route.get("/edit-coupon",auth.isLogin,couponController.loadEditCoupon)
admin_route.post("/edit-coupon",auth.isLogin,couponController.editCoupon)
admin_route.delete("/coupon-delete",auth.isLogin,couponController.deleteCoupon)

admin_route.get("/logout",auth.isLogin,adminController.adminLogout)

module.exports = admin_route;