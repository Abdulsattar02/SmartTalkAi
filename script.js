const sendBtn = document.getElementById("sendButton");
const input = document.getElementById("userInput");
const chatBox = document.getElementById("messagesContainer");
const hero = document.getElementById("heroSection");

// CLICK EVENT
sendBtn.addEventListener("click", sendMessage);

// ENTER KEY
input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

// SHOW / HIDE BUTTON
input.addEventListener("input", () => {
  if (input.value.trim().length > 0) {
    sendBtn.style.opacity = "1";
    sendBtn.style.transform = "scale(1)";
  } else {
    sendBtn.style.opacity = "0";
    sendBtn.style.transform = "scale(0.8)";
  }
});

// SEND FUNCTION
async function sendMessage() {
  const message = input.value.trim();
  if (!message) return;

  // hide hero first time
  if (hero) hero.style.display = "none";

  addMessage(message, "user");
  input.value = "";

  // hide button again after send
  sendBtn.style.opacity = "0";

  try {
    const res = await fetch("http://127.0.0.1:3001/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    addMessage(data.reply || "No response", "bot");

  } catch (err) {
    console.error(err);
    addMessage("Server not responding ❌", "bot");
  }
}

// ADD MESSAGE UI
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = sender === "user" ? "text-right my-2" : "text-left my-2";

  const bubble = document.createElement("div");
  bubble.className =
    sender === "user"
      ? "inline-block bg-black text-white px-4 py-2 rounded-xl"
      : "inline-block bg-gray-300 text-black px-4 py-2 rounded-xl";

  bubble.innerText = text;

  div.appendChild(bubble);
  chatBox.appendChild(div);

  chatBox.scrollTop = chatBox.scrollHeight;
}
// ✅ Event Listeners
sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

// ✅ Main Function
async function sendMessage() {
  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  input.value = "";

  try {
    // 🔥 IMPORTANT FIX: SAME ORIGIN (NO CORS)
    const res = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    // ❌ agar server error ho
    if (!res.ok) {
      throw new Error("Server error");
    }

    const data = await res.json();

    if (data.reply) {
      addMessage(data.reply, "bot");
    } else {
      addMessage("⚠️ No response from server", "bot");
    }

  } catch (err) {
    console.error("ERROR:", err);
    addMessage("⚠️ Server not responding", "bot");
  }
}

// ✅ Add Message UI
function addMessage(text, sender) {
  const div = document.createElement("div");

  div.className =
    sender === "user"
      ? "flex justify-end my-2"
      : "flex justify-start my-2";

  const bubble = document.createElement("div");

  bubble.className =
    sender === "user"
      ? "bg-black text-white px-4 py-2 rounded-2xl max-w-xs"
      : "bg-gray-300 text-black px-4 py-2 rounded-2xl max-w-xs";

  bubble.innerText = text;

  div.appendChild(bubble);
  chatBox.appendChild(div);

  chatBox.scrollTop = chatBox.scrollHeight;
}