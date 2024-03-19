
const User = require('../model/userModel')
const Cart = require("../model/cartModel")
const Wallet = require("../model/walletModel")
const Product = require("../model/productModel")
const Address = require("../model/AddressModel")
const Order = require("../model/orderModel")
const config = require("../config/config")
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
require("dotenv").config({ path: "./config/.env" });
const easyinvoice = require("easyinvoice")
const { Readable } = require("stream")
const fs = require("fs")



//================password=================================//

const securePassword = async (password) => {
    try {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        throw error;
    }
};

//=================================otp==========================================//

const otpCheck={};

//===========================for sending mail==================================//

const sendVerifyMail = async (email) => {
    try {
        // Generate a random four-digit code
        console.log('THIS IS EMAIL',process.env.EMAIL);
        console.log(process.env.PASSWORD);
        const otp = Math.floor(1000 + Math.random() * 9000);
        otpCheck[email] = otp;
        console.log(otpCheck);
        console.log('test')
        const transporter = nodemailer.createTransport(config.nodemailer);
        console.log(transporter)
        const mailOptions = {
            from: config.nodemailer.auth.user,
            to: email,
            subject: 'For verification mail',
            html: `<h3><span style='color: #23a925;'>MAHARAJA FURNITURE</span> </h3>
            <h5>Account Verification Code 📩</h5>
            <h1>${otp}</h1>  `,
        };

        let info = await transporter.sendMail(mailOptions);
        console.log('Email has been sent...', info.response);
    } catch (error) {
        console.log('error from node mailer'+error.message);
    }
};

//==================================sending email end======================//
//=========================================================================//
//================================Login start============================//
//===================================sign UP================================//
const landingLoad = async(req,res)=>{
    try {
        res.render('landingpage')
        
    } catch (error) {
        console.log(error.message);
    }
}
const loadSignUp = async (req,res)=>{
    try {
        res.render('signup')
    } catch (error) {
        console.log(error.message);
    }
}
const UsersignUp = async (req, res) => {
    try {
        const user_id = req.session.user_id;
        const loggedIn = req.session.isAuth ? true:false
        const { name, email, mobile, password } = req.body;
        req.session.tempUserData = { name, email, mobile, password };
        const existname = await User.findOne({ name: name });
        const emailExisting = await User.findOne({ email: email });
        if (!existname) {
            if (!emailExisting) {
                await sendVerifyMail(email);
                res.json({success:true,redirectUrl:"/OTP-verification",loggedIn})
            } else {
                res.json({success:false,message:"This Email Already Exists..."})
            }
         } else {
            res.json({success:false,message:"This Username Already Exists..."})
         }
    } catch (error) {
            res.json({success:false,message:"Sign up Failed...!"})
    }
};

//============================signup end=========================================//
//===============================signIn start ==================================//

const loginload = async(req,res)=>{
    try {
        res.render('loginpage')
        
    } catch (error) {
        console.log(error.message);
    }
}


    const verifylogin = async(req,res)=>{
        try {
            const { email,password} = req.body;
            const userData = await User.findOne({email:email})
            if (userData) {
                const passwordMatch = await bcrypt.compare(password, userData.password);
                const user_id = req.session._id;
                const loggedIn = req.session.isAuth ? true : false;
                
                if (!userData.is_admin) {
                    if (!userData.is_blocked) {
                        if (passwordMatch) {
                            req.session.user_id = userData._id;  // Store user ID in the session
                            req.session.isAuth = true;  // Assuming you have an isAuth flag
                            res.json({success:true,redirectUrl:"/home"})
                        } else {
                            res.json({success:false,message:"Invalid Password"})
                        }
                    }else{
                    res.json({success:false,message:"Apologise,You are blocked"})
                    }
                }else{
                    if (passwordMatch) {
                        req.session.isAdminAuth = true;
                        res.json({ success: true, redirectUrl: "/admin" });
                    } else {
                        res.json({ success: false, message: "Incorrect password" });
                    }
                }
            } else {
                res.json({ success: false, message: "User not found...!" });
            }
        } catch (error) {
            console.log(error.message);
            res.json({ success: false, message: "Error during login" });
        }
    }
