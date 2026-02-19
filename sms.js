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

const totalMessages = document.getElementById("totalMessages");
const messageBars = document.getElementById("messageBars");
const themeCloud = document.getElementById("themeCloud");
const messageList = document.getElementById("messageList");
const messageForm = document.getElementById("messageForm");
const profileForm = document.getElementById("profileForm");
const profileList = document.getElementById("profileList");

let messages = store.read("theo_sms_messages", []);
let profiles = store.read("theo_sms_profiles", []);

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const themeRules = [
  { name: "Free Cover", words: ["free", "cover"] },
  { name: "VIP Tables", words: ["vip", "table", "bottle"] },
  { name: "Event Promo", words: ["friday", "saturday", "tonight", "party", "dj"] },
  { name: "Student Offer", words: ["student", "college", "campus"] },
  { name: "Birthday Offer", words: ["birthday", "celebrate"] }
];

function getThemeCounts() {
  const counts = {};
  for (const message of messages) {
    const lower = message.text.toLowerCase();
    for (const rule of themeRules) {
      if (rule.words.some((word) => lower.includes(word))) {
        counts[rule.name] = (counts[rule.name] || 0) + 1;
      }
    }
  }
  return counts;
}

function getRecentBarSeries() {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const counts = Object.fromEntries(labels.map((day) => [day, 0]));

  for (const message of messages) {
    const dayLabel = labels[new Date(message.createdAt).getDay() === 0 ? 6 : new Date(message.createdAt).getDay() - 1];
    counts[dayLabel] += 1;
  }

  return labels.map((label) => ({ label, count: counts[label] }));
}

function renderBars() {
  const series = getRecentBarSeries();
  const peak = Math.max(...series.map((item) => item.count), 1);

  messageBars.innerHTML = series
    .map((item) => {
      const height = Math.max(10, (item.count / peak) * 120);
      return `<div class="bar" style="height:${height}px" data-label="${item.label}" title="${item.count} messages"></div>`;
    })
    .join("");
}

function renderThemes() {
  const counts = getThemeCounts();
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  if (!entries.length) {
    themeCloud.innerHTML = '<span class="chip">No theme data yet</span>';
    return;
  }

  themeCloud.innerHTML = entries
    .map(([name, count]) => `<span class="chip">${name}: ${count}</span>`)
    .join("");
}

function renderProfiles() {
  if (!profiles.length) {
    profileList.innerHTML = '<li class="item"><p>No tagged contacts yet.</p></li>';
    return;
  }

  profileList.innerHTML = profiles
    .slice()
    .reverse()
    .map(
      (profile) => `
      <li class="item">
        <div class="item-head">
          <h3>${escapeHtml(profile.phone)}</h3>
          <span class="tag">${escapeHtml(profile.profile)}</span>
        </div>
        <p>${escapeHtml(profile.notes || "No notes")}</p>
        <button class="ghost-btn" data-remove-profile="${profile.id}" type="button">Remove</button>
      </li>
    `
    )
    .join("");
}

function renderMessages() {
  if (!messages.length) {
    messageList.innerHTML = '<li class="item"><p>No sample messages logged yet.</p></li>';
    return;
  }

  messageList.innerHTML = messages
    .slice()
    .reverse()
    .slice(0, 5)
    .map(
      (message) => `
      <li class="item">
        <p>${escapeHtml(message.text)}</p>
      </li>
    `
    )
    .join("");
}

function renderTotals() {
  totalMessages.textContent = String(messages.length);
}

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(messageForm);
  const text = data.get("message")?.toString().trim();
  if (!text) {
    return;
  }

  messages.push({
    id: uid(),
    text,
    createdAt: new Date().toISOString()
  });
  store.write("theo_sms_messages", messages);
  messageForm.reset();
  renderTotals();
  renderBars();
  renderThemes();
  renderMessages();
});

profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(profileForm);
  profiles.push({
    id: uid(),
    phone: data.get("phone")?.toString().trim(),
    profile: data.get("profile")?.toString().trim(),
    notes: data.get("notes")?.toString().trim()
  });
  store.write("theo_sms_profiles", profiles);
  profileForm.reset();
  renderProfiles();
});

profileList.addEventListener("click", (e) => {
  const target = e.target.closest("[data-remove-profile]");
  if (!target) {
    return;
  }
  const id = target.getAttribute("data-remove-profile");
  profiles = profiles.filter((item) => item.id !== id);
  store.write("theo_sms_profiles", profiles);
  renderProfiles();
});

renderTotals();
renderBars();
renderThemes();
renderProfiles();
renderMessages();
