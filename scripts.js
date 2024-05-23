const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
    nav.classList.toggle('nav-active');
    burger.classList.toggle('toggle');
});

// Get the modal
const chatbotModal = document.getElementById('chatbotModal');

// Get the button that opens the modal
const chatbotButton = document.getElementById('chatbotButton');

// Get the <span> element that closes the modal
const closeChatbot = document.getElementById('closeChatbot');

// Get the send button and input field
const sendButton = document.getElementById('sendButton');
const clientMessage = document.getElementById('clientMessage');

// Get the chat body
const chatbotBody = document.getElementById('chatbotBody');

// When the user clicks on the button, open the modal
chatbotButton.onclick = function () {
    chatbotModal.style.display = 'block';
}

// When the user clicks on <span> (x), close the modal
closeChatbot.onclick = function () {
    chatbotModal.style.display = 'none';
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == chatbotModal) {
        chatbotModal.style.display = 'none';
    }
}

// Create loader element
function createLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    return loader;
}

// Handle sending messages
sendButton.onclick = async function () {
    const message = clientMessage.value;
    if (message.trim() !== "") {
        const clientMessageDiv = document.createElement('div');
        clientMessageDiv.className = 'client-message';
        clientMessageDiv.textContent = message;
        chatbotBody.appendChild(clientMessageDiv);

        // Scroll to the bottom
        chatbotBody.scrollTop = chatbotBody.scrollHeight;

        // Clear the input field
        clientMessage.value = "";

        // Create and append the loader
        const loader = createLoader();
        chatbotBody.appendChild(loader);
        chatbotBody.scrollTop = chatbotBody.scrollHeight;

        // Send the message to the server
        try {
            const response = await fetch('http://localhost:3001/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();
            const botMessage = data.message;

            // Remove the loader
            loader.remove();

            // Display the bot's response
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'bot-message';
            botMessageDiv.textContent = data.message;
            chatbotBody.appendChild(botMessageDiv);

            // Scroll to the bottom
            chatbotBody.scrollTop = chatbotBody.scrollHeight;
        } catch (error) {
            console.error('Error:', error);
            loader.remove();
        }
    }
}

// Allow pressing Enter to send a message
clientMessage.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        sendButton.click();
    }
});
