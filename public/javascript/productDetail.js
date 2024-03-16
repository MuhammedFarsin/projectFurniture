document.addEventListener("DOMContentLoaded", function () {
    // Activate the main image carousel
    $("#productCarousel").carousel();

    // Activate the thumbnail carousel
    $("#product_details_slider").carousel();

    // Enable thumbnail carousel control
    $(".thumbnail-control-prev").click(function () {
      $("#product_details_slider").carousel("prev");
    });

    $(".thumbnail-control-next").click(function () {
      $("#product_details_slider").carousel("next");
    });

    // Sync the main carousel with the thumbnail carousel
    $("#productCarousel").on("slide.bs.carousel", function (event) {
      var index = event.to;
      $("#product_details_slider").carousel(index);
    });
  });

  function validateQuantity(input) {
    // Remove non-numeric characters
    input.value = input.value.replace(/[^0-9]/g, '');

    // Ensure the value is within the specified range
    const minValue = parseInt(input.min);
    const maxValue = parseInt(input.max);
    let value = parseInt(input.value);

    if (isNaN(value) || value < 0) {
        // If the value is not a valid positive number, set it to the minimum value
        input.value = minValue;
    } else {
        // Ensure the value is within the specified range
        if (value < minValue) {
            input.value = minValue;
        } else if (value > maxValue) {
            input.value = maxValue;
        }
    }
}