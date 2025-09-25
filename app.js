const todoInput = document.getElementById("todo-input");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");
const filter = document.getElementById("filter");
const search = document.getElementById("search");

let todos = JSON.parse(localStorage.getItem("todos")) || [];

// Simpan ke localStorage
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Render daftar todo
function renderTodos() {
  todoList.innerHTML = "";
  let filtered = todos;

  // Filter
  if (filter.value === "completed") {
    filtered = filtered.filter(t => t.completed);
  } else if (filter.value === "uncompleted") {
    filtered = filtered.filter(t => !t.completed);
  }

  // Search
  if (search.value.trim() !== "") {
    filtered = filtered.filter(t => t.text.toLowerCase().includes(search.value.toLowerCase()));
  }

  filtered.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;
    li.setAttribute("draggable", "true");
    li.dataset.index = index;

    const span = document.createElement("span");
    span.className = "text";
    span.textContent = todo.text;

    const actions = document.createElement("div");
    actions.className = "actions";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "toggle";
    toggleBtn.textContent = todo.completed ? "Belum" : "Selesai";
    toggleBtn.onclick = () => {
      todo.completed = !todo.completed;
      saveTodos();
      renderTodos();
    };

    const editBtn = document.createElement("button");
    editBtn.className = "edit";
    editBtn.textContent = "Edit";
    editBtn.onclick = () => {
      const newText = prompt("Edit todo:", todo.text);
      if (newText && !todos.some(t => t.text === newText && t !== todo)) {
        todo.text = newText;
        saveTodos();
        renderTodos();
      } else if (newText) {
        alert("Judul todo sudah ada!");
      }
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete";
    deleteBtn.textContent = "Hapus";
    deleteBtn.onclick = () => {
      todos.splice(index, 1);
      saveTodos();
      renderTodos();
    };

    actions.append(toggleBtn, editBtn, deleteBtn);
    li.append(span, actions);
    todoList.appendChild(li);
  });

  enableDragDrop();
}

// Tambah todo
function addTodo() {
  const text = todoInput.value.trim();
  if (text === "") return;
  if (todos.some(t => t.text === text)) {
    alert("Judul todo sudah ada!");
    return;
  }
  todos.push({ text, completed: false });
  saveTodos();
  renderTodos();
  todoInput.value = "";
}

// Event: tombol Tambah
addBtn.addEventListener("click", addTodo);

// Event: tekan Enter di input
todoInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addTodo();
  }
});

// Event filter dan search
filter.addEventListener("change", renderTodos);
search.addEventListener("input", renderTodos);

// Drag & Drop
function enableDragDrop() {
  const items = document.querySelectorAll(".todo-item");
  let dragged;

  items.forEach(item => {
    item.addEventListener("dragstart", () => {
      dragged = item;
      item.style.opacity = "0.5";
    });

    item.addEventListener("dragend", () => {
      dragged.style.opacity = "1";
      saveTodos();
      renderTodos();
    });

    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      const bounding = item.getBoundingClientRect();
      const offset = bounding.y + bounding.height / 2;
      if (e.clientY - offset > 0) {
        item.style["border-bottom"] = "3px solid #4CAF50";
        item.style["border-top"] = "";
      } else {
        item.style["border-top"] = "3px solid #4CAF50";
        item.style["border-bottom"] = "";
      }
    });

    item.addEventListener("dragleave", () => {
      item.style["border-bottom"] = "";
      item.style["border-top"] = "";
    });

    item.addEventListener("drop", (e) => {
      e.preventDefault();
      item.style["border-bottom"] = "";
      item.style["border-top"] = "";

      const draggedIndex = +dragged.dataset.index;
      const targetIndex = +item.dataset.index;

      const draggedItem = todos[draggedIndex];
      todos.splice(draggedIndex, 1);
      todos.splice(targetIndex, 0, draggedItem);

      saveTodos();
      renderTodos();
    });
  });
}

// Load awal
renderTodos();
