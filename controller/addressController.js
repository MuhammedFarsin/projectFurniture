const Address = require("../model/AddressModel")
const Cart = require("../model/cartModel")
const User = require("../model/userModel")

const loadAddress = async(req,res)=>{
    try {
        const user_id = req.session.user_id
        const loggedIn = req.session.isAuth ? true : false;

       
        const cartCount = user_id 
        ? await Cart.countDocuments({ user_id })
        : await Cart.countDocuments({ user_id : null })

        res.render("Add-Address",{
            loggedIn,
            cartCount
        })
        
    } catch (error) {
        console.log(error.message);
    }
}
const CreateAddress = async(req,res)=>{
    try {
        const {
            firstName,
            lastName,
            city,
            streetAddress,
            state,
            zipcode,
            phone,
            email
        } = req.body;

        const user_id = req.session.user_id
       
        const address = new Address({
            firstName,
            lastName,
            city,
            streetAddress,
            state,
            zipcode,
            phone,
            email,
            user_id 
        })

        if(address){
            address.save()
            res.redirect("/checkout")
        }    
    } catch (error) {
        console.log(error.message);
    }
}
const loadEditAddress = async(req,res)=>{
    try {
        const address_id = req.query.id
        const user_id = req.session.user_id
        const loggedIn = req.session.isAuth ? true : false
        const cartCount = user_id
        ? await Cart.countDocuments({ user_id : user_id})
        : await Cart.countDocuments({ user_id : null })

        const address = await Address.findById( address_id )

        res.render("edit-Address",{
            loggedIn,
            cartCount,
            address
        })
    } catch (error) {
        console.log(error.message);
    }
}
const createEditAddress = async(req,res)=>{
    try {
        const { id } = req.query
        const {
            firstName,
            lastName,
            city,
            streetAddress,
            state,
            zipcode,
            phone,
            email,
        } = req.body

        const user_id = req.session.user_id

        const editedAddress = await Address.findByIdAndUpdate(
            id, 
            {
            firstName,
            lastName,
            city,
            streetAddress,
            state,
            zipcode,
            phone,
            email,
            user_id
            },
            { new : true }
        )
        if(editedAddress){
            res.redirect("/checkout")
        }
        
    } catch (error) {
        console.log(error.message);
    }
}
const getAddOneMoreAddress = async(req,res)=>{
    try {
        const user_id = req.session.user_id
        const address = await Address.find({ user_id : user_id })
        res.render("/Add-Address",{
            address
        })
    } catch (error) {
        console.log(error.message);
    }
}
const userProfileAddressDelete = async (req, res) => {
    try {
        console.log('hi');
        const { id } = req.query;

        const addressDeleted = await Address.deleteOne({ _id: id });
        if(addressDeleted){
            res.json({
                success : true
            })
        }
    }catch (error) {
        console.error('Error deleting address:', error.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};





module.exports = {
    loadAddress,
    CreateAddress,
    loadEditAddress,
    createEditAddress,
    getAddOneMoreAddress,
    userProfileAddressDelete
}