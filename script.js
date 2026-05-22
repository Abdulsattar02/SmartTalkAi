/* ================================================
   SmartTalk AI - Enhanced JavaScript
   Production-Ready Chatbot with Chat History
   ================================================ */

// ================================================
// DOM ELEMENTS
// ================================================

const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");
const messagesContainer = document.getElementById("messagesContainer");
const charCount = document.getElementById("charCount");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebar = document.getElementById("sidebar");
const newChatBtn = document.getElementById("newChatBtn");
const themeToggle = document.getElementById("themeToggle");
const toastContainer = document.getElementById("toastContainer");
const chatHistory = document.getElementById("chatHistory");

// ================================================
// STATE MANAGEMENT
// ================================================

let isLoading = false;
let isFirstMessage = true;
let currentChatId = null;
let allChats = [];
const maxChars = 4000;
const STORAGE_KEY = "smarttalk_chats";

// ================================================
// INITIALIZATION
// ================================================

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

function initializeApp() {
  loadChatsFromStorage();
  handleThemeInit();
  updateSendButtonState();
  attachEventListeners();
  createNewChat();
  focusInput();
}

function handleThemeInit() {
  const savedTheme = localStorage.getItem("smarttalk_theme");
  if (savedTheme === "dark" || (!savedTheme && prefersDarkMode())) {
    document.body.classList.add("dark-mode");
  }
}

function prefersDarkMode() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// ================================================
// CHAT HISTORY MANAGEMENT
// ================================================

function loadChatsFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    allChats = stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading chats:", error);
    allChats = [];
  }
}

function saveChatsToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allChats));
  } catch (error) {
    console.error("Error saving chats:", error);
  }
}

