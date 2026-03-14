// === CONFIG ===
const GROQ_API_KEY = "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"; // Replace with your actual key if needed
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

// === ELEMENTS ===
const chatArea = document.getElementById("chatArea");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const typingIndicator = document.getElementById("typingIndicator");
const clearChatBtn = document.getElementById("clearChat");

// === INITIALIZATION ===
loadChatHistory();

// === EVENT LISTENERS ===
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
clearChatBtn.addEventListener("click", clearChat);

// === FUNCTIONS ===

function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage("user", message);
  userInput.value = "";
  saveChatHistory();

  showTyping(true);

  fetchBotResponse(message);
}

function addMessage(role, text) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", role);

  const timeString = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  msgDiv.innerHTML = `
    <span class="text">${text}</span>
    <span class="timestamp">${timeString}</span>
  `;

  chatArea.appendChild(msgDiv);
  scrollChatToBottom();
  saveChatHistory();
}

function scrollChatToBottom() {
  // Ensure the latest message is visible
  chatArea.scrollTop = chatArea.scrollHeight;
}

async function fetchBotResponse(userMsg) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          { role: "user", content: userMsg },
        ],
      }),
    });

    const data = await response.json();
    showTyping(false);

    if (!response.ok) {
      const errMsg = data?.error?.message || data?.message || "Unknown error";
      addMessage(
        "bot",
        `⚠️ Request failed (${response.status}): ${errMsg}`
      );
      console.error("API error:", response.status, data);
      return;
    }

    if (!data.choices || !data.choices[0]?.message?.content) {
      addMessage("bot", "⚠️ Unexpected response format from API.");
      console.error("Unexpected API response:", data);
      return;
    }

    const botReply = data.choices[0].message.content.trim();
    addMessage("bot", botReply);
  } catch (error) {
    showTyping(false);
    addMessage("bot", "⚠️ Error fetching response. Check your connection.");
    console.error("Fetch error:", error);
  }
}

function showTyping(show) {
  typingIndicator.classList.toggle("hidden", !show);
}

function saveChatHistory() {
  localStorage.setItem("chatHistory", chatArea.innerHTML);
}

function loadChatHistory() {
  const history = localStorage.getItem("chatHistory");
  if (history) {
    chatArea.innerHTML = history;
    scrollChatToBottom();
  }
}

function clearChat() {
  if (confirm("Clear chat history?")) {
    localStorage.removeItem("chatHistory");
    chatArea.innerHTML = "";
  }
}
