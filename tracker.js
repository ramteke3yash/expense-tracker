const API_BASE_URL = "http://localhost:4000";

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
      const response = await axios.put(
        `${API_BASE_URL}/expense/edit-expense/${editId}`,
        expense
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
      await axios.post(`${API_BASE_URL}/expense/add-expense`, expense);
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
    await axios.delete(`${API_BASE_URL}/expense/delete-expense/${id}`);
  } catch (err) {
    console.log(err);
  }

  // Reload and display the expenses
  loadExpenseList();
}

// Function to load existing expenses from the API and display them
async function loadExpenseList() {
  try {
    const response = await axios.get(`${API_BASE_URL}/expense/get-expenses`);
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
  e.preventDefault(); // Prevent form submission
  addOrUpdateExpense();
});

// Load existing expenses from the API and display them
document.addEventListener("DOMContentLoaded", loadExpenseList);
