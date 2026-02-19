const store = {
  read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },
  write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

const eventForm = document.getElementById("eventForm");
const eventList = document.getElementById("eventList");
const ideaForm = document.getElementById("ideaForm");
const ideaList = document.getElementById("ideaList");
const mediaInput = document.getElementById("mediaInput");
const mediaGrid = document.getElementById("mediaGrid");
const mediaDropZone = document.getElementById("mediaDropZone");

let events = store.read("theo_events", []);
let ideas = store.read("theo_ideas", []);
let media = store.read("theo_media", []);

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

function renderEvents() {
  if (!events.length) {
    eventList.innerHTML = '<li class="item"><p>No events added yet.</p></li>';
    return;
  }

  eventList.innerHTML = events
    .slice()
    .reverse()
    .map(
      (event) => `
      <li class="item">
        <div class="item-head">
          <h3>${escapeHtml(event.title)}</h3>
          <span class="meta">${formatDate(event.date)}</span>
        </div>
        <p><strong>Time:</strong> ${escapeHtml(event.time)}</p>
        <p><strong>Theme:</strong> ${escapeHtml(event.theme || "-")}</p>
        <p>${escapeHtml(event.notes || "No notes yet.")}</p>
        <button class="ghost-btn" data-remove-event="${event.id}" type="button">Remove</button>
      </li>
    `
    )
    .join("");
}

function renderIdeas() {
  if (!ideas.length) {
    ideaList.innerHTML = '<li class="item"><p>No ideas saved yet.</p></li>';
    return;
  }

  ideaList.innerHTML = ideas
    .slice()
    .reverse()
    .map(
      (idea) => `
      <li class="item">
        <div class="item-head">
          <h3>${escapeHtml(idea.title)}</h3>
          <span class="tag">${escapeHtml(idea.priority)}</span>
        </div>
        <p>${escapeHtml(idea.description || "No description provided.")}</p>
        <button class="ghost-btn" data-remove-idea="${idea.id}" type="button">Remove</button>
      </li>
    `
    )
    .join("");
}

function renderMedia() {
  if (!media.length) {
    mediaGrid.innerHTML = '<div class="item"><p>No files uploaded yet.</p></div>';
    return;
  }

  mediaGrid.innerHTML = media
    .slice()
    .reverse()
    .map(
      (item) => `
      <figure class="media-thumb">
        <img src="${item.dataUrl}" alt="${escapeHtml(item.name)}" />
        <p title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</p>
        <button class="ghost-btn media-remove" data-remove-media="${item.id}" type="button">Remove</button>
      </figure>
    `
    )
    .join("");
}

eventForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(eventForm);
  events.push({
    id: uid(),
    title: formData.get("title")?.toString().trim(),
    date: formData.get("date"),
    time: formData.get("time")?.toString().trim(),
    theme: formData.get("theme")?.toString().trim(),
    notes: formData.get("notes")?.toString().trim()
  });
  store.write("theo_events", events);
  eventForm.reset();
  renderEvents();
});

ideaForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(ideaForm);
  ideas.push({
    id: uid(),
    title: formData.get("title")?.toString().trim(),
    priority: formData.get("priority"),
    description: formData.get("description")?.toString().trim()
  });
  store.write("theo_ideas", ideas);
  ideaForm.reset();
  renderIdeas();
});

async function handleMediaFiles(selectedFiles) {
  const files = Array.from(selectedFiles || []).filter((file) => file.type.startsWith("image/"));

  for (const file of files) {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    media.push({
      id: uid(),
      name: file.name,
      dataUrl
    });
  }

  store.write("theo_media", media);
  mediaInput.value = "";
  renderMedia();
}

mediaInput.addEventListener("change", async (e) => {
  await handleMediaFiles(e.target.files);
});

mediaDropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  mediaDropZone.classList.add("dragging");
});

mediaDropZone.addEventListener("dragleave", () => {
  mediaDropZone.classList.remove("dragging");
});

mediaDropZone.addEventListener("drop", async (e) => {
  e.preventDefault();
  mediaDropZone.classList.remove("dragging");
  await handleMediaFiles(e.dataTransfer?.files || []);
});

eventList.addEventListener("click", (e) => {
  const target = e.target.closest("[data-remove-event]");
  if (!target) {
    return;
  }
  const id = target.getAttribute("data-remove-event");
  events = events.filter((event) => event.id !== id);
  store.write("theo_events", events);
  renderEvents();
});

ideaList.addEventListener("click", (e) => {
  const target = e.target.closest("[data-remove-idea]");
  if (!target) {
    return;
  }
  const id = target.getAttribute("data-remove-idea");
  ideas = ideas.filter((idea) => idea.id !== id);
  store.write("theo_ideas", ideas);
  renderIdeas();
});

mediaGrid.addEventListener("click", (e) => {
  const target = e.target.closest("[data-remove-media]");
  if (!target) {
    return;
  }
  const id = target.getAttribute("data-remove-media");
  media = media.filter((item) => item.id !== id);
  store.write("theo_media", media);
  renderMedia();
});

renderEvents();
renderIdeas();
renderMedia();
