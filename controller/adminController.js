const User = require('../model/userModel')
const Order = require("../model/orderModel")
const Product = require("../model/productModel")
const Category = require("../model/categoryModel")
const pdf = require("pdfkit")
const fs = require('fs')
const PDFDocument = require('pdfkit');

const loadDashboard = async(req,res)=>{
    try {
        const user = await User.find({is_admin:false})
        const orders = await Order.find({ })
        const product = await Product.find({ })
        const category = await Category.find({ })

        //calculate total revenue
        
        const totalRevenue = orders.reduce((acc, order) => {
            if (order.status === 'Completed' && order.payment !== 'Cash On Delivery') {
                acc += order.products.reduce((subTotal, product) => subTotal + 
                    product.price * product.quantity, 0
                );
            }
            return acc; // Use += here to accumulate the value
        }, 0);
        //calculate total order

        const totalOrder = orders.reduce((acc,order)=>{
            if (order.status !== 'Cancelled') {
                acc += order.products.length
            }
            return acc
        } , 0 )

        //total products
        const totalProducts = product.length
        const totalCategory = category.length

        //calculate Monthly Revenue
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(),currentDate.getMonth() , 1)

        const MonthlyOrders = await Order.find({
            createdOn : { $gte : firstDayOfMonth }
        });

        const MonthlyRevenue = MonthlyOrders.reduce((acc,order)=>{
            if (order.status === 'Completed' && order.payment !== 'Cash On Delivery') {
                acc += order.products.reduce(
                    (subTotal,product) => subTotal + product.price * product.quantity,
                    0
                );
               
            }
            return acc
        }, 0 )
        
      const topProductDetails = await MostSoldProduct()
       
        if (user) { 
            res.render("dashboard",{
                title:"Admin Dashboard",
                user,
                revenue : totalRevenue,
                orders : totalOrder,
                product : totalProducts,
                category : totalCategory,
                monthlyRevenue : MonthlyRevenue,
                topProductDetails
            })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadUserManagment = async (req, res) => {
    try {
        const user = await User.find({is_admin:false})    
        res.render('userManagement',{user}); 
    } catch (error) {
        console.log(error.message);
    }
};

const blockUser = async(req,res)=>{
    try {
        const userId = req.params.userId;
        const userData = await User.findById(userId)
        if (!userData) {
            console.log("user not Found...!");
        } 
        userData.is_blocked = !userData.is_blocked
        await userData.save()
        if (userData.is_blocked) {
            res.json({ success:true , is_blocked:true })
        }
        if (!userData.is_blocked) {
            res.json({ success:true , is_blocked:false })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const adminLogout = async(req,res)=>{
   try {
    req.session.destroy(function (err){
        if (err) {
            console.log(err);
        } else {
            res.redirect("/")
        }
    })
   } catch (error) {
    console.log(error.message);
   }
}
const salesReport = async (req, res) => {
    try {
      const { startDate, endDate, page = 1, pageSize = 3 } = req.query; 
      let query = { status: "Completed" };
  
      if (startDate && endDate) {
        const startDateTime = new Date(startDate);
        startDateTime.setUTCHours(0, 0, 0, 0);
  
        const endDateTime = new Date(endDate);
        endDateTime.setUTCHours(23, 59, 59, 999);
  
        query.createdOn = { $gte: startDateTime, $lt: endDateTime };
      }
  
      const totalCount = await Order.countDocuments(query);
      const totalPages = Math.ceil(totalCount / pageSize);
      const skip = (page - 1) * pageSize;
      const limit = pageSize;
  
      const orders = await Order.find(query)
        .populate("user")
        .populate("products.productId")
        .sort({ createdOn: -1 })
        .skip(skip)
        .limit(limit);
  
      res.render("salesReport", {
        orders,
        startDate,
        endDate,
        page: parseInt(page),
        totalPages,
        pageSize: parseInt(pageSize),
      });
  
    } catch (error) {
      console.log(error.message);
    }
  };
const saleChart = async(req,res)=>{
    
    try {
        if (!req.query.interval) {
            return res.status(400).json({ error: "Missing interval parameter" });
        }
        const interval = req.query.interval.toLowerCase();
        let dateFormate , groupByFormat ;
        switch (interval) {

            case "yearly":

                dateFormate = "%Y";
                groupByFormat = {
                    $dateToString : { format: "%Y" , date : "$createdOn" },
                }
                break;

                case "monthly":
                    dateFormate = "%Y-%m";
                    groupByFormat = {
                        $dateToString: { format: "%m-%Y", date: "$createdOn" },
                    };
                    break;

            case "daily":

                    dateFormate = "%Y-%m-%d";
                    groupByFormat = {
                    $dateToString : { format: "%Y-%m-%d" , date : "$createdOn" },
                    }
                    break;

            default:
                    console.error("Error: Invalid time interval");
                    return res.status(400).json({ error: "Invalid time interval" });
                }

                const salesData = await Order.aggregate([
                {    
                    $group : {
                        _id : groupByFormat,
                        totalSales : { $sum : "$totalPrice" },
                        topProduct : { $first : "$productName" }
                    },
                },
                {
                    $sort : { _id : 1 }
                },

                ])

                const monthNames = [
                    "January" , "February" , "March" , "April" , "May" , "June",
                    "July" , "August" , "September" , "October" , "November" ,
                    "December"
                ];

                const labels = salesData.map((item) => {
                    if (interval === "monthly") {
                        const [ month , year ] = item._id.split('-');
                        return `${monthNames[parseInt(month) -1 ]} ${year}`
                    }

                    return item._id
                } )

                

                const values = salesData.map((item) => item.totalSales )
                const topProductDetails = salesData.map((item) => item.topProduct )

                res.json({ labels , values ,topProductDetails })

    } catch (error) {
        console.log(error.message);
    }
}
const MostSoldProduct = async () => {
    try {
        const mostSoldProduct = await Order.aggregate([
            { $unwind: '$products' },
            {
                $group: {
                    _id: '$products.productId',
                    totalQuantity: { $sum: '$products.quantity' },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 1 },
        ]);

        if (mostSoldProduct.length > 0) {
            const productId = mostSoldProduct[0]._id;
            const productDetails = await Product.findById(productId);
            const categoryId = productDetails.category

            const categoryDetails = await Category.findById(categoryId)
            return [{
                productName: productDetails.productName,
                productPhoto: productDetails.image,
                category : categoryDetails.categoryName
                // Add more details as needed
            }];
        }

        return []; // Return an empty array if there are no sales yet
    } catch (error) {
        console.error('Error fetching most sold product:', error.message);
        return []; // Return an empty array in case of an error
    
    }
};

const downloadSalesPdf = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = { status: "Completed" };

        if (startDate && endDate) {
            const startDateTime = new Date(startDate);
            startDateTime.setUTCHours(0, 0, 0, 0);

            const endDateTime = new Date(endDate);
            endDateTime.setUTCHours(23, 59, 59, 999);

            query.createdOn = { $gte: startDateTime, $lt: endDateTime };
        }

        const orders = await Order.find(query)
            .populate("user")
            .populate("products.productId")
            .sort({ createdOn: -1 });

        const pdfPath = 'sales-report.pdf';
        const doc = new PDFDocument();

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${pdfPath}`);

        // Pipe the PDF stream to the response
        doc.pipe(res);

        // Add content to the PDF
        doc.fontSize(14).text('Sales Report', { align: 'center' }).moveDown();

// Add sales data to the PDF
const columnWidths = [300, 100, 100]; // Adjust column widths as needed

orders.forEach((order, index) => {
    doc.text(`Order ID: ${order._id}`);
    doc.text(`User: ${order.user.name}`);
    doc.text(`Date: ${order.date}`);
    doc.text(`Total Price: $${order.totalPrice}`);
    doc.moveDown();

    // Add a table for products manually
    const yPos = doc.y;
    
    doc
        .moveTo(50, yPos)
        .lineTo(50 + columnWidths[0], yPos)
        .stroke(); // Line for the first column (Product Name)
    doc
        .moveTo(150, yPos)
        .lineTo(150 + columnWidths[1], yPos)
        .stroke(); // Line for the second column (Quantity)
    doc
        .moveTo(250, yPos)
        .lineTo(250 + columnWidths[2], yPos)
        .stroke(); // Line for the third column (Price)

    doc.text('Product Name', 50, yPos);
    doc.text('Quantity', 150, yPos);
    doc.text('Price', 250, yPos);

    doc.moveDown();

    order.products.forEach((product) => {
        const rowY = doc.y;
        
        doc
            .moveTo(50, rowY)
            .lineTo(50 + columnWidths[0], rowY)
            .stroke(); // Line for the first column (Product Name)
        doc
            .moveTo(150, rowY)
            .lineTo(150 + columnWidths[1], rowY)
            .stroke(); // Line for the second column (Quantity)
        doc
            .moveTo(250, rowY)
            .lineTo(250 + columnWidths[2], rowY)
            .stroke(); // Line for the third column (Price)

        doc.text(product.productId.productName, 50, rowY);
        doc.text(product.quantity.toString(), 150, rowY);
        doc.text(`$${product.price}`, 250, rowY);
        doc.moveDown();
    });

    if (index < orders.length - 1) {
        // Add a separator between orders
        doc.moveDown().lineTo(0, doc.y).lineTo(600, doc.y).stroke('#000');
    }
});

// Finalize the PDF and end the stream
doc.end();

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    loadDashboard,
    loadUserManagment,
    blockUser,
    adminLogout,
    salesReport,
    saleChart,
    downloadSalesPdf
}

