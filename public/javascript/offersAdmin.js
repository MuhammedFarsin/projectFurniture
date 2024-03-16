// add offer to each products
// function submitOffer(productId) {
//   console.log(productId);
//   const offerPercentage = document.getElementById(`offerInput${productId}`);
//   console.log(offerPercentage);

//   fetch("/admin/products/add-product-offer", {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       productId,
//       offerPercentage: offerPercentage.value,
//     }),
//   })
//     .then((response) => {
//       if (response.ok) {
//         return response.json();
//       }
//     })
//     .then((data) => {
//       console.log(data);
//       if (data.success) {
//         offerPercentage.value = "";
//         toastr.success(data.message, "Offer management");
//         $("#applyOfferModal" + productId).modal("hide");

//         updatePrice(data.salePrice, productId);
//         //   changeButtonAndModel(productId, "Remove offer");
//         window.location.reload();
//       }
//     })
//     .catch((error) => {
//       console.error("there was some problem while fetching the data" + error);
//     });
// }

// function updatePrice(amount, productId) {
//   console.log(productId);

//   const salePriceInput = document.getElementById(`salePrice${productId}`);
//   salePriceInput.innerText = amount;
// }

// to change the add offer to remove offer
// function changeButtonAndModel(productId, buttonText) {
//     console.log(productId);

//     const offerButton = document.getElementById("offerButton");

//     if (offerButton) {
//       offerButton.innerText = buttonText === "Remove offer" ? "Remove offer" : "Apply offer";
//       offerButton.setAttribute(
//         "data-bs-target",
//         buttonText === "Remove offer"
//           ? `#removeOfferModal${productId}`
//           : `#applyOfferModal${productId}`
//       );
//     }
//   }

// remove the offer on the product
function removeOffer(productId) {
  fetch("/admin/products/remove-product-offer", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        toastr.success(data.message, "Offer management");
        $("#removeOfferModal" + productId).modal("hide");

        updatePrice(data.salePrice, productId);
        // changeButtonAndModel(categoryId, "Apply offer");
        window.location.reload();
      }
    });
}

