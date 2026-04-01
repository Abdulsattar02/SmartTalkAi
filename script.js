const input = document.getElementById("userInput");
const button = document.getElementById("sendButton");
const chatBox = document.getElementById("messagesContainer");

// ------------------------
// ✅ SHOW / HIDE BUTTON
// ------------------------
input.addEventListener("input", () => {
  if (input.value.trim() !== "") {
    button.classList.remove("opacity-0", "scale-90");
    button.classList.add("opacity-100", "scale-100");
  } else {
    button.classList.add("opacity-0", "scale-90");
    button.classList.remove("opacity-100", "scale-100");
  }
});

// ------------------------
// ✅ EVENT LISTENERS
// ------------------------
button.addEventListener("click", sendMessage);

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

// ------------------------
// ✅ SEND MESSAGE
// ------------------------
async function sendMessage() {
  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  input.value = "";

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

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

// ------------------------
// ✅ ADD MESSAGE UI
// ------------------------
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

  // auto scroll
  chatBox.scrollTop = chatBox.scrollHeight;
}