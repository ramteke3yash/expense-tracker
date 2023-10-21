const API_BASE_URL = "http://13.238.4.178:3000";

// Get references to HTML elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const form = document.getElementById("login-form");
const errorMessageElement = document.getElementById("error-message");

// Function to display an error message
function displayError(message) {
  errorMessageElement.textContent = message;
}

// Function to handle user login
async function loginUser() {
  const email = emailInput.value;
  const password = passwordInput.value;

  const user = { email, password };

  try {
    const response = await axios.post(`${API_BASE_URL}/user/login`, user);

    console.log("User login successful:", response.data);
    localStorage.setItem("token", response.data.token);

    // Clear the form
    emailInput.value = "";
    passwordInput.value = "";

    window.location.href = "./tracker.html";
  } catch (err) {
    if (err.response) {
      const errorMessage = err.response.data.error;
      console.error("Login error:", errorMessage);
      displayError(errorMessage);
    } else {
      console.error("Network error:", err.message);
      displayError("Network error. Please try again.");
    }
  }
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  loginUser();
});

document.getElementById("forgotpassword").addEventListener("click", () => {
  window.location.href = "./forgot-password.html";
});

document.getElementById("signup").addEventListener("click", () => {
  window.location.href = "./sign-up.html";
});
