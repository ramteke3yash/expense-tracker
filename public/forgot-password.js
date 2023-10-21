const API_BASE_URL = "http://localhost:3000";

const emailInput = document.getElementById("email");
const form = document.getElementById("reset-password-form");

// Function to initiate the password reset process
async function resetPassword() {
  const email = emailInput.value;

  const user = { email };
  try {
    const response = await axios.post(
      `${API_BASE_URL}/password/forgotpassword`,
      user
    );
    if (response.status == 200) {
      alert("password reset link send successfully!!");
    }
  } catch (err) {
    console.log("error: Something went wrong", err);
    alert("Something went wrong");
  }
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  resetPassword();
});
