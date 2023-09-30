const API_BASE_URL = "http://localhost:3000";

const passwordInput = document.getElementById("password");
const form = document.getElementById("reset-password-form");

// Function to submit the new password for reset
async function resetPassword() {
  const password = passwordInput.value;
  console.log("this is my new-Password:-", password);

  const uuid = getUUIDFromQueryParameter();

  if (!uuid) {
    console.error("UUID not found in query parameter");
    return;
  }

  const resetData = { password };

  try {
    const response = await axios.post(
      `${API_BASE_URL}/password/resetpassword/${uuid}`,
      resetData
    );

    console.log("Password reset successful:", response.data);
    alert("Password has been reset successfully!");
    // window.location.href = "/login.html";
  } catch (error) {
    console.error("Password reset failed:", error);
    alert("Password reset failed. Please try again.");
  }
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  resetPassword();
});

// Function to extract UUID from the query parameter
function getUUIDFromQueryParameter() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get("uuid");
}
