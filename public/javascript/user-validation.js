function validate() {
  console.log(' i am calling ');
  const firstName = document.getElementById("firstName");
  console.log(firstName.value);
  const lastName = document.getElementById("lastName");
  const email = document.getElementById("email");
  const streetAddress = document.getElementById("streetAddress");
  const city = document.getElementById("city");
  const zipCode = document.getElementById("zipCode");
  const phoneNumber = document.getElementById("phoneNumber");

  // Error fields
  const firstNameError = document.getElementById("firstNameError");
  const lastNameError = document.getElementById("lastNameError");
  const emailError = document.getElementById("emailError");
  const streetAddressError = document.getElementById("streetAddressError");
  const cityError = document.getElementById("cityError");
  const zipCodeError = document.getElementById("zipCodeError");
  const phoneNumberError = document.getElementById("phoneNumberError");

  // Regex
  const nameRegex = /^[a-zA-Z0-9\s]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const streetAddressRegex = /^[a-zA-Z0-9\s,'-]+$/;
  const cityRegex = /^[a-zA-Z\s]+$/;
  const zipCodeRegex = /^\d{6}(?:[-\s]\d{4})?$/;
  const phoneNumberRegex = /^\d{10}$/;

  // First Name field
  if (firstName.value.trim() === "") {
    firstNameError.innerHTML = "First name is required";
    setTimeout(() => {
      firstNameError.innerHTML = "";
    }, 5000);
    return false;
  }
  
  if (!nameRegex.test(firstName.value)) {
    firstNameError.innerHTML = "Invalid name";
    setTimeout(() => {
      firstNameError.innerHTML = "";
    }, 5000);
    return false;
  }

  // Last Name field
  if (lastName.value.trim() === "") {
    lastNameError.innerHTML = "Last name is required";
    setTimeout(() => {
      lastNameError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!nameRegex.test(lastName.value)) {
    lastNameError.innerHTML = "Invalid name";
    setTimeout(() => {
      lastNameError.innerHTML = "";
    }, 5000);
    return false;
  }

  // Email field (assuming it exists)
  if (email.value.trim() === "") {
    emailError.innerHTML = "email is required";
    setTimeout(() => {
      emailError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!emailRegex.test(email.value)) {
    emailError.innerHTML = "Invalid email";
    setTimeout(() => {
      emailError.innerHTML = "";
    }, 5000);
    return false;
  }

  // Street Address field (assuming it exists)
  if (streetAddress.value.trim() === "") {
    streetAddressError.innerHTML = "streetAddress is required";
    setTimeout(() => {
      streetAddressError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!streetAddressRegex.test(streetAddress.value)) {
    streetAddressError.innerHTML = "Invalid streetAddress";
    setTimeout(() => {
      streetAddressError.innerHTML = "";
    }, 5000);
    return false;
  }

  // City field (assuming it exists)
  if (city.value.trim() === "") {
    cityError.innerHTML = "city is required";
    setTimeout(() => {
      cityError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!cityRegex.test(city.value)) {
    cityError.innerHTML = "Invalid city";
    setTimeout(() => {
      cityError.innerHTML = "";
    }, 5000);
    return false;
  }

  // Zip Code field (assuming it exists)
  if (zipCode.value.trim() === "") {
    zipCodeError.innerHTML = "zipCode is required";
    setTimeout(() => {
      zipCodeError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!zipCodeRegex.test(zipCode.value)) {
    zipCodeError.innerHTML = "Invalid zipCode";
    setTimeout(() => {
      zipCodeError.innerHTML = "";
    }, 5000);
    return false;
  }

  // Phone Number field (assuming it exists)
  if (phoneNumber.value.trim() === "") {
    phoneNumberError.innerHTML = "phoneNumber is required";
    setTimeout(() => {
      phoneNumberError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!phoneNumberRegex.test(phoneNumber.value)) {
    phoneNumberError.innerHTML = "Invalid phoneNumber";
    setTimeout(() => {
      phoneNumberError.innerHTML = "";
    }, 5000);
    return false;
  }

  // Add validation logic for other fields...
console.log(firstName.value);
  return true;
}

const checkOut = document.querySelector("#checkOut");

checkOut.addEventListener("click", () => {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "Add address before checkout!",
  });
});

// update user mobile number 

function mobileValidate(userId) {
  const mobile = document.querySelector("#mobile");

  const mobileError = document.querySelector("#mobileError");

  const mobileRegex = /^\d{10}$/;

  if (mobile.value.trim() === "") {
    mobileError.innerHTML = "Please enter a mobile number";
    setTimeout(() => {
      mobileError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!mobileRegex.test(mobile.value)) {
    mobileError.innerHTML = "Invalid mobile number";
    setTimeout(() => {
      mobileError.innerHTML = "";
    }, 5000);
    return false;
  }

  // Make an AJAX request
  const formData = {
    mobile: mobile.value,
  };

  $.ajax({
    type: "POST",
    url: `/update-mobile?id=${userId}`,
    data: formData,
    success: function (data) {

      mobile.value = "";

      toastr.success("Password updated sucessfully", "Update password");

    },
    error: function (error) {
      mobile.value = "";

      // Show the mobile error
      mobileError.innerHTML = "Error updating mobile number. Please try again!";
      setTimeout(() => {
        mobileError.innerHTML = "";
      }, 5000);
    },
  });

  return false;
}



// validate the password changing page 

function passwordValidation(userId) {
  console.log("ddsdfddddd");
  console.log(userId);

  const password = document.querySelector("#Password");
const newPassword = document.querySelector("#newPassword");
const confirmPassword = document.querySelector("#confirmPassword");

const passwordError = document.querySelector("#PasswordError");
const newPasswordError = document.querySelector("#newPasswordError");
const confirmPasswordError = document.querySelector("#confirmPasswordError");

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;

// current password
if (password.value.trim() === "") {
    passwordError.innerHTML = "Enter your password";
    setTimeout(() => {
        passwordError.innerHTML = "";
    }, 5000);
    return false;
} else {
    passwordError.innerHTML = ""; // Clear the error message if the field is not empty
}

// new password
if (newPassword.value.trim() === "") {
    newPasswordError.innerHTML = "Please enter the new password";
    setTimeout(() => {
        newPasswordError.innerHTML = "";
    }, 5000);
    return false;
} else {
    newPasswordError.innerHTML = ""; // Clear the error message if the field is not empty
}
if (!passwordRegex.test(newPassword.value)) {
    newPasswordError.innerHTML = "The password must be strong";
    setTimeout(() => {
        newPasswordError.innerHTML = "";
    }, 5000);
    return false;
} else {
    newPasswordError.innerHTML = ""; // Clear the error message if the password is strong
}

// confirm new password
if (confirmPassword.value.trim() === "") {
    confirmPasswordError.innerHTML = "Please confirm your password";
    setTimeout(() => {
        confirmPasswordError.innerHTML = "";
    }, 5000);
    return false;
} else {
    confirmPasswordError.innerHTML = ""; // Clear the error message if the field is not empty
}

if (newPassword.value !== confirmPassword.value) {
    newPasswordError.innerHTML = "Passwords do not match";
    confirmPasswordError.innerHTML = "Passwords do not match";
    setTimeout(() => {
        newPasswordError.innerHTML = "";
    }, 5000);
    return false;
} else {
    newPasswordError.innerHTML = ""; // Clear the error message if passwords match
    confirmPasswordError.innerHTML = ""; // Clear the error message if passwords match
}

if (!passwordRegex.test(confirmPassword.value)) {
    confirmPasswordError.innerHTML = "The password must be strong";
    setTimeout(() => {
        confirmPasswordError.innerHTML = "";
    }, 5000);
    return false;
} else {
    confirmPasswordError.innerHTML = ""; // Clear the error message if the password is strong
}

  // Make an AJAX request
  const formData = {
    password: password.value,
    newPassword: newPassword.value,
  };

  console.log(formData);

  $.ajax({
    type: "POST",
    url: `/edit-password?id=${userId}`,
    data: formData,
    success: function (data) {
      password.value = "";
      newPassword.value = "";
      confirmPassword.value = "";

      // Use Swal for success message
      Swal.fire({
        icon: "success",
        title: "Password Updated",
        text: "Password updated successfully",
      });

    },
    error: function (error) {
      console.log(error);
      password.value = "";
      newPassword.value = "";
      confirmPassword.value = "";
      
      // Use Swal for error message
      Swal.fire({
        icon: "error",
        title: "Password Update Failed",
        text: "Incorrect current password. Please try again!",
      });
    },
  });

  return false;
}


function usernameValidation() {
  const editUserName = document.querySelector("#editUserName");
  const usernameError = document.querySelector("#usernameError");

  const nameRegex = /^[a-zA-Z0-9\s]+$/;

  if (editUserName.value.trim() === "") {
    usernameError.innerHTML = "Username is required";
    setTimeout(() => {
      usernameError.innerHTML = "";
    }, 5000);
    return false;
  }

  if (!nameRegex.test(editUserName.value)) {
    usernameError.innerHTML = "Invalid username";
    setTimeout(() => {
      usernameError.innerHTML = "";
    }, 5000);
    return false;
  }

  return true;
}


