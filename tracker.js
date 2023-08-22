const API_BASE_URL =
  "https://crudcrud.com/api/9dcc37cca59546d2a93f0e4aa730649e/tracker";

// Cache frequently used elements
const form = document.getElementById("my-form");
const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("Description");
const categoryInput = document.getElementById("Category");
const expenseList = document.getElementById("expenses");
let editId = null;

// Function to edit an expense
function editExpense(expense) {
  // Populate form fields with expense data
  nameInput.value = expense.name;
  descriptionInput.value = expense.description;
  categoryInput.value = expense.category;
  editId = expense._id;
}

// Function to add or update an expense
async function addOrUpdateExpense() {
  const name = nameInput.value;
  const description = descriptionInput.value;
  const category = categoryInput.value;

  const editIndex = form.getAttribute("data-edit-index");

  if (editId) {
    // Editing an existing expense
    const expense = { name, description, category };
    try {
      const response = await axios.put(`${API_BASE_URL}/${editId}`, expense);
    } catch (err) {
      console.log(err);
    }
  } else {
    //Creating a new expense
    const expense = { name, description, category };
    try {
      await axios.post(API_BASE_URL, expense);
    } catch (err) {
      console.log(err);
    }
  }

  // Clear the form
  form.removeAttribute("data-edit-index");
  nameInput.value = "";
  descriptionInput.value = "";
  categoryInput.value = "";

  // Reload and display the expenses
  loadExpenseList();
}

// Function to delete an expense
async function deleteExpense(id) {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
  } catch (err) {
    console.log(err);
  }

  // Reload and display the expenses
  loadExpenseList();
}

// Function to load existing expenses from the API and display them
async function loadExpenseList() {
  try {
    const response = await axios.get(API_BASE_URL);
    const expenses = response.data;

    // Clear the expense list
    expenseList.innerHTML = "";

    // Display each expense in the expense list
    expenses.forEach(function (expense, index) {
      const li = document.createElement("li");
      li.textContent = `Expense Amount: ${expense.name}, Description: ${expense.description}, Category: ${expense.category}`;

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
        deleteExpense(expense._id);
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
