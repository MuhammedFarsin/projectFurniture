const Product = require('../model/productModel')
const Category =require("../model/categoryModel")
const fs = require("fs")


const ShowProduct = async(req,res)=>{
    try {
        const sortCategory = req.query.id;
        const page = req.query.page || 0;
        const productPerPage = 10;
        const category = await Category.find({})
        const totalNumberOfProducts = sortCategory
            ? await Product.find({category:sortCategory})
            : await Product.find({})
        const totalNumberOfPages = Math.ceil(
            totalNumberOfProducts / productPerPage
        )
        const productData = sortCategory
            ? await Product.find({ category : sortCategory })
            .skip(page*productPerPage)
            .limit(productPerPage)
            : await Product.find({})
            .skip(page*productPerPage)
            .limit(productPerPage);

        res.render("productManagement",{
            title:"Product-Mangement",
            product:productData,
            totalNumberOfPages,
            page,
            category
        })
        
    } catch (error) {
        console.log(error.message);
    }
}
//====================adding New products===================================//
const addNewProduct = async(req,res)=>{
    try {
        const categoryData = await Category.find({})

        if (categoryData) {
            res.render("add-product",{
                title:"Add Product",
                category:categoryData
            })
        }
    } catch (error) {
        console.log(error.message);
    }
}
const createNewProduct = async(req,res)=>{
    try {
        const {
            productName,
            description,
            marketPrice,
            salePrice,
            myCategory,
            quantity,
        } = req.body

        let imageFiles = [];
        if (req.files && req.files.length > 0) {
            imageFiles = req.files.map((file)=>( { filename : file.filename } ) )
        }
        const categoryData = await Category.findOne({ _id : myCategory })
        
        const product = new Product({
            productName:productName,
            description:description,
            regularPrice:marketPrice,
            salePrice:salePrice,
            category:categoryData._id,
            quantity:quantity,
            image:imageFiles,
        })
        const productData = await product.save()
        if (productData) {
            return res.redirect("/admin/products/add-new-product")
        } else {
         return res.render("add-product",{message:"Failed to Update...!"})   
        }
    } catch (error) {
        console.log(error.message);
    }
}

//============================delete product=========================================//

const deleteProduct = async (req, res) => {
    try {
      const { id } = req.query;
      const productData = await Product.deleteOne({ _id: id });
  
      if (productData.deletedCount > 0) {
        res.status(200).json({ success: true, message: "Product deleted successfully." });
      } else {
        res.status(404).json({ success: false, message: "Product not found." });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: "Internal Server Error." });
    }
  };
