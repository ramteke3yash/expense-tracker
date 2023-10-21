const API_BASE_URL = "http://localhost:3000";
let decodeToken;

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

async function loadExpenseList(page = 1) {
  try {
    const token = localStorage.getItem("token");
    const decodeToken = parseJwt(token);
    const ispremiumuser = decodeToken.ispremiumuser;

    if (ispremiumuser) {
      updatePremiumStatus(ispremiumuser);
      showLeaderboard();
    }

    // Get the selected number of expenses per page from the dropdown
    const expensesPerPageSelect = document.getElementById("expenses-per-page");
    const expensesPerPage = parseInt(expensesPerPageSelect.value);

    // Save the preference in local storage
    localStorage.setItem("expensesPerPage", expensesPerPage);

    // Specify the number of expenses to fetch per page
    const limit = expensesPerPage;

    const response = await axios.get(`${API_BASE_URL}/expense/get-expenses`, {
      params: { page, limit },
      headers: { Authorization: token },
    });

    const expenses = response.data.allExpenses;
    const totalPages = Math.ceil(expenses.length / limit);

    // Update the pagination buttons
    updatePaginationButtons(totalPages, page);

    // Clear the expense list
    expenseList.innerHTML = "";

    // Display each expense on the current page
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    expenses.slice(startIndex, endIndex).forEach(function (expense, index) {
      const li = document.createElement("li");
      li.textContent = `Expense Amount:₹ ${expense.amount}, Description: ${expense.description}, Category: ${expense.category}`;

      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.addEventListener("click", function () {
        editExpense(expense);
      });
      editButton.style.borderRadius = "10px";
      editButton.style.backgroundColor = "whitesmoke";
      editButton.style.padding = "2px 5px";
      editButton.style.border = "none";
      li.appendChild(editButton);

      // Create the Delete button
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", function () {
        deleteExpense(expense.id);
      });
      deleteButton.style.borderRadius = "10px";
      deleteButton.style.backgroundColor = "whitesmoke";
      deleteButton.style.padding = "2px 5px";
      deleteButton.style.border = "none";

      li.appendChild(deleteButton);

      // Append list item to the expense list
      expenseList.appendChild(li);
    });
  } catch (err) {
    console.log(err);
  }
}

function updatePaginationButtons(totalPages, currentPage) {
  const paginationButtonsContainer =
    document.getElementById("pagination-buttons");
  paginationButtonsContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.addEventListener("click", function () {
      loadExpenseList(i);
    });

    if (i === currentPage) {
      button.classList.add("active");
    }

    button.style.borderRadius = "10px";
    button.style.backgroundColor = "whitesmoke";
    button.style.padding = "2px 7px";
    button.style.border = "none";

    paginationButtonsContainer.appendChild(button);
  }
}

// Add event listener for form submission
form.addEventListener("submit", function (e) {
  e.preventDefault();
  addOrUpdateExpense();
});

// Load existing expenses from the API and display them
document.addEventListener("DOMContentLoaded", function () {
  const expensesPerPageSelect = document.getElementById("expenses-per-page");
  const storedExpensesPerPage = localStorage.getItem("expensesPerPage");
  if (storedExpensesPerPage) {
    expensesPerPageSelect.value = storedExpensesPerPage;
  }
  expensesPerPageSelect.addEventListener("change", function () {
    loadExpenseList(1); // Load the first page when the selection changes
  });

  loadExpenseList(1);
});

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

//decode the token
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

  decodeToken = JSON.parse(jsonPayload);

  return JSON.parse(jsonPayload);
}

