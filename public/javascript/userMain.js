const { json } = require("express");
const Razorpay = require("razorpay");
const { options } = require("toastr");
const { loginload } = require("../../controller/userController");
const { salesReport } = require("../../controller/adminController");


// add to cart from icon
function addToCart(productId) {
  
  $.ajax({
    url: `/add-to-cart-icon?id=${productId}`,
    type: "PUT",
    contentType: "application/json",
    data: JSON.stringify({ is_blocked: true }),
    success: function (response) {
      updateCartNumber(response.count);

      removeCartIcon(productId);
    },
    error: function (xhr, status, error) {
      console.error("Failed to block user", error);
    },
  });

  // Show SweetAlert at the center
  Swal.fire({
    position: "center",
    icon: "success",
    title: "Product added to cart!",
    showConfirmButton: false,
    timer: 1500,
  });
}

function addTowishlist(productId) {
  console.log(productId);

  $.ajax({
    url: `/add-to-wishlist-icon?id=${productId}`,  // Check this URL
    type: "PUT",
    contentType: "application/json",
    data: JSON.stringify({ is_blocked: true }),
    success: function (response) {
      updateCartNumber(response.count);

      removeCartIcon(productId);
    },
    error: function (xhr, status, error) {
      console.error("Failed to add to wishlist", error);
    },
  });

  // Show SweetAlert at the center
  Swal.fire({
    position: "center",
    icon: "success",
    title: "Product added to wishlist!",
    showConfirmButton: false,
    timer: 1500,
  });
}
function addToCartAndRedirect(productId) {
  $.ajax({
      url: `/add-to-cart-icon?id=${productId}`,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify({ is_blocked: true }),
      success: function (response) {
          updateCartNumber(response.count);

          // Redirect to the cart page
          window.location.href = "/cart";

          // Remove the product from the wishlist
          removeFromWishlist(productId);
      },
      error: function (xhr, status, error) {
          console.error("Failed to add to cart", error);
      },
  });

  // Show SweetAlert at the center
  Swal.fire({
      position: "center",
      icon: "success",
      title: "Product added to cart!",
      showConfirmButton: false,
      timer: 1500,
  });
}

// Function to update the cart number dynamically
function updateCartNumber(newCount) {
  const cartNumberElement = document.getElementById("cart-number");
  if (cartNumberElement) {
    cartNumberElement.innerText = `(${newCount})`;
  }
}

// remove the icon after adding the item
function removeCartIcon(productId) {
  const cartIcon = document.getElementById(`cart-icon-${productId}`);
  if (cartIcon) {
    cartIcon.remove();
  }
}

// Function to delete the row from the UI
function deleteRow(productId) {
  const rowToDelete = document.getElementById(productId);
  if (rowToDelete) {
    const nextRow = rowToDelete.nextElementSibling;

    rowToDelete.remove();
    if (nextRow) {
      nextRow.remove();
    }
  }
}

// Function to confirm and delete
function confirmDelete(productId) {

  const modal = document.getElementById("deleteModal");
  const confirmBtn = document.getElementById("confirmBtn");

  modal.style.display = "block";

  confirmBtn.onclick = function () {
    // Send AJAX request using fetch
    fetch("/products/cart-delete?id=" + productId, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          deleteRow(productId);
          updateSubtotal(data);
          updateCartNumber(data);

          // Check if the cart is empty and update the view
          if (data.cartCount === 0) {
            displayEmptyCartImage();
          }
        } else {
          console.error("Error deleting product on the server");
        }

        modal.style.display = "none";
      })
      .catch((error) => {
        console.error("Error deleting product", error);
        modal.style.display = "none";
      });
  };

  document.getElementById("cancelBtn").onclick = function () {
    modal.style.display = "none";
  };
}

// to display the empty placeholder for cart
function displayEmptyCartImage() {
  const emptyCartImage = document.getElementById("emptyCartImage");
  const cartTable = document.getElementById("cartTable");

  // Hide the cart table and display the empty cart image
  cartTable.style.display = "none";
  emptyCartImage.style.display = "flex";
}

