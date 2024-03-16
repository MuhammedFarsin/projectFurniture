const Category = require("../model/categoryModel")
const User = require("../model/userModel")
const Product = require("../model/productModel")
const { salesReport } = require("./adminController")

//====================create it and update into database======================================//
const loadAddNewCategory = async(req,res)=>{
  try {
    res.render("add-new-category")
    
  } catch (error) {
    console.log(error.message);
  }
}
const addNewCategory = async(req,res)=>{
    try {
        const formData = req.body;
        const selectedList = req.body["list-unlist"];
        const categoryName = formData.categoryName;
        const listed = selectedList === "list"? true : false;
        const existingCategory = await Category.findOne({ categoryName : {
          $regex : new RegExp(`^${categoryName}$`,'i')
        } })
        if (existingCategory) {
          return res.json({  success : false , message:"Already Exists..." })
        }
        const category = new Category({
            categoryName,
            listed,
        });
        await category.save()

        res.json({
            success:true,
            message:"Category Added Successfully...",
            newCategory : category
        })
  
    } catch (error) {
        console.log(error.message);
    }
}

//=============================edit category============================================//
const editCategory = async(req,res)=>{
    try {

        const { id } = req.query

        const category = await Category.findById({_id : id})

        if (category) {
            res.render("edit-category",{
                title:"Edit Category",
                category
            })
        }
        
    } catch (error) {
        console.log(error.message);
    }
}
//=============================delete Category=======================================//
const deleteCategory = async(req,res)=>{
    try {

        const { id } = req.query
        req.session.categoryId = id;

        const categoryData = await Category.deleteOne({ _id : id })
        if (categoryData.deletedCount > 0) {
            res.json({success : true , message:"Category deleted Successfully..."})
        }else{
            res.json({success : false , message:"Category Not found...!"})
        }
        
    } catch (error) {
        console.log(error.message);
    }
}
//=========================edit and update in Database========================================//
const updateCategory = async (req, res) =>  {
    try {
      const { categoryName, categoryId } = req.body;
      const categoryLower = (categoryName || "").trim().toLowerCase();
  
      // Check if the categoryName is not empty
      if (categoryName.trim() !== "") {
        const selectedList = req.body["list-unlist"];
        const listed = selectedList === "list" ? true : false;
  
        const existingCategory = await Category.findOne({
          categoryName: { $regex: new RegExp(categoryLower, "i") },
          _id: { $ne: categoryId },
        });
  
        if (existingCategory) {
          return res
            .status(409)
            .json({ error: "Category with this name already exists." });
        } else {
          // categoryName is not empty, proceed with the update
          const updatedCategory = await Category.findByIdAndUpdate(
            { _id: categoryId },
            {
              categoryName,
              listed,
            },
            { new: true }
          );
  
          if (updatedCategory) {
            return res.status(200).json({
              success: true,
              message: "Category edited successfully",
              data: updatedCategory,
            });
          }
        }
      } else {
        // categoryName is empty, return a 400 response
        return res.status(400).json({ error: "Fields cannot be empty" });
      }
    } catch (error) {
      console.error("Error in updateCategory:", error.message);
      return res.status(500).json({ error: "Internal Server Error" });
        }
  };

//=========================load category management=====================================//
const loadCategoryManagement = async(req,res)=>{
    try {
        const user = await User.find({is_admin:false})
        const category = await Category.find({})
        res.render("categoryManagement",{
            user,
            title:"Category Management",
            category
        })
        
    } catch (error) {
        console.log(error.message);
    }
}
const addCategoryOffer = async (req, res) => {
  try {
    const { categoryId, offer } = req.body;

    const categoryData = await Category.findById(categoryId);

    if (!categoryData) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const productCategory = await Product.find({ category : categoryId })
    
    for (const product of productCategory) {
      const discountAmount = Math.floor(product.regularPrice * (offer / 100));
      product.productOffer = discountAmount;
      product.salePrice -= discountAmount; // Reduce from the current sale price
      await product.save();
    }
    
    categoryData.categoryOffer = offer;
    await categoryData.save();

    return res.status(200).json({
      success: true,
      message: "Category offer successfully applied.",
    });

  } catch (error) {

    console.error(error.message);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  }

};
const removeCategoryOffer = async(req,res)=>{
  try {
    const { categoryId } = req.body
    
    const category = await Category.findById(categoryId)

    if (!category) {
      res.status(404).json({ success : false , message : "Category Not Found...!" })
    }


    const products = await Product.find({ category : categoryId })

    for(const product of products){

      product.salePrice = Number(product.productOffer) + Number(product.salePrice)
      product.productOffer = 0
      await product.save()
    }
    category.categoryOffer = 0
    await category.save()
    res.status(200).json({
      success : true,
      message : "Category Offer Removed Successfully..."
    })
    
  } catch (error) {
    console.log(error.message);
  }
}
module.exports = {
    addNewCategory,
    editCategory,
    deleteCategory,
    updateCategory,
    loadCategoryManagement,
    addCategoryOffer,
    loadAddNewCategory,
    removeCategoryOffer
}