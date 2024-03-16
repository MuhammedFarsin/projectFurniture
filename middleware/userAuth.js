const User = require("../model/userModel")
const isLogin = async(req,res,next)=>{
    try {

        if (req.session.user_id) {
            const userData = await User.findById(req.session.user_id);

            if (userData && userData.is_blocked) {
                delete req.session.user_id;
                res.redirect("/")
            } else {
                next();
            }
            
        } else {
            res.redirect("/")
        }
        
    } catch (error) {
        console.log(error.message);
    }
}
const isLogout = async(req,res,next)=>{
    try {

        if (!req.session.user_id && !req.session.isAdminAuth) {
            next();
          } else {
            if(req.session.user_id){
        
              res.redirect("/home");
            }else{
              res.redirect("/admin");
        
            }
          }
        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout
}