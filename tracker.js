const API_BASE_URL = "http://localhost:3000";

// Cache frequently used elements
const form = document.getElementById("my-form");
const amountInput = document.getElementById("amount");
const descriptionInput = document.getElementById("Description");
const categoryInput = document.getElementById("Category");
const expenseList = document.getElementById("expenses");
let editId = null;

// Function to edit an expense
function editExpense(expense) {
  // Populate form fields with expense data
  amountInput.value = expense.amount;
  descriptionInput.value = expense.description;
  categoryInput.value = expense.category;
  editId = expense.id;
}

// Function to add or update an expense
async function addOrUpdateExpense() {
  const amount = amountInput.value;
  const description = descriptionInput.value;
  const category = categoryInput.value;

  const editIndex = form.getAttribute("data-edit-index");

  if (editId) {
    // Editing an existing expense
    const expense = { amount, description, category };
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE_URL}/expense/edit-expense/${editId}`,
        expense,
        {
          headers: { Authorization: token },
        }
      );
      editId = null;
      loadExpenseList();
    } catch (err) {
      console.log(err);
    }
  } else {
    //Creating a new expense
    const expense = { amount, description, category };
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/expense/add-expense`, expense, {
        headers: { Authorization: token },
      });
    } catch (err) {
      console.log(err);
    }
  }

  // Clear the form
  form.removeAttribute("data-edit-index");
  amountInput.value = "";
  descriptionInput.value = "";
  categoryInput.value = "";

  // Reload and display the expenses
  loadExpenseList();
  //showLeaderboard();
}

// Function to delete an expense
async function deleteExpense(id) {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_BASE_URL}/expense/delete-expense/${id}`, {
      headers: { Authorization: token },
    });
  } catch (err) {
    console.log(err);
  }

  // Reload and display the expenses
  loadExpenseList();
}

// Function to load existing expenses from the API and display them
async function loadExpenseList() {
  try {
    const token = localStorage.getItem("token");
    const decodeToken = parseJwt(token);
    console.log("my token-->", decodeToken);
    const ispremiumuser = decodeToken.ispremiumuser;
    if (ispremiumuser) {
      updatePremiumStatus(ispremiumuser);
      showLeaderboard();
    }
    const response = await axios.get(`${API_BASE_URL}/expense/get-expenses`, {
      headers: { Authorization: token },
    });
    const expenses = response.data.allExpenses;

    // Clear the expense list
    expenseList.innerHTML = "";

    // Display each expense in the expense list
    expenses.forEach(function (expense, index) {
      const li = document.createElement("li");
      li.textContent = `Expense Amount:₹ ${expense.amount}, Description: ${expense.description}, Category: ${expense.category}`;

      // Create the Edit button
      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.addEventListener("click", function () {
        editExpense(expense);
      });
      li.appendChild(editButton);

      // Create the Delete button
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", function () {
        deleteExpense(expense.id);
      });
      li.appendChild(deleteButton);

      // Append list item to the expense list
      expenseList.appendChild(li);
    });
  } catch (err) {
    console.log(err);
  }
}

// Add event listener for form submission
form.addEventListener("submit", function (e) {
  e.preventDefault();
  addOrUpdateExpense();
});

// Load existing expenses from the API and display them
document.addEventListener("DOMContentLoaded", loadExpenseList, showLeaderboard);

function updatePremiumStatus(ispremium) {
  const buyPremiumButton = document.getElementById("rzp-button");
  const premiumStatus = document.getElementById("premium-status");

  if (ispremium) {
    // User is a premium user
    buyPremiumButton.style.display = "none";
    premiumStatus.textContent = "Premium User";
  } else {
    // User is not a premium user
    buyPremiumButton.style.display = "block";
    premiumStatus.textContent = "";
  }
}

function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

document.getElementById("rzp-button").onclick = async function (e) {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/purchase/premiummember`, {
    headers: { Authorization: token },
  });
  console.log("this is a response-->", response);

  var options = {
    key: response.data.key_id,
    order_id: response.data.order.id,
    handler: async function (response) {
      try {
        const updateResponse = await axios.post(
          `${API_BASE_URL}/purchase/updatetransactionstatus`,
          {
            order_id: options.order_id,
            payment_id: response.razorpay_payment_id,
          },
          {
            headers: { Authorization: token },
          }
        );
        localStorage.setItem("token", updateResponse.data.token);
        showLeaderboard();
        console.log("Transaction update response: ", updateResponse.data);

        if (updateResponse.data.success) {
          alert("You are now a premium user");
          updatePremiumStatus(true);
        } else {
          alert("Transaction failed. Please try again.");
        }
      } catch (error) {
        console.error("Error updating transaction status: ", error);
        alert("Something went wrong. Please try again later.");
      }
    },
  };
  const rzp1 = new Razorpay(options);
  rzp1.open();
  e.preventDefault();

  rzp1.on("payment.failed", async function (response) {
    console.log("Payment failed: ", response);
    const updateResponse = await axios.post(
      `${API_BASE_URL}/purchase/updatetransactionstatus`,
      {
        order_id: options.order_id,
      },
      {
        headers: { Authorization: token },
      }
    );
    // alert("Payment failed. Please try again.");
  });
};

function showLeaderboard() {
  const inputElement = document.createElement("input");
  inputElement.type = "button";
  inputElement.value = "Show Leaderboard";
  inputElement.onclick = async () => {
    const token = localStorage.getItem("token");
    const userLeaderBoardArray = await axios.get(
      `${API_BASE_URL}/premium/showLeaderBoard`,
      {
        headers: { Authorization: token },
      }
    );
    console.log(userLeaderBoardArray);

    var LeaderboardElem = document.getElementById("leaderboard");
    LeaderboardElem.innerHTML += "<h1> Leader Board</h1>";
    userLeaderBoardArray.data.forEach((userDetails) => {
      LeaderboardElem.innerHTML += `<li>Name: ${userDetails.name} Total Expenses: ${userDetails.totalExpenses}</li>`;
    });
  };
  document.getElementById("message").appendChild(inputElement);
}