// updating the cart
function updateCartNumber(data) {
  const cart = document.getElementById("cart-number");
  cart.innerText = `(${data.cartCount})`;
}

function confirmCancel(orderId) {
  const confirmationModal = new bootstrap.Modal(document.getElementById("confirmationModal"), {
    backdrop: "static",
    keyboard: false,
  });

  confirmationModal.show();
  console.log(orderId);
  const cancelButton = document.getElementById("confirmBtn");

  cancelButton.onclick = async function () {
    try {

      const response = await fetch(`/order-cancel/${orderId}`, {
        method: 'PUT',
      });

      if (response.status === 200) {
        console.log("order canceled");
        window.location.href = "/user-profile"
        const responseData = await response.json();
        // Optionally update the UI here
      } else {
        const errorData = await response.json();
        console.error(`Failed to cancel order. Status: ${response.status}, Error: ${errorData.error}`);
        // Optionally display an error message to the user
      }
      confirmationModal.hide();
      // Reload the page regardless of success or failure
      location.reload();
    } catch (error) {
      console.error('Error during fetch:', error);
      // Reload the page in case of an error
      location.reload();
    }
  };
}
function confirmReturn(orderId) {
  const returnConfirmationModal = new bootstrap.Modal(document.getElementById("returnConfirmationModal"), {
    backdrop: "static",
    keyboard: false,
  });

  returnConfirmationModal.show();
  console.log(orderId);
  
  const confirmReturnButton = document.getElementById("confirmReturnBtn");

  confirmReturnButton.onclick = async function () {
    try {
      const response = await fetch(`/order-return/${orderId}`, {
        method: 'PUT',
      });

      if (response.status === 200) {
        console.log("order returned");
        window.location.href = "/user-profile";
        // Optionally update the UI here
      } else {
        const errorData = await response.json();
        console.error(`Failed to return order. Status: ${response.status}, Error: ${errorData.error}`);
        // Optionally display an error message to the user
      }

      returnConfirmationModal.hide();
      // Reload the page regardless of success or failure
      location.reload();
    } catch (error) {
      console.error('Error during fetch:', error);
      // Reload the page in case of an error
      location.reload();
    }
  };
}


// Increment product quantity in the cart
function incrementProductQuantity(productId) {
  console.log(productId);
  // Send an AJAX request to increment the quantity
  fetch(`/cart/incrementing-product?id=${productId}`, {
    method: "PUT",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updateQuantity(productId, data.quantity);
        updateSubtotal(data);
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: data.message,
        });
      }
    })
    .catch((error) => {
      console.error("Error incrementing quantity:", error);
    });
}


// Decrement product quantity in the cart
function decrementProductQuantity(productId) {
  // Send an AJAX request to decrement the quantity
console.log(productId);
  const quantityInput = document.querySelector(`#qty-${productId}`);
  const currentQuantity = parseInt(quantityInput.value, 10);

  if (currentQuantity > 1) {
    fetch(`/cart/decrementing-product?id=${productId}`, {
      method: "PUT",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // Update the quantity on the page
        updateQuantity(productId, data.quantity);

        // Update the subtotal
        updateSubtotal(data);
        console.log(data);
      })
      .catch((error) => {
        console.error("Error decrementing quantity:", error);
      });
  }
}