function createNewChat() {
  const chatId = "chat_" + Date.now();
  const newChat = {
    id: chatId,
    title: "New Chat",
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  allChats.unshift(newChat);
  currentChatId = chatId;
  saveChatsToStorage();
  renderChatHistory();
  clearChatView();
  updateSendButtonState();
}

function clearChatView() {
  messagesContainer.innerHTML = `
    <div class="welcome-section">
      <div class="welcome-brand-row">
        <img class="welcome-logo" src="logo_new.svg" alt="SmartTalk AI" width="34" height="34" />
        <div class="welcome-brand">SmartTalk AI</div>
      </div>
      <p class="welcome-subtitle">Premium AI conversations, simplified.</p>
    </div>
  `;
  isFirstMessage = true;
  userInput.value = "";
  userInput.style.height = "auto";
  updateCharCounter();
}



function getCurrentChat() {
  return allChats.find(chat => chat.id === currentChatId);
}

function updateCurrentChat() {
  const chat = getCurrentChat();
  if (chat) {
    chat.updatedAt = new Date().toISOString();
    saveChatsToStorage();
  }
}

function deleteChat(chatId) {
  allChats = allChats.filter(chat => chat.id !== chatId);
  saveChatsToStorage();
  
  if (currentChatId === chatId) {
    if (allChats.length > 0) {
      switchChat(allChats[0].id);
    } else {
      createNewChat();
    }
  }
  
  renderChatHistory();
}

function switchChat(chatId) {
  const chat = allChats.find(c => c.id === chatId);
  if (!chat) return;
  
  currentChatId = chatId;
  renderChatMessages();
  renderChatHistory();
  closeSidebar();
}

function renderChatHistory() {
  chatHistory.innerHTML = "";
  
  allChats.forEach((chat) => {
    const item = document.createElement("button");
    item.className = `chat-history-item ${chat.id === currentChatId ? "active" : ""}`;
    item.setAttribute("data-chat-id", chat.id);
    
    const label = document.createElement("span");
    label.className = "chat-label";
    label.title = chat.title;
    label.textContent = chat.title;
    
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "chat-delete";
    deleteBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    `;
    deleteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      deleteChat(chat.id);
    });
    
    item.appendChild(label);
    item.appendChild(deleteBtn);
    item.addEventListener("click", () => switchChat(chat.id));
    
    chatHistory.appendChild(item);
  });
}

function renderChatMessages() {
  const chat = getCurrentChat();
  if (!chat) return;
  
  if (chat.messages.length === 0) {
    clearChatView();
  } else {
    messagesContainer.innerHTML = "";
    chat.messages.forEach((msg) => {
      renderMessageFromData(msg);
    });
    scrollToBottom();
  }
}

function renderMessageFromData(msgData) {
  const wrapper = document.createElement("div");
  wrapper.className = `message-wrapper ${msgData.sender}`;

  const bubble = document.createElement("div");
  bubble.className = `message-bubble ${msgData.sender}`;
  bubble.textContent = msgData.text;

  wrapper.appendChild(bubble);

  if (msgData.sender === "bot") {
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "message-actions";

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.title = "Copy message";
    copyBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
      </svg>
    `;

    copyBtn.addEventListener("click", () => copyToClipboard(msgData.text));
    actionsDiv.appendChild(copyBtn);
    wrapper.appendChild(actionsDiv);
  }

  messagesContainer.appendChild(wrapper);
}

// ================================================
// EVENT LISTENERS
// ================================================

function attachEventListeners() {
  // Input events
  userInput.addEventListener("input", handleInputChange);
  userInput.addEventListener("keydown", handleKeyDown);
  userInput.addEventListener("focus", handleInputFocus);

  // Button events
  sendButton.addEventListener("click", handleSendMessage);
  newChatBtn.addEventListener("click", handleNewChat);
  sidebarToggle.addEventListener("click", toggleSidebar);
  themeToggle.addEventListener("click", toggleTheme);

  // Suggested prompt chips (event delegation)
  messagesContainer.addEventListener("click", (e) => {
    const chip = e.target.closest && e.target.closest(".prompt-chip");
    if (!chip) return;
    const prompt = chip.getAttribute("data-prompt") || chip.textContent;
    if (!prompt) return;
    userInput.value = prompt;
    userInput.style.height = "auto";
    autoResizeTextarea();
    updateCharCounter();
    updateSendButtonState();
    focusInput();
  });

  // Mobile viewport resize
  window.addEventListener("resize", handleWindowResize);
}


// ================================================
// INPUT MANAGEMENT
// ================================================

function handleInputChange() {
  autoResizeTextarea();
  updateCharCounter();
  updateSendButtonState();
}

function autoResizeTextarea() {
  userInput.style.height = "auto";
  const scrollHeight = userInput.scrollHeight;
  const newHeight = Math.max(44, Math.min(scrollHeight, 120));
  userInput.style.height = newHeight + "px";
}

function updateCharCounter() {
  const length = userInput.value.length;
  if (length > maxChars * 0.8) {
    charCount.textContent = `${length}/${maxChars}`;
    charCount.classList.add("show");
  } else {
    charCount.classList.remove("show");
  }
}

function updateSendButtonState() {
  const hasText = userInput.value.trim().length > 0;
  sendButton.disabled = !hasText || isLoading;
}

function handleKeyDown(e) {
  // Ctrl/Cmd + Enter => send (keep existing shortcut behavior)
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    handleSendMessage();
    return;
  }

  // Shift + Enter => new line (ChatGPT behavior)
  if (e.shiftKey && e.key === "Enter") {
    return; // allow textarea default newline
  }

  // Enter => send (desktop + mobile)
  if (e.key === "Enter") {
    // Avoid accidental double-sends while loading
    if (isLoading) return;
    e.preventDefault();
    handleSendMessage();
  }
}


function handleInputFocus() {
  userInput.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function focusInput() {
  // Smooth + mobile-safe autofocus
  setTimeout(() => {
    try {
      userInput.focus({ preventScroll: true });
    } catch {
      userInput.focus();
    }
  }, 50);
}


// ================================================
// MESSAGE SENDING
// ================================================

async function handleSendMessage() {
  const message = userInput.value.trim();
  if (!message || isLoading) return;

  try {
    isLoading = true;
    updateSendButtonState();

    // Remove welcome section on first message
    if (isFirstMessage) {
      const welcomeSection = document.querySelector(".welcome-section");
      if (welcomeSection) {
        welcomeSection.remove();
      }
      isFirstMessage = false;
      
      // Update chat title from first message
      const chat = getCurrentChat();
      if (chat) {
        chat.title = message.substring(0, 50) + (message.length > 50 ? "..." : "");
        updateCurrentChat();
        renderChatHistory();
      }
    }

    // Add user message
    addMessage(message, "user");
    userInput.value = "";
    userInput.style.height = "auto";
    updateCharCounter();

    // Add typing indicator
    const typingDiv = addTypingIndicator();

    // Fetch AI response
    const response = await fetch("/api/server", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    // Remove typing indicator
    typingDiv.remove();

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    if (data.reply) {
      addMessage(data.reply, "bot");
    } else {
      addMessage(
        "⚠️ No response received. Please try again.",
        "bot"
      );
    }
  } catch (error) {
    console.error("Error:", error);
    const typingDiv = document.querySelector(".message-wrapper .typing-indicator");
    if (typingDiv) typingDiv.parentElement.remove();

    addMessage(
      `⚠️ Connection error: ${error.message || "Server not responding"}`,
      "bot"
    );
    showToast("Error sending message", "error");
  } finally {
    isLoading = false;
    updateSendButtonState();
    focusInput();
  }
}

// ================================================
// MESSAGE RENDERING
// ================================================

function addMessage(text, sender) {
  // Add to current chat
  const chat = getCurrentChat();
  if (chat) {
    chat.messages.push({ text, sender });
    updateCurrentChat();
  }

  // Render message
  const wrapper = document.createElement("div");
  wrapper.className = `message-wrapper ${sender}`;

  const bubble = document.createElement("div");
  bubble.className = `message-bubble ${sender}`;
  bubble.textContent = text;

  wrapper.appendChild(bubble);

  // Add copy button for bot messages
  if (sender === "bot") {
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "message-actions";

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.title = "Copy message";
    copyBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
      </svg>
    `;

    copyBtn.addEventListener("click", () => copyToClipboard(text));
    actionsDiv.appendChild(copyBtn);
    wrapper.appendChild(actionsDiv);
  }

  messagesContainer.appendChild(wrapper);
  scrollToBottom();

  return wrapper;
}

function addTypingIndicator() {
  const wrapper = document.createElement("div");
  wrapper.className = "message-wrapper bot";

  const indicator = document.createElement("div");
  indicator.className = "typing-indicator";
  indicator.innerHTML = `
    <span>AI is thinking</span>
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  `;

  wrapper.appendChild(indicator);
  messagesContainer.appendChild(wrapper);
  scrollToBottom();

  return wrapper;
}

function scrollToBottom() {
  setTimeout(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 0);
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      showToast("Copied to clipboard!", "success");
    })
    .catch(() => {
      showToast("Failed to copy", "error");
    });
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideInUp 300ms ease-out forwards";
  }, 0);

  setTimeout(() => {
    toast.style.animation = "slideInUp 300ms ease-out reverse forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ================================================
// SIDEBAR & NAVIGATION
// ================================================

function toggleSidebar() {
  sidebar.classList.toggle("open");
}

function closeSidebar() {
  sidebar.classList.remove("open");
}

function handleNewChat() {
  createNewChat();
  focusInput();
  closeSidebar();
}

// ================================================
// THEME TOGGLE
// ================================================

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("smarttalk_theme", isDark ? "dark" : "light");
}

// ================================================
// RESPONSIVE HANDLING
// ================================================

function handleWindowResize() {
  if (window.innerWidth >= 768) {
    closeSidebar();
  }
}

// Close sidebar when clicking on a message (on mobile)
messagesContainer.addEventListener("click", () => {
  if (window.innerWidth < 768) {
    closeSidebar();
  }
});