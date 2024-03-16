const Wishlist = require("../model/wishlistModel")
const Product = require("../model/productModel")

const loadWishlist = async(req,res)=>{
    try {
        const user_id = req.session.user_id
        
        const wishlist = user_id
        ? await Wishlist.find({ user_id : user_id })
        : await Wishlist.find({ user_id : null })

        const productId = wishlist.map((wishlist)=> wishlist.product_id)
        const products = await Product.find({ _id : { $in : productId } })
        
        res.render("wishlist",{
            wishlist,
            products
        })
    } catch (error) {
        console.log(error.message);
    }
}


const addOneItemtoWishlist = async (req, res) => {
    try {
        const user_id = req.session.user_id;
        const product_id = req.query.id;
        console.log(product_id);

        const productData = await Product.findById({ _id: product_id });


        if (!productData ) {
            return res.status(404).json({ success: false, message: "Product or quantity not found...!" });
        }
        
        const createdWishlist = new Wishlist({
            product_id: product_id,
            price: productData.salePrice,
            inStock: productData.quantity > 0,
            user_id: user_id
        });

        await createdWishlist.save();
       
        if (createdWishlist) {
         
            res.status(200).json({ success: true, message: "Product added to wishlist successfully..." });
        } else {
            res.status(400).json({ success: false, message: "Error in adding to wishlist..." });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const deleteWishlist = async(req,res)=>{
    try {
        const user_id = req.session.user_id
        const product_id = req.query.id

        const wishlistDelete = await Wishlist.deleteOne({
            product_id : product_id,
            user_id : user_id
        })
        if (wishlistDelete) {
            res.status(200).json({
                success : true,
                message : " product has been deleted Successfully... "
            })
        }else{
            res.json({
                success : false,
                message:"Product Not found in Wishlist..."
            })
        }
        
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    loadWishlist,
    addOneItemtoWishlist,
    deleteWishlist
}