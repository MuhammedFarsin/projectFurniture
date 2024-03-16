function validate() {
  const productName = document.getElementById("product_title");
  const regPrice = document.getElementById("product_regPrice");
  const salePrice = document.getElementById("product_salePrice");
  const description = document.getElementById("prod_description");
  const stock = document.getElementById("prod_stock");
  const imageInput = document.querySelector('input[type="file"]')

  // Error feilds
  const productNameError = document.getElementById("nameError");
  const regPriceError = document.getElementById("regPriceError");
  const salePriceError = document.getElementById("salePriceError");
  const descriptionError = document.getElementById("descError");
  const stockError = document.getElementById("sotckError");
  const imageError = document.getElementById("imageError");

  // Regex
  const productNameRegex = /^[a-zA-Z0-9\s]+$/;
  const regPriceRegex = /^\d+(\.\d{1,2})?$/;
  const salePriceRegex = /^\d+(\.\d{1,2})?$/;
  const descriptionRegex =/^[A-Za-z ]+$/;
  const stockrRegex = /^[0-9]+$/;

  if (productName.value.trim() === "") {
    productNameError.innerHTML = "Product name is required";
    setTimeout(() => {
      productNameError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!productNameRegex.test(productName.value)) {
    productNameError.innerHTML = "Invalid product name";
    setTimeout(() => {
      productNameError.innerHTML = "";
    }, 5000);
    return false;
  }

 

  if (regPrice.value.trim() === "") {
    regPriceError.innerHTML = "Regular price is required";
    setTimeout(() => {
      regPriceError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!regPriceRegex.test(regPrice.value)) {
    regPriceError.innerHTML = "Invalid regular price";
    setTimeout(() => {
      regPriceError.innerHTML = "";
    }, 5000);
    return false;
  }

  //mobile feild
  if (salePrice.value.trim() === "") {
    salePriceError.innerHTML = "Sale price is required";
    setTimeout(() => {
      salePriceError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!salePriceRegex.test(salePrice.value)) {
    salePriceError.innerHTML = "Invalid sale price";
    setTimeout(() => {
      salePriceError.innerHTML = "";
    }, 5000);
    return false;
  }

  if (description.value.trim() === "") {
    descriptionError.innerHTML = "Description is required";
    setTimeout(() => {
      descriptionError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!descriptionRegex.test(description.value)) {
    descriptionError.innerHTML = "  Only allow alphabets in here";
    setTimeout(() => {
      descriptionError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (stock.value.trim() === "") {
    stockError.innerHTML = "Stock quantity is required";
    setTimeout(() => {
      stockError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!stockrRegex.test(stock.value)) {
    stockError.innerHTML = "Invalid stock quantity";
    setTimeout(() => {
      stockError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (parseInt(stock.value) < 0) {
    stockError.innerHTML = "Stock quantity cannot be negative";
    setTimeout(() => {
      stockError.innerHTML = "";
    }, 5000);
    return false;
  }
  return true;
}
function AddProductvalidate() {
  console.log('calling');
  const productName = document.getElementById("product_title");
  const regPrice = document.getElementById("product_regPrice");
  const salePrice = document.getElementById("product_salePrice");
  const description = document.getElementById("prod_description");
  const stock = document.getElementById("prod_stock");

  // Error feilds
  const productNameError = document.getElementById("nameError");
  const regPriceError = document.getElementById("regPriceError");
  const salePriceError = document.getElementById("salePriceError");
  const descriptionError = document.getElementById("descError");
  const stockError = document.getElementById("sotckError");

  // Regex
  const productNameRegex = /^[a-zA-Z0-9\s]+$/;
  const regPriceRegex = /^\d+(\.\d{1,2})?$/;
  const salePriceRegex = /^\d+(\.\d{1,2})?$/;
  const descriptionRegex =/^[A-Za-z ]+$/;
  const stockrRegex = /^[0-9]+$/;

  if (productName.value.trim() === "") {
    productNameError.innerHTML = "Product name is required";
    setTimeout(() => {
      productNameError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!productNameRegex.test(productName.value)) {
    productNameError.innerHTML = "Invalid product name";
    setTimeout(() => {
      productNameError.innerHTML = "";
    }, 5000);
    return false;
  }

 

  if (regPrice.value.trim() === "") {
    regPriceError.innerHTML = "Regular price is required";
    setTimeout(() => {
      regPriceError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!regPriceRegex.test(regPrice.value)) {
    regPriceError.innerHTML = "Invalid regular price";
    setTimeout(() => {
      regPriceError.innerHTML = "";
    }, 5000);
    return false;
  }

  //mobile feild
  if (salePrice.value.trim() === "") {
    salePriceError.innerHTML = "Sale price is required";
    setTimeout(() => {
      salePriceError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!salePriceRegex.test(salePrice.value)) {
    salePriceError.innerHTML = "Invalid sale price";
    setTimeout(() => {
      salePriceError.innerHTML = "";
    }, 5000);
    return false;
  }

  if (description.value.trim() === "") {
    descriptionError.innerHTML = "Description is required";
    setTimeout(() => {
      descriptionError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!descriptionRegex.test(description.value)) {
    descriptionError.innerHTML = "  Only allow alphabets in here";
    setTimeout(() => {
      descriptionError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (stock.value.trim() === "") {
    stockError.innerHTML = "Stock quantity is required";
    setTimeout(() => {
      stockError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!stockrRegex.test(stock.value)) {
    stockError.innerHTML = "Invalid stock quantity";
    setTimeout(() => {
      stockError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (parseInt(stock.value) < 0) {
    stockError.innerHTML = "Stock quantity cannot be negative";
    setTimeout(() => {
      stockError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!imageInput.files.length) {
    imageError.innerHTML = "Image is required";
    setTimeout(() => {
      imageError.innerHTML = "";
    }, 5000);
    return false;
  }
  return true;
}