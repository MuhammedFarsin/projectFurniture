const mongoose = require("mongoose")
const userRout = require("./routes/userRoute")  
const adminRoute = require("./routes/adminRoute")      
const nocache=require('nocache')
const express = require("express")
const path = require('path')
require('dotenv').config();
const app = express()


app.use(nocache())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT||3000;
mongoose.connect(process.env.MONGODB_URI);

app.use("/public", express.static(path.join(__dirname, "public")));
app.set('view engine','ejs')
app.set('views','./view/users')

app.use("/",userRout)
app.use("/admin",adminRoute)
app.listen(port,()=>{
    console.log("Listening to the server on http://127.0.0.1:3000"
    )});