//===========================signUp ends=======================================//
//================================OTP SESSION======================================//
//------------------------------OTP VERIFICATION---------------------------------------------------//
const LoadOTP  = async(req,res)=>{
    try {
        res.render('OTP-verification')
    } catch (error) {
        console.log(error.message);
    }
}
//---------------------------------------------------------------------------------------------------//
const checkOTP  = async(req,res)=>{
    try {
        const { otp } = req.body;
        const { name, email, mobile, password } = req.session.tempUserData
        const user_id = req.session._id;
        const loggedIn = req.session.isAuth ? true : false;
        if (otp == otpCheck[email]) {
          try {
            const spassword = await securePassword(password);
            const user = new User({
            name,
            email,
            mobile,
            password: spassword,
            is_admin: false,
            is_blocked:false
        });
        const userData = await user.save()
        if (userData) {
            res.json({ success: true, redirectUrl:"/home" });
        } else {
            res.json({ success: false, message: "Failed...!" });
        }
          } catch (error) {
            console.log(error.message);
          }
        } else {
            res.json({ success: false, message: "incorrect OTP" });
        }
    } catch (error) {
        console.log(error.message);
    }
}

//=========================MAIL VERIFICATION===================================//

const verifyMail = async(req,res)=>{
    try {
        const user_id = req.session._id;
        const loggedIn = req.session.isAuth ? true : false;
        res.render("OTP-verification", {
            loggedIn,
            title: "User verification",
        })
    } catch (error) {
        console.log(error.message);
    }
}

//============================FORGET PASSWORD //  VERIFIY PASSWORD=========================================//

const loadforgetPassword = async(req,res)=>{
    try {
        res.render('verifyforgetpass')
    } catch (error) {
        console.log(error.message);
    }
}
//---------------------------------------------------------------------------------------//
const verifyforgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const userData = await User.findOne({ email: email });
        if (userData) {
            req.session.tempUserData = email
            await sendVerifyMail(email)
            res.redirect('/checkOTPpass')
        } else {
            res.render('verifyforgetpass', { message: "Email is incorrect" });
        }
    } catch (error) {
        console.log(error.message);
    }
};
//----------------------------------CHECK OTP----------------------------------------------//
const checkOTPpass = async (req, res) => {
    try {
        const user_id = req.session._id;
        const loggedIn = req.session.isAuth ? true : false;
        res.render("checkOTPpass",{loggedIn,title:"OTP Verification"})
    } catch (error) {
        console.log(error.message);
    }
};
//------------------------------VERIFY OTP---------------------------------------//
const verifycheckOTPpass = async(req,res)=>{
    try {
        const { otp } = req.body;
        const email = req.session.tempUserData;
        if (otpCheck[email] == otp) {
            res.redirect("/resetpassword")
          }  else {
            res.json({ success: false, message: "incorrect OTP" });
        }
    } catch (error) {
        console.log(error.message);
    }
}
//------------------------------RESET PASSWORD---------------------------------------------//
const loadResetPassword = async(req,res)=>{
    try {
        res.render('resetpassword')
    } catch (error) {
        console.log(error.message);
    }
}
const ResetPassword = async(req,res)=>{
    try {
        const newPassword = req.body.newPassword;
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashednewPassword = await bcrypt.hash(newPassword, salt);
        const email = req.session.tempUserData;
        const userData = await User.findOne({email:email});
        userData.password = hashednewPassword;
        const updatedPass = await userData.save();

        if (updatedPass) {
            res.redirect("/login")
        } 
    } catch (error) {
        console.log(error.message);
    }
}
//-------------------------------------RESEND OTP-----------------------------------//
const resendOTP = async(req,res)=>{
    try {
        const { email } = req.session.tempUserData;
        if (email) {
            await sendVerifyMail(email);
            res.redirect("/OTP-verification")
        } 
    } catch (error) {
        console.log(error.message);
    }
}
//==============================PASSWORD ENDS=======================================//
const loadHome = async(req,res)=>{
    try {
        const userData = await User.findById({_id:req.session.user_id})
        res.render('home',{user:userData,})
    } catch (error) {
        console.log(error.message);
    }
} 

const loadUserProfile = async (req,res)=>{
    try {
        const user_id = req.session.user_id
        const loggedIn = req.session.isAuht ? true : false
        const cartCount = user_id
        ? await Cart.countDocuments({ user_id : user_id })
        : await Cart.countDocuments({ user_id : null })

        const addressData = await Address.find({ user_id : user_id })
        const addressUserId = addressData.map(address => address.user_id)
        const userData = await User.findOne({ _id :{ $in : addressUserId }})
        const orderDetails = await Order.find({ user : user_id }).populate("products.productId")
        const walletData = await Wallet.find({ userId : user_id }).populate({
            path : "transactions",
            options : { sort : { date : -1 } }
        })
               
        res.render("userProfile",{
            loggedIn,
            cartCount,
            address : addressData,
            user:userData,
            order : orderDetails,
            wallet : walletData
        })

    } catch (error) {
        console.log(error.message)
    }
}
const ShowOrderDetails = async(req,res)=>{
    try {
        const user_id = req.session.user_id
        const productId = req.params.productId;
        const orderId = req.params.orderId;
        const userData = await User.findById(user_id)
        const order = await Order.findOne({ _id : orderId , user : user_id })
        .populate('address').populate({
            path: 'products.productId',
        });
        res.render("orderDetails",{
            order,
            products:productId,
            user : userData
        })

    } catch (error) {
        console.log(error.message);
    }
}

const userLogout = async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect("/")

    } catch (error) {
        console.log(error.message);
    }
}
const loadeditUserProfile = async(req,res)=>{
    try {
       const user_id = req.query.id
       const userData = await User.findById( user_id )
       const loggedIn = req.session.isAuth ? true : false
       const addressData = await Address.findOne({ user_id : user_id })
       
       res.render("edit-userProfile",{
        user : userData,
        loggedIn,
        address : addressData
       })

    } catch (error) {
        console.log(error.message);
    }
}

const createEditUserProfile = async(req,res)=>{
    try {
        const { id } = req.query

        const {
            name,
            email,
            mobile,
        } = req.body
      
        const userData = await User.findByIdAndUpdate(
            id,
            {
                name,
                email,
                mobile
            },
            { new : true }
        )
        if (userData) {
            res.redirect("/user-profile")
        }else{
            res.json({ message: " user not found... " })
        }

    } catch (error) {
        console.log(error.message);
    }
}
const loadAddressUserProfile = async(req,res)=>{
    try {
        const user_id = req.session.user_id
        const loggedIn = req.session.isAuth? true : false
        const addressData = await Address.findOne({ user_id : user_id })
       
        res.render("editAddressUserProfile",{
            address : addressData,
            loggedIn,
       
        })
    } catch (error) {
        console.log(error.message);
    }
}

