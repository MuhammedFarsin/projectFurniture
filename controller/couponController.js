const Coupon = require("../model/couponModel")
const Cart = require("../model/cartModel")

const loadCouponManagement = async (req, res) => {
    try {
        const coupon = await Coupon.find({});


        res.render("couponManagement", { coupon });
    } catch (error) {
        console.log(error.message);
    }
}
const loadAddNewCoupon = async(req,res)=>{
    try {
        res.render("add-new-coupon")
    } catch (error) {
        console.log(error.message);
    }
}

const createCoupon = async(req,res)=>{
    try {

        const {  
            name,
            couponCode,
            discount,
            minimumAmount,
            expiryDate
        } = req.body

        const user_id = req.session.user_id

        const couponData = await Coupon.find({ code : couponCode })

        if (! name || ! couponCode || !discount || !minimumAmount || ! expiryDate) {
            res.status(400).render("add-new-coupon",{
                message : "Coupon not found...!"
            })
        }
        if (couponData.length === 0) {
            
        
        const newCoupon = new Coupon({
            name,
            code : couponCode,
            discount,
            minimumAmount,
            expiryDate,
            user_id
        })

        const newcreatedCoupon = await newCoupon.save()
        if (newcreatedCoupon) {
            res.redirect("/admin/coupons")
            return
        }  

    }
        
    } catch (error) {
        console.log(error.message);
    }
}
const CheckCoupon = async(req,res)=>{
    try {
        const { couponCode, totalsubTotal } = req.body;

        const numericSubtotal = parseFloat(totalsubTotal.replace(/[$,]/g, ""));
         // Corrected variable name
        const user_id = req.session.user_id;
        req.session.couponCode = couponCode;
       
        const validCoupon = await Coupon.findOne({ code : couponCode })

        if (validCoupon) {
            if (validCoupon.minimumAmount && numericSubtotal > validCoupon.minimumAmount) {
                const usedUserCoupon = Array.isArray(validCoupon.usedCoupon) && validCoupon.usedCoupon.some((useddCoupon) =>
                    useddCoupon.user_id.equals(user_id)
                );
            
                if (usedUserCoupon) {
                    res.status(400).json({
                        success: false,
                        message: "Sorry.! This Coupon has Already been used..."
                    });
                }else{
                    if (validCoupon.discount) {
                        const discountAmount = ( numericSubtotal * validCoupon.discount ) / 100
                        res.status(200).json({ 
                            success : true,
                            message : "Valid Coupon",
                            discountAmount
                         })
                    }else{
                        res.status(200).json({ 
                            success : true,
                            message : "ValidEE Coupon",
                            discountAmount : validCoupon.offerPrice
                         })
                    }
                }
            }else {
                res.status(400).json({ success : false , message : `minimum Amount : ${validCoupon.minimumAmount}` })
            }
        }else{
            res.status(400).json({ success : false , message : "Invalid Coupon" })
        }


    } catch (error) {
        console.log(error.message);
    }
}
const loadEditCoupon = async(req,res)=>{
    try {

        const { id } = req.query
        
        const couponData = await Coupon.findById(id)

        if (!couponData) {
            res.status(404).json({ message : "Coupon Not Found...!" })
        }else{
            res.render("edit-coupon",{
                coupon : couponData
            })
        }
        
    } catch (error) {
        console.log(error.message);
    }
}
const editCoupon = async (req, res) => {
    try {
        
        const { id } = req.query;

        const {
            name,
            couponCode,
            discount,
            minimumAmount,
            expiryDate,
        } = req.body;

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            id,
            {
                name,
                couponCode,
                discount,
                minimumAmount,
                expiryDate,
            },
            { new: true }
        );
        if (updatedCoupon) {
            res.redirect("/admin/coupons");
        } else {
            // Handle the case where the coupon wasn't found or the update failed
            res.status(404).send("Coupon not found or update failed");
        }

    } catch (error) {
        console.log(error.message);
        // Handle other errors
        res.status(500).send("Internal Server Error");
    }
};
const deleteCoupon = async(req,res)=>{
    try {
      
        const { id } = req.query
       

        const deleteCoupon = await Coupon.deleteOne({ _id : id })

        if (deleteCoupon) {
            res.status(200).json({ success : true , message : "Coupon Deleted Successfully..." })
        }else{
            res.status(400).json({ success : false , message : " Coupon Cancellation Failed... " })
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadCouponManagement,
    loadAddNewCoupon,
    createCoupon,
    CheckCoupon,
    loadEditCoupon,
    editCoupon,
    deleteCoupon
}