// Update the quantity on the page
function updateQuantity(action, productId, index) {
  console.log(action);
  console.log("this is calling");

  $.ajax({
    type: 'POST',
    url: `/cart/${action}?id=${productId}`,

    success: function (data) {

      if (!data || typeof data !== 'object') {
        console.error("Invalid data received from server.");
        return;
      }

      if (data.message) {
        // Handle specific errors
        if (data.message === "Out of Stock...") {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "This product is currently out of stock.",
          });
        } else {
          // Handle other errors
          console.log("product qty must be one")
        }
        return;
      }

      const newQuantity = Math.max(1, data.quantity);

      const cartProductQty = $(`#cartProductqty${index}`);
      const priceElement = $(`#cartProductqty${index}`).closest('tr').find('.price span');

      const salePriceStr = priceElement.text().replace('$', '').trim();

      if (!salePriceStr) {
        console.error("Error: salePriceStr is null, undefined, or empty");
        return;
      }

      const salePrice = parseFloat(salePriceStr);

      if (isNaN(salePrice)) {
        console.error("Error: salePrice is NaN");
      } else {
        cartProductQty.val(newQuantity);
        const newSubtotal = (newQuantity * salePrice).toFixed(2);
        $(`#subtotal${index}`).text(newSubtotal);

        // Maintain an array to store subtotals for each item
        let subtotals = [];
        $('.text-right[data-title="Cart"] span').each(function () {
          const subtotalValue = parseFloat($(this).text().replace('$', '').trim());
          subtotals.push(subtotalValue);
        });

        // Sum up the subtotals
        let totalSubTotal = subtotals.reduce((acc, subtotal) => acc + subtotal, 0);

        $('.cart_total_amount span').text(`${totalSubTotal.toFixed(2)}`);
        console.log(totalSubTotal);
      }
    },
    error: function (xhr, status, error) {
      console.error("Error updating quantity:", error);
      const errorMessage = xhr.responseJSON ? xhr.responseJSON.error : "Unknown error";
      Swal.fire({
        icon: "error",
        title: "Hello...",
        text: errorMessage,
      });
    }
  });
}
// Update the subtotal on the page

function updateSubtotal(data) {
  if (data && data.success) {
    let newSubTotal = data.subTotal;
    let subtotalElement = document.getElementById("subtotal");
    let totalElement = document.getElementById("total");

    subtotalElement.innerText = `₹${newSubTotal.toLocaleString()}`;
    totalElement.innerText = `₹${newSubTotal.toLocaleString()}`;
  } else {
    console.error(`Error updating subtotal: ${data.message}`);
  }
}

// checkout products
function checkout(addressLength, cartLength) {
  console.log('is this calling');
 
  const hasAddress = addressLength > 0;
  const hasCart = cartLength > 0;
  
  if (!hasCart) {
    invalidCart();
   
  } else {
    if (!hasAddress) {
      invalidAddress();
    } else {
      if (document.getElementById("Razorpay").checked) {
        sendRazorpayRequest();
      } else if (document.getElementById("cod").checked) {
       
        sendCashOnDeliveryRequest();
      } else if (document.getElementById("wallet").checked) {
        sendWalletRequest();
      }
    }
  }

  function sendWalletRequest() {
    const formData = new FormData(document.getElementById("orderFormData"));
    const couponCode = document.getElementById("couponCode")
    const totalPrice = document.getElementById("total").innerText;
    const total = extractNumericValue(totalPrice);

    const requestData = {
      paymentMethod: "Wallet",
      formData: Object.fromEntries(formData),
      totalPrice: total,
      couponCode,
    };
    console.log(requestData);
    $.ajax({
      url: "/checkout/wallet",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(requestData),
      success: function (data) {
        if (data.success) {
          window.location.href = "/success-page";
        } else {
          const walletError = document.getElementById("walletError");
          walletError.innerText = data.message || "An unknown error occurred.";
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("Ajax error:", errorThrown);
        const walletError = document.getElementById("walletError");
        walletError.innerText = jqXHR.responseJSON.message || "An error occurred while processing your request.";
      },
    });
  }

  // Function to send a request for creating a Razorpay order
  function sendRazorpayRequest() {
    console.log('in this coming...');
    const couponCode = document.getElementById("couponCode")
    const formData = new FormData(document.getElementById("orderFormData"));
    console.log('##', formData)
    const totalPrice = document.getElementById("total").innerText;
    const total = extractNumericValue(totalPrice);
 
    const requestData = {
      paymentMethod: "Razorpay",
      formData: Object.fromEntries(formData),
      totalPrice: total,
      couponCode
    };
    console.log('$$',requestData);

    $.ajax({
      url: "/checkout/razor-pay",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(requestData),
      success: function (res) {
        if (res.success) {
          initiateRazorpayPayment(res);
        } else {
          console.error("Error creating Razorpay order:", res.message);
          alert("Error creating Razorpay order");
        }
      },
      error: function (error) {
        console.error("Ajax error:", error);
        alert("Ajax error");
      },
    });
  }

  function initiateRazorpayPayment(orderDetails) {
   
    console.log(orderDetails);
    const options = {
      key: orderDetails.key_id,
      amount: orderDetails.amount,
      currency: orderDetails.currency,
      order_id: orderDetails.order_id,
      handler: function (response) {
        toastr.success("Payment completed sucessfully.", "Checkout");

        sendCompleteRequest(response, orderDetails.formData);
      },
      prefill: {
        contact: orderDetails.contact,
        name: orderDetails.name,
        email: orderDetails.email,
      },
    };

    const rzp1 = window.Razorpay(options);
    rzp1.on("payment.failed", function (response) {
      alert("Razorpay payment failed");
    });
    rzp1.open();
  }

  function sendCashOnDeliveryRequest() {
    console.log('this caling');
    const formData = new FormData(document.getElementById("orderFormData"));
    const couponCode = document.getElementById("couponCode")
    const totalPrice = document.getElementById("total").innerText;
    const total = extractNumericValue(totalPrice);

    if (total > 1000) {
      // Show an error swal for orders above 1000 rupees
      Swal.fire({
        title: 'Error!',
        text: 'Cannot place an order above 1000 rupees with Cash On Delivery.',
        icon: 'error',
        confirmButtonText: 'OK',
    });
      
  }  
    const requestData = {
      paymentMethod: "CashOnDelivery",
      formData: Object.fromEntries(formData),
      totalPrice: total,
      couponCode
 
    };
    console.log(requestData);
    $.ajax({
      url: "/checkout/cash-on-delivery",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(requestData),
      success: function (data) {
        if (data.success) {
          window.location.href = "/success-page";
        } else {
        }
      },
      error: function (error) {
        console.error("Ajax error:", error);
      },
    });
  }

  // Function for an invalid cart
  function invalidCart() {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Cart is empty!",
    });
  }

  // Function for an invalid address
  function invalidAddress() {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Add one address!",
    });
  }
}

function extractNumericValue(str) {
  const numericString = str.replace(/[^0-9.-]+/g, "");
  return parseFloat(numericString);
}

// Function to send a POST request with formData to the completed route
function sendCompleteRequest(response, formData) {
  // const couponCodeElement = document.getElementById("couponMessage");
  // const couponCode = couponCodeElement.innerText.split(" ")[0];

  const totalPrice = document.getElementById("total").innerText;
  const total = extractNumericValue(totalPrice);

  const requestData = {
    paymentMethod: "Razor Pay",
    formData: formData,
    // couponCode,
    totalPrice: total,
  };

  // Make an AJAX request to the server for "/checkout/razor-pay/completed"
  $.ajax({
    url: "/checkout/razor-pay/completed",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(requestData),
    success: function (data) {
      // Handle success if needed
      window.location.href = "/success-page";
    },
    error: function (error) {
      // Handle the error if needed
      console.error("Completed route request error:", error);
    },
  });
}

// serch products in the shop
function submitSearch() {
  const searchInput = document.getElementById("search").value;

  // Using fetch to send the search query to the server
  fetch(`/products-shop?search=${encodeURIComponent(searchInput)}`)
    .then((response) => response.text())
    .then((data) => {
    })
    .catch((error) => console.error("Error:", error));
}

// delete address request
function deleteAddress(addressId) {
  console.log('Deleting address with ID:', addressId);

  const deleteAddressModal = document.getElementById("confirmationModal");
  console.log('Modal Element:', deleteAddressModal);

  if (deleteAddressModal) {
    deleteAddressModal.style.display = "block";

    function hideModel() {
      const deleteAddressModal = document.getElementById("confirmationModal");
      deleteAddressModal.style.display = "none";
    }
    const confirmationModal = new bootstrap.Modal(
      document.getElementById("confirmationModal"),
      {
          backdrop: "static", // Prevent closing on click outside the modal
          keyboard: false, // Prevent closing with the keyboard Esc key
      }
  );

  // Display the modal
  confirmationModal.show();
    function deleteAddressConfirmed() {
      hideModel();
      fetch(`/user-profile/delete-address?id=${addressId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.success) {
            window.location.href = "/user-profile";
          }
        })
        .catch((error) => {
          console.error("Error deleting address", error);
        });
    }

    const deleteConfirmButton = document.getElementById("deleteButton");
    deleteConfirmButton.addEventListener("click", deleteAddressConfirmed);

    const cancelBtn = document.getElementById("cancelBtn");
    cancelBtn.addEventListener("click", hideModel);
  } else {
    console.error('Modal element not found');
  }
}
function confirmDelete(productId) {

  // Set up a Bootstrap modal for confirmation
  const confirmationModal = new bootstrap.Modal(
      document.getElementById("confirmationModal"),
      {
          backdrop: "static", // Prevent closing on click outside the modal
          keyboard: false, // Prevent closing with the keyboard Esc key
      }
  );

  // Display the modal
  confirmationModal.show();

  // Set up the delete button's click event to send a DELETE request
  const deleteButton = document.getElementById("deleteButton");
  deleteButton.addEventListener("click", async () => {
      try {
          // Send a DELETE request using the Fetch API
          const response = await fetch(`/products/cart-delete?id=${productId}`, {
              method: "DELETE",
          });

          if (response.ok) {
              // Redirect or perform any other action after successful deletion
              window.location.href = "/Add-to-cart";
          } else {
              // Handle error response
              console.error("Error deleting cart item:", response.statusText);
          }
      } catch (error) {
          console.error("Error deleting cart item:", error);
      }
  });
}

function couponConfirmDelete(couponId) {
  console.log('it is calling...');
  // Set up a Bootstrap modal for confirmation
  const confirmationModal = new bootstrap.Modal(
      document.getElementById("confirmationModal"),
      {
          backdrop: "static", // Prevent closing on click outside the modal
          keyboard: false, // Prevent closing with the keyboard Esc key
      }
  );

  // Display the modal
  confirmationModal.show();

  // Set up the delete button's click event to send a DELETE request
  const deleteButton = document.getElementById("deleteButton");
  deleteButton.addEventListener("click", async (event) => {
    event.preventDefault();
    console.log('ivide')

      try {
          // Send a DELETE request using the Fetch API
          const response = await fetch(`/admin/coupon-delete?id=${couponId}`, {
              method: "DELETE",
          });
          console.log(response);


          if (response.ok) {
              // Redirect or perform any other action after successful deletion
              window.location.href = "/admin/coupons";
          } else {
              // Handle error response
              console.error("Error :", response.statusText);
          }
      } catch (error) {
          console.error("Error deleting coupon:", error);
      }
  });
}


function RemoveWishlist(productId) {
  // Set up a Bootstrap modal for confirmation
  const confirmationModal = new bootstrap.Modal(
      document.getElementById("confirmationModal"),
      {
          backdrop: "static", // Prevent closing on click outside the modal
          keyboard: false, // Prevent closing with the keyboard Esc key
      }
  );

  // Display the modal
  confirmationModal.show();

  // Set up the delete button's click event to send a DELETE request
  const deleteButton = document.getElementById("deleteButton");
  deleteButton.addEventListener("click", async () => {
      try {
          // Send a DELETE request using the Fetch API
          const response = await fetch(`/products/wishlist-delete?id=${productId}`, {
              method: "DELETE",
          });

          if (response.ok) {
              // Redirect or perform any other action after successful deletion
              window.location.href = "/wishlist";
          } else {
              // Handle error response
              console.error("Error deleting wishlist item:", response.statusText);
          }
      } catch (error) {
          console.error("Error deleting wishlist item:", error);
      }
  });
}
function updateSalesReport() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  
  console.log('Start Date:', startDate);
  console.log('End Date:', endDate);

  const apiUrl = `/admin/salesReport?startDate=${startDate}&endDate=${endDate}`;
  window.location.href = apiUrl;
}

async function submitOffer(productId) {
  try {
    console.log('hello...',productId);
    const offerInput = document.getElementById('offerInput' + productId);
    const offer = offerInput.value;
    console.log(offer);
    if (parseInt(offer) > 100) {
      // Show a SweetAlert error message
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Offer percentage cannot be more than 100!',
      });
      return; // Stop execution if the offer is invalid
    }

    const response = await fetch('/admin/submitOffer', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        offer,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);
      if (data.success) {
        clearInputValue(offerInput);
        hideModal('applyOfferModal', productId);
        updatePrice(data.salePrice, productId);
        console.log(data.salePrice);
        reloadPage()
      }
    }
  } catch (error) {
    console.error('Error while submitting offer:', error);
  }
}
async function removeOffer(productId) {
  try {
    console.log(productId);
    const offerInput = document.getElementById('offerInput' + productId);
    const offer = offerInput.value;

    const response = await fetch('/admin/removeProductOffer', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        offer,
      }),
    });

    const data = await response.json();

    if (data.success) {
      hideModal('removeOfferModal', productId);
      updatePrice(data.salePrice, productId);
      reloadPage();
    }
  } catch (error) {
    console.error('Error while removing offer:', error);
  }
}
function updatePrice(amount, productId) {

  const salePriceInput = document.getElementById('salePrice' + productId);
  salePriceInput.innerText = amount;
}

function hideModal(modalId, productId) {
  $(`#${modalId}${productId}`).modal('hide');
}

function clearInputValue(inputElement) {
  inputElement.value = '';
}

function reloadPage() {
  window.location.reload(true);
}



// add offer to a category


// Function to open the offer modal
async function submitCategoryOffer(categoryId) {
  console.log(categoryId);
  // Get the offer input element
  const offerInput = document.getElementById('offerInput'+categoryId);
 
  const offer = offerInput.value;
 

  if (parseInt(offer) > 100) {
      // Show an alert for an invalid offer percentage
      alert('Offer percentage cannot be more than 100!');
      return; // Stop execution if the offer is invalid
  }

  try {
      const response = await fetch('/admin/submitCategoryOffer', {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              categoryId,
              offer,
          }),
      });

      if (response.ok) {
          const data = await response.json();
          console.log(data);

          if (data.success) {
              // Clear the offer input
              offerInput.value = "";

              // Show the offer modal
              const modalId = 'offerModal' + categoryId;
              const offerModal = new bootstrap.Modal(document.getElementById(modalId));
              offerModal.show();

              // Display a success message (you can use a library like Toastr here)
              alert('Category offer applied successfully!');
              window.location.reload()
          }
      } else {
          console.error("There was some problem while fetching the data");
      }
  } catch (error) {
      console.error("An error occurred: " + error);
  }
}
function removeOfferCategory(categoryId) {
  // Assuming you are using fetch API for making requests
  fetch('/admin/removeCategoryOffer', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      categoryId: categoryId,
    }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Show success notification using SweetAlert
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: data.message,
      }).then((result) => {
        // Optionally, you can trigger a page reload or update the UI here
        if (result.isConfirmed || result.isDismissed) {
          location.reload();
        }
      });
    } else {
      // Show error notification using SweetAlert
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.message,
      });
    }
  })
  .catch(error => {
    // Handle network or other errors
    console.error('Error:', error);
  });
}
