const API_BASE_URL = "http://localhost:3000";

// console.log("this is js file");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const form = document.getElementById("my-form");

// Function to display an error message
function displayError(message) {
  const errorMessageElement = document.getElementById("error-message");
  errorMessageElement.textContent = message;
}

// Function to add a user
async function addUser() {
  const name = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;

  const user = { name, email, password };

  try {
    console.log(user);
    const response = await axios.post(`${API_BASE_URL}/user/add-user`, user);
    console.log("User added successfully:", response.data);
  } catch (err) {
    if (err.response) {
      // Server responded with an error
      const errorMessage = err.response.data.error;
      console.error("Error adding user:", errorMessage);
      displayError(errorMessage); // Display the error on the website
    } else {
      // An error occurred but there was no response from the server
      console.error("Network error:", err.message);
      displayError("Network error. Please try again."); // Display a generic network error message
    }
  }

  // Clear the form
  nameInput.value = "";
  emailInput.value = "";
  passwordInput.value = "";
}

// Add event listener for form submission
form.addEventListener("submit", function (e) {
  e.preventDefault();
  addUser();
});