//                 --- buy premium ---
document.getElementById("rzp-button").onclick = async function (e) {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/purchase/premiummember`, {
    headers: { Authorization: token },
  });

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
  });
};
function showLeaderboard() {
  const token = localStorage.getItem("token");
  const ispremium = decodeToken.ispremiumuser;
  const downloadButtonContainer = document.getElementById(
    "download-button-container"
  );
  const LeaderboardElem = document.getElementById("leaderboard");
  const inputElement = document.createElement("input");
  inputElement.type = "button";
  inputElement.value = "Show Leaderboard";
  inputElement.style.borderRadius = "10px";
  inputElement.style.backgroundColor = "whitesmoke";
  inputElement.style.padding = "2px 5px";

  // Add an event listener to the inputElement
  inputElement.onclick = async () => {
    try {
      const userLeaderBoardArray = await axios.get(
        `${API_BASE_URL}/premium/showLeaderBoard`,
        {
          headers: { Authorization: token },
        }
      );

      LeaderboardElem.innerHTML = "";
      LeaderboardElem.innerHTML = "<h1> Leader Board</h1>";
      userLeaderBoardArray.data.forEach((userDetails) => {
        LeaderboardElem.innerHTML += `<li>Name: ${userDetails.name} Total Expenses: ${userDetails.totalExpenses}</li>`;
      });
    } catch (err) {
      console.error(err);
      alert("Failed to fetch leaderboard. Please try again.");
    }
  };

  if (ispremium) {
    // Create and append the download button
    const downloadButton = document.createElement("button");
    downloadButton.textContent = "Download File";
    downloadButton.onclick = download;
    downloadButton.style.borderRadius = "10px";
    downloadButton.style.backgroundColor = "whitesmoke";
    downloadButton.style.padding = "2px 5px";
    downloadButtonContainer.innerHTML = ""; // Clear previous content
    downloadButtonContainer.appendChild(downloadButton);

    // Create and append the download history button
    const downloadHistoryButton = document.createElement("button");
    downloadHistoryButton.textContent = "Download History";
    downloadHistoryButton.onclick = fetchDownloadHistory;
    downloadHistoryButton.style.borderRadius = "10px";
    downloadHistoryButton.style.backgroundColor = "whitesmoke";
    downloadHistoryButton.style.padding = "2px 5px";
    downloadButtonContainer.appendChild(downloadHistoryButton);
  } else {
    // If the user is not a premium user, hide the download buttons
    downloadButtonContainer.innerHTML = "";
  }

  // Append the inputElement to the message container
  const messageContainer = document.getElementById("message");
  messageContainer.innerHTML = "";
  messageContainer.appendChild(inputElement);
}

// Add event listener for "Download History" button
document.addEventListener("DOMContentLoaded", function () {
  const downloadHistoryButton = document.getElementById(
    "download-history-button"
  );
  if (downloadHistoryButton) {
    downloadHistoryButton.addEventListener("click", function () {
      fetchDownloadHistory();
    });
  }
});

// Function to fetch and display download history
async function fetchDownloadHistory() {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${API_BASE_URL}/user/download-history`, {
      headers: { Authorization: token },
    });
    if (response.status === 200) {
      const downloadHistory = response.data.downloadHistory;
      const downloadHistoryList = document.getElementById(
        "download-history-list"
      );
      downloadHistoryList.innerHTML = "";

      if (downloadHistory.length === 0) {
        downloadHistoryList.textContent = "No download history available.";
      } else {
        // Display each download history record
        downloadHistory.forEach((record) => {
          const listItem = document.createElement("div");

          if (record && record.id) {
            const downloadDate = new Date(record.downloadDate);
            const formattedDate = downloadDate.toISOString().split("T")[0];

            const formattedTime = `${downloadDate.getHours()}:${downloadDate.getMinutes()}`;

            listItem.innerHTML = `File: <a href="${record.fileUrl}">download file</a> Download Date: ${formattedDate}, ${formattedTime}`;

            downloadHistoryList.appendChild(listItem);
          }
        });
      }
    } else {
      alert(`Error: ${response.data.message}`);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to fetch download history. Please try again.");
  }
}

async function download() {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/user/download`, {
      headers: { Authorization: token },
    });

    if (response.status === 200) {
      var a = document.createElement("a");
      a.href = response.data.fileURL;
      a.download = "myexpense.csv";
      a.click();

      await saveDownloadHistory(response.data.fileURL);
    } else {
      alert(`Error: ${response.data.message}`);
    }
  } catch (err) {
    console.error(err);
    alert("An error occurred during the file download.");
  }
}

async function saveDownloadHistory(fileURL) {
  try {
    const token = localStorage.getItem("token");
    const userId = decodeToken.userId;
    console.log(decodeToken);

    const response = await axios.post(
      `${API_BASE_URL}/user/saveDownloadHistory`,
      {
        fileURL,
        userId,
      },
      {
        headers: { Authorization: token },
      }
    );

    if (response.status === 200) {
      console.log("Download history saved successfully.");
    } else {
      alert(`Error saving download history: ${response.data.message}`);
    }
  } catch (err) {
    console.error("Error saving download history:", err);
  }
}