const editUserProfileAddress = async(req,res)=>{
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

        const updatedAddress = await Address.findByIdAndUpdate(
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
            {
                new : true
            }
        )
        if(updatedAddress){
            res.redirect("/user-profile")
        }
        else{
            res.json({ success : false , message:" Address Not Found... " })
        }
        
    } catch (error) {
        console.log(error.message);
    }
}
//==========================edit password===========================================//
const loadeditPassword = async(req,res)=>{
    try {
        const user_id = req.session.user_id;
        const userData = await User.findById(user_id)
        const loggedIn = req.session.isAuth ? true : false

        res.render("editPassword",{
            user : userData,
            loggedIn
        })
    } catch (error) {
        console.log(error.message);
    }
}
const editUserPassword = async(req,res)=>{
    try {
  
        const { id } = req.query
        const { password , newPassword } = req.body
        
        const  user = await User.findById(id)

        if (!user) {
            res.json({ success : false , message:"user not found" })
        }
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        )
        
        if (passwordMatch) {
          const NewHashedPassword = await bcrypt.hash(newPassword , 10)
          user.password = NewHashedPassword
          const updatedPass = await user.save()
        
            if (updatedPass) {
            res.json({ success : true , message :" password successfully Updated... " })
            }
        }else{
            res.status(400).json({ success : false , message:"Current Password is Incorrect" })
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: false,  message: "An error occurred on the server" });
    }
}
const downloadInvoice = async(req,res)=>{
    try {
        const orderId = req.query.id
        const userId = req.session.user_id

        const order = await Order.findById(orderId)
        .populate({
            path: 'products.productId',
            model: 'Products'
        }) .populate( 'address');
        if (!order) {
            res.status(404).json({ success : false , message : "Order not Found...!" })
        }
        const user = await User.findById(userId)
        
      
        const invoiceData = {
            id: orderId,
            total: order.products[0].productId.salePrice,
            date : order.createdOn.toLocaleDateString('en-US',{
                year : "numeric",
                month : "long",
                day : "numeric"
            }),
            paymentMethod: order.payment,
            orderStatus: order.status,
            name: order.address.lastName,
            number: order.address.mobile,
            house: order.address.streetAddress,
            pincode: order.address.zipcode,
            town: order.address.city,
            state: order.address.state,
            products: order.products.map((product) => ({
                description: product.productId.productName,
                quantity: product.quantity, // Accessing productName from productId
                price: product.price, // Assuming product has a direct 'price' field
                total: product.price * product.quantity,
                'tax-rate': 0,
            })),
            
            sender:{
                company : 'MAHARAJA FURNITURE',
                address : 'Kunnathoor Highway',
                city : "Kunnathoor",
                country : 'India'
            },
            client: {
                company: "ABC FURNITURE",
                zip: order.address.zipcode,
                city: order.address.city,
                address : order.address.streetAddress
                
            },
            information : {
                number : `order${order._id}`,
                date : order.createdOn.toLocaleDateString('en-US',{
                    year : "numeric",
                    month : "long",
                    day : "numeric"
                }),
            },
            'bottom-notice' : 'Happy Shopping and Visit Again...'
        };
        
        const pdfResult = await easyinvoice.createInvoice({
            ...invoiceData
        });
        
        const pdfBuffer = Buffer.from(pdfResult.pdf,'base64')
        

       
        res.setHeader('Content-Disposition','attachment; filename="invoice.pdf"')
        res.setHeader('Content-Type', 'application/pdf');

        
        const pdfStream = new Readable();
        
        pdfStream.push(pdfBuffer)
        pdfStream.push(null)

        pdfStream.pipe(res)
        
    } catch (error) {
        console.log(error.message);
    }
}
const renderAboutPage = async(req,res)=>{
    try {
        res.render("about")
        
    } catch (error) {
        console.log(error.message);
    }
}
const renderContactPage = async(req,res)=>{
    try {
        res.render("contact")
        
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    loadSignUp,
    UsersignUp,
    renderAboutPage,
    renderContactPage,
    loginload,
    loadforgetPassword,
    verifylogin,
    landingLoad,
    userLogout,
    loadHome,
    LoadOTP,
    checkOTP,
    checkOTPpass,
    verifycheckOTPpass,
    verifyMail,
    verifyforgetPassword,
    loadResetPassword,
    resendOTP,
    ResetPassword,
    loadUserProfile,
    ShowOrderDetails,
    loadeditUserProfile,
    createEditUserProfile,
    loadAddressUserProfile,
    editUserProfileAddress,
    loadeditPassword,
    editUserPassword,
    downloadInvoice
}