const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const filter = document.getElementById("filter");
const search = document.getElementById("search");

let todos = JSON.parse(localStorage.getItem("todos")) || [];

// Render daftar todo
function renderTodos() {
  list.innerHTML = "";
  let filtered = todos;

  // Filter
  if (filter.value === "completed") {
    filtered = filtered.filter((t) => t.completed);
  } else if (filter.value === "pending") {
    filtered = filtered.filter((t) => !t.completed);
  }

  // Search
  if (search.value.trim() !== "") {
    filtered = filtered.filter((t) =>
      t.text.toLowerCase().includes(search.value.toLowerCase())
    );
  }

  // Buat elemen todo
  filtered.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;
    li.draggable = true;

    li.innerHTML = `
      <span class="text">${todo.text}</span>
      <div class="todo-actions">
        <button class="toggle">${todo.completed ? "Batal" : "Selesai"}</button>
        <button class="edit">Ubah</button>
        <button class="delete">Hapus</button>
      </div>
    `;

    // Toggle selesai/belum
    li.querySelector(".toggle").addEventListener("click", () => {
      todos[index].completed = !todos[index].completed;
      saveTodos();
    });

    // Edit todo
    li.querySelector(".edit").addEventListener("click", () => {
      const newText = prompt("Ubah todo:", todo.text);
      if (newText && !todos.find((t) => t.text === newText)) {
        todos[index].text = newText;
        saveTodos();
      } else {
        alert("Judul sudah ada atau kosong!");
      }
    });

    // Hapus todo
    li.querySelector(".delete").addEventListener("click", () => {
      todos.splice(index, 1);
      saveTodos();
    });

    // Drag & Drop
    li.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("index", index);
    });
    li.addEventListener("dragover", (e) => e.preventDefault());
    li.addEventListener("drop", (e) => {
      const fromIndex = e.dataTransfer.getData("index");
      const toIndex = index;
      const [moved] = todos.splice(fromIndex, 1);
      todos.splice(toIndex, 0, moved);
      saveTodos();
    });

    list.appendChild(li);
  });
}

// Simpan ke localStorage + render
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
  renderTodos();
}

// Tambah todo
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();

  if (!text) {
    alert("Isi dulu todo-nya!");
    return;
  }
  if (todos.find((t) => t.text === text)) {
    alert("Todo dengan judul ini sudah ada!");
    return;
  }

  todos.push({ text, completed: false });
  input.value = ""; // Kosongkan input setelah tambah
  saveTodos(); // langsung render + simpan
});

// Event filter & search
filter.addEventListener("change", renderTodos);
search.addEventListener("input", renderTodos);

// Pertama kali load
renderTodos();
