const Cart = require("../model/cartModel")
const Product = require("../model/productModel");


const loadCart = async(req,res)=>{
    try {

        const user_id = req.session.user_id;
        const loggedIn = req.session.isAuth ? true : false;

        const cartCount = user_id 
        ? await Cart.countDocuments({ user_id })
        : await Cart.countDocuments({ user_id:null })
        const cart = user_id
        ? await Cart.find({ user_id : user_id })
        : await Cart.find({ user_id : null });

        const productIds = cart.map((cart)=> cart.product_id)
        const products = await Product.find({ _id:{ $in : productIds} });

        res.render("Add-to-cart",{
            loggedIn,
            cartCount,
            cart,
            products,
        })
        
    } catch (error) {
        console.log(error.message);
    }
}
const AddProductToCart = async (req, res) => {
    try {
       
        const quantity = req.body.quantity;
        const user_id = req.session.user_id;
        const product_id = req.body.productId;

        
        const productData = await Product.findById({ _id: product_id });
        
        if (!productData) {
            res.json({ success: false, message: "product Not Found" });
        }

        const productPrice = productData.salePrice;
        const category_id = productData.category;

        const cartData = user_id
            ? await Cart.findOne({
                  user_id: user_id,
                  product_id: product_id,
              })
            : await Cart.findOne({
                  user_id: null,
                  product_id: product_id,
              });
           
        const totalcartQuantity = cartData ? cartData.quantity : 0;
        const totalQuantity = Number(totalcartQuantity) + Number(quantity);

        if (totalQuantity > productData.quantity) {
            return res.json({
                success: false,
                message: "Out Of Stock...",
            });
        }
           
        if (cartData) {
            await Cart.findOneAndUpdate(
                { user_id: user_id, product_id: product_id },
                { $inc: { quantity: quantity } },
                { new: true }
            );
        } else {
            const cart = new Cart({
                product_id,
                quantity, // Set the quantity here
                productPrice,
                user_id,
                category_id,
            });
            await cart.save();
        }

        res.json({ success: true, message: "Product Added Successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

//=============================adding one Item to Cart================================================//

const AddOneItemToCart = async(req,res)=>{
    try {
        const user_id = req.session.user_id
        const quantity = 1
        const product_id = req.query.id
        const productData = await Product.findById({ _id : product_id })
        
        const productPrice = productData.salePrice
        const category_id = productData.category
       
        const cartData = await Cart.findOne({
            user_id : user_id,
            product_id : product_id
        })
        
        if(cartData){
            await Cart.findOneAndUpdate(
            { user_id : user_id , product_id : product_id },
            { $inc :{ quantity : quantity }  },
            { new : true }
            )
        }else{
            
            const cart = new Cart({
                product_id,
                quantity,
                productPrice,
                user_id,
                category_id
            })
           const updatedCart = await cart.save()
            
           const cartCount = user_id
           ? await Cart.countDocuments({ user_id : user_id })
           : await Cart.countDocuments({ user_id : null })
           if(updatedCart){
            res.json({
                success : true,
                count : cartCount
             })
            } else {
             res.json({
             success: false,
            message: "Error adding item to cart"
            });
            }
        }      
    } catch (error) {
        console.log(error.message);
    }
}
const deleteCart = async(req,res)=>{
    try {
        const user_id = req.session.user_id
        const product_id = req.query.id;

        const cartDelete = await Cart.deleteOne({
            product_id : product_id,
            user_id : user_id
        })

        const cartData = await Cart.find({ user_id : user_id })
        const cartCount = cartData.length;
        if(cartDelete.deletedCount > 0){
            const totalSubTotal = cartData.reduce((acc,cartElement)=>{
                return (acc += cartElement.totalPrice)
            },0)
        
        return res.json({
            success : true,
            message:" Product Has Deleted Successfully... ",
            totalSubTotal,
            cartCount
            })
        }else{
        res.json({
            success : false,
            message:"Product Not Found in the Cart"
            })
        }

        
    } catch (error) {
        console.log(error.message);
    }
}
const incrememtingCount = async(req,res)=>{
    try {

        const product_id = req.query.id
        const user_id = req.session.user_id
        const quantity = 1;

        const cart = await Cart.findOne({
            user_id : user_id,
            product_id : product_id
        })
        const productData = await Product.findById({ _id : product_id })
      
        if (productData.quantity <= cart.quantity) {
            res.json({ success : false , message:"Out of Stock..." })
        }else{
            if (cart) {
                cart.quantity += quantity;
                cart.totalPrice  = cart.productPrice * cart.quantity
                await cart.save()
            }
            if (cart) {
                const cartData = await Cart.find({ user_id : user_id})
                const totalSubTotal = cartData.reduce((acc , cartElement)=>{
                    return (acc += cartElement.totalPrice)
                },0)
                res.json({
                    success : true,
                    totalSubTotal,
                    quantity: cart.quantity
                })
               
            }else{
                res.josn({ success : false , message:"Product Not found In the Cart" })
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}
const decrementingCount = async(req,res)=>{
    try {

        const product_id = req.query.id
        const user_id = req.session.user_id
        const quantity = 1;

        const cart = await Cart.findOne({
            user_id : user_id,
            product_id : product_id
        })
       
        if(!cart){
            res.json({ success : false , message:"Product Not Found in the Cart..."})
        }
        if (cart) {
            if (cart.quantity - quantity < 1) {
                return res.json({
                    success: false,
                    message: "Quantity cannot be Negative",
                    quantity: cart.quantity
                });
            }
            cart.quantity -= quantity;
            cart.totalPrice  = cart.productPrice * cart.quantity
                
            await cart.save()
        }
         
        const cartData = await Cart.find({ user_id : user_id})
        const totalSubTotal = cartData.reduce((acc , cartElement)=>{
        return (acc += cartElement.totalPrice)
            },0)
            res.json({
            success : true,
            totalSubTotal,
            quantity: cart.quantity
            })
           
    } catch (error) {
        console.log(error.message);

        if (error.message.includes("Quantity cannot be Negetive")) {
            res.json({ success : false , message:"Quantity cannot be Negetive" })
        } else {
            res.json({ success : false , message:"Internal Server Error..."})
        }
    }
}

module.exports = {
    loadCart,
    AddProductToCart,
    AddOneItemToCart,
    deleteCart,
    incrememtingCount,
    decrementingCount
}