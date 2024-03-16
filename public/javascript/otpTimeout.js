// timeout display on otp verificaition


let timeoutSeconds = 1 * 60;

function updateTimeoutDisplay() {
  const minutes = Math.floor(timeoutSeconds / 60);
  const seconds = timeoutSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  document.getElementById(
    "timeoutDisplay"
  ).innerText = `Time remaining: ${formattedTime}`;

}

// Function to be executed after the timeout
function timeoutCompleted() {
  document.getElementById("timeoutDisplay").innerText =
    "Don't recieve the code?";

    document.getElementById("resendOtp").style.display="block";
    document.getElementById("inputOtp").disabled = true;
}

const countdownInterval = setInterval(function () {
  updateTimeoutDisplay();
  timeoutSeconds--;

  // Check if the timeout has reached 0
  if (timeoutSeconds < 0) {
    clearInterval(countdownInterval);
    timeoutCompleted();
  }
}, 1000);


function validateForm() {
    // Get the value of the OTP input field
    var otpInputValue = document.getElementById('inputOtp').value;
  
    // Check if the OTP input is empty
    if (!otpInputValue.trim()) {
      // Display an error message (you can customize this part)
      var messageElement = document.getElementById('message');
      if (messageElement) {
        messageElement.innerHTML = 'Please enter the OTP.';
      }
  
      // Prevent the form from submitting
      return false;
    }
  
    // If validation passes, the form will submit
    return true;
  }

  function resendOtp(){
    timeoutSeconds = 1 * 60;
    document.getElementById("resendOtp").style.display="none";
    document.getElementById("inputOtp").disabled = false;

    const countdownInterval = setInterval(function () {
        updateTimeoutDisplay();
        timeoutSeconds--;
      
        // Check if the timeout has reached 0
        if (timeoutSeconds < 0) {
          clearInterval(countdownInterval);
          timeoutCompleted();
        }
      }, 1000);
  }