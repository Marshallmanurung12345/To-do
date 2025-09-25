const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const filter = document.getElementById("filter");
const search = document.getElementById("search");

let todos = JSON.parse(localStorage.getItem("todos")) || [];

// Migrasi: Tambahkan ID unik ke todo lama yang belum memilikinya
todos.forEach((todo) => {
  if (!todo.id) {
    todo.id = Date.now() + Math.random();
  }
});

// Fungsi untuk menampilkan notifikasi toast
function showToast(message, type = "success") {
  const toastContainer = document.querySelector(".toast-container");
  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center text-bg-${type} border-0`;
  toastEl.setAttribute("role", "alert");
  toastEl.setAttribute("aria-live", "assertive");
  toastEl.setAttribute("aria-atomic", "true");

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  toastContainer.appendChild(toastEl);

  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

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
  filtered.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;
    li.draggable = true;
    li.dataset.id = todo.id; // Tambahkan data-id untuk identifikasi

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
      const todoToToggle = todos.find((t) => t.id === todo.id);
      todoToToggle.completed = !todoToToggle.completed;
      saveTodos();
      if (todoToToggle.completed) {
        showToast("Tugas ditandai selesai!");
      } else {
        showToast("Tugas ditandai belum selesai.", "warning");
      }
    });

    // Edit todo
    li.querySelector(".edit").addEventListener("click", () => {
      const newText = prompt("Ubah todo:", todo.text);
      if (
        newText &&
        newText.trim() !== "" &&
        !todos.find((t) => t.text === newText)
      ) {
        const todoToEdit = todos.find((t) => t.id === todo.id);
        todoToEdit.text = newText;
        saveTodos();
        showToast("Tugas berhasil diubah.", "info");
      } else {
        alert("Judul sudah ada atau kosong!");
      }
    });

    // Hapus todo
    li.querySelector(".delete").addEventListener("click", () => {
      const confirmation = confirm(
        `Apakah Anda yakin ingin menghapus tugas "${todo.text}"?`
      );
      if (confirmation) {
        const todoIndex = todos.findIndex((t) => t.id === todo.id);
        todos.splice(todoIndex, 1);
        saveTodos();
        showToast("Tugas berhasil dihapus.", "danger");
      }
    });

    // Drag & Drop
    li.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", todo.id);
      e.dataTransfer.effectAllowed = "move";
    });
    li.addEventListener("dragover", (e) => e.preventDefault());
    li.addEventListener("drop", (e) => {
      const fromId = e.dataTransfer.getData("text/plain");
      const fromIndex = todos.findIndex((t) => t.id == fromId);
      const toIndex = todos.findIndex((t) => t.id === todo.id);
      const [moved] = todos.splice(fromIndex, 1); // Ambil item yang dipindah
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

  todos.push({ id: Date.now(), text, completed: false });
  input.value = ""; // Kosongkan input setelah tambah
  showToast("Tugas baru berhasil ditambahkan!");
  saveTodos(); // langsung render + simpan
});

// Event filter & search
filter.addEventListener("change", renderTodos);
search.addEventListener("input", renderTodos);

// Pertama kali load
renderTodos();