const editProduct = async(req,res)=>{
    try {
        const { id } = req.query

        const productData = await Product.findByIdAndUpdate({ _id : id })
        const categoryData = await Category.find({})
        if (productData) {
            res.render("edit-product",{
                title:"Edit Product",
                product:productData,
                category:categoryData
                })
            }
        } catch (error) {
        console.log(error.message);
        }
}
const UpdateCreateEditProduct = async(req,res)=>{
    try {
        const _id = req.query.productId
        const {
            productName,
            description,
            marketPrice,
            salePrice,
            myCategory,
            quantity
        } = req.body

        const imageFiles = req.files;

        let imageArray = [];
        if (imageFiles) {
            imageArray = imageFiles.map((file) => ({ filename : file.filename }))
        }
        //--------------------find existng product---------------------------//
        const existingProduct = await Product.findById({ _id })
        //--------------------apply in the existing image-----------------------------//
        const updatedImage = [...existingProduct.image,...imageArray];
        //---------------update with new product------------------------------------//
        const productData = await Product.findByIdAndUpdate(_id,
        {
            productName:productName,
            description:description,
            regularPrice:marketPrice,
            salePrice:salePrice,
            category:myCategory,
            quantity:quantity,
            image:updatedImage
        },
        { new : true }
        );
        
        if (productData) {
            res.redirect("/admin/products/product-management#products")
        }
    } catch (error) {
        console.log(error.message);
    }
}
//==================show Shop page======================================================//
const loadShop = async(req,res)=>{
    try {
        const user_id = req.session._id;
        const sortCategory = req.query.id;
        const page = req.query.page || 0;
        const productPerPage = 6

        const search = req.query.search;
        const priceRange = req.query.priceRange;
        const categorySearch = req.query.categorySearch
        let productData;

        if (search) {   
            if (categorySearch === "all") {
                productData = await Product.find({
                productName: { $regex: new RegExp(" .* " + search + " .* ", " i ")},
                })
                .skip( page * productPerPage )
                .limit( productPerPage )
            } else {
                productData = await Product.find({
                category:categorySearch,
                productName: { $regex: new RegExp(" .* " + search + " .* ", " i ")}
            })
                .skip( page * productPerPage )
                .limit( productPerPage )
            }
    
         }else{
            if (priceRange) {
                const [minPrice , maxPrice] = priceRange.split("-");
                productData = sortCategory 
                ? await Product.find({ 
                category : sortCategory ,
                salePrice:{ $gte : minPrice , $lte : maxPrice }
                })
                .skip( page * productPerPage )
                .limit( productPerPage )
                :await Product.find({
                salePrice:{ $gte : minPrice , $lte : maxPrice }
                })
                .skip( page * productPerPage )
                .limit( productPerPage )

            }else {
                productData = sortCategory
                    ?await Product.find({ category : sortCategory })
                    .skip( page * productPerPage )
                    .limit( productPerPage )
                    :await Product.find({})
                    .skip( page * productPerPage )
                    .limit( productPerPage )
            }
         }

        const totalNumberOfProducts = sortCategory
        ?await Product.find({ category : sortCategory })
        :await Product.find({})
        const totalNumberOfPages = Math.ceil(
            totalNumberOfProducts / productPerPage
        )
        const categoryData = await Category.find({});

        const loggedIn = req.session.isAuth ? true : false;

        if (productData && categoryData) {
            res.render('shop',{
                loggedIn,
                currentPage:"Shop",
                title:"Shop",
                category:categoryData,
                products:productData,
                page:page,
                totalNumberOfPages,
                totalNumberOfProducts : productData.length,
                selectedPriceRange : priceRange
            });
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

//==============================deleting Single image=====================================================//
const deleteSingleImage = async (req, res) => {
    try {
        const { productId, filename } = req.body;
        const product = await Product.findById(productId);

        if (!product) {
            return res.json({ success: false, message: "Product Not Found" });
        }

        const imageIndex = product.image.findIndex(
            (img) => img.filename === filename
        );

        if (imageIndex === -1) {
            return res.json({ success: false, message: "Image Not Found in the Product" });
        }

        product.image.splice(imageIndex, 1);
        await product.save();

        const filePath = `public/assetsNew/uploads/${filename}`;
        fs.unlink(filePath, (error) => {
            if (error) {
                return res.json({ success: false, message: "Error In deleting" });
            }
            return res.json({ success: true, message: "Image has Successfully Deleted" });
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
//==============================show product details============================================//

const loadProductDetail = async(req,res)=>{
    try {
        const user_id = req.query.id;
        const productData = await Product.findById({ _id : user_id })
        const loggedIn = req.session.isAuth ? true : false
        res.render("productDetail",{
            loggedIn,
            title:"product Details",
            currentPage:"Shop",
            products:productData,
        })
        
    } catch (error) {
        console.log(error.message);
    }
}
const addProductOffer = async(req,res)=>{
    try {
        const { productId , offer } = req.body;
       
        if (!productId || !offer || isNaN(offer) || parseInt(offer) < 0) {
            return res.status(400).json({ success: false, message: 'Invalid input.' });
        }
        const product = await Product.findById(productId)

       if (product) {
        product.productOffer = Math.floor(
            product.regularPrice * (offer / 100)
        )

        product.salePrice = product.salePrice - product.productOffer
        await product.save()
        return res.status(200).json({ success: true,
         salePrice: product.salePrice,
         message : " Offer Successfully Applied... "
        });

       }else{
        return res.status(400).json({ success: false, message: 'Product Not Found...' });
       }

    } catch (error) {
        console.log(error.message);
    }
}
const removeOffer = async(req,res)=>{
    try {
        const { productId } = req.body
        const product = await Product.findById(productId)

        if (product) {
            product.salePrice = Number(product.productOffer) + Number(product.salePrice)
            product.productOffer = 0
            
            const updatedProduct = await product.save()

            if (updatedProduct) {
                res.status(200).json({
                    success : true,
                    message : "Offer Successfully Removed..."
                })
            } else {
                return res.status(500).json({
                  success: false,
                  message: "Error updating product data after removing the offer.",
                });
            }
        }else{
            return res.status(400).json({ success: false, message: "Product not found." });
        }

        
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    ShowProduct,
    addNewProduct,
    createNewProduct,
    deleteProduct,
    deleteSingleImage,
    editProduct,
    UpdateCreateEditProduct,
    loadShop,
    loadProductDetail,
    addProductOffer,
    removeOffer
}