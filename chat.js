// chat.js
(function() {
    let currentChatItemTag = null;
    let chatEnded = true;
    let chatHistoryLoaded = false;
    let currentChatStep = 'start';  // Track the current chat step
    let selectedItem = null;

    // Start Chat
    function startChat(item = null) {
        const chatbotModal = document.getElementById('chatbotModal');
        chatbotModal.style.display = 'block';
        
        if (item) {
            // If a new item is selected
            if (currentChatItemTag !== item.tag) {
                currentChatItemTag = item.tag;
                chatEnded = false;
                chatHistoryLoaded = false;
                currentChatStep = 'start';
                clearChatHistory();
                selectedItem = item;
                traverseChatFlow('start');
            } else {
                // If the same item is selected again after chat flow has ended
                if (chatEnded) {
                    appendMessage('bot', `You are already interested in this item: ${item.tag}`);
                }
            }
        } else {
            // If no item is selected and chat is opened
            if (!chatHistoryLoaded) {
                loadChatHistory();
                chatHistoryLoaded = true;
                if (currentChatStep !== 'start' && !chatEnded) {
                    traverseChatFlow(currentChatStep);
                }
            }
        }
    }

    // Traverse Chat Flow
    function traverseChatFlow(nodeKey) {
        const node = window.chatFlow[nodeKey];
        if (!node) return;

        appendMessage('bot', node.message);
        localStorage.setItem('currentChatStep', nodeKey);  // Save current chat step

        if (node.type === 'input') {
            enableChatInput(node);
        } else if (node.type === 'image') {
            displayImage(node.src);
            if (node.next) {
                setTimeout(() => traverseChatFlow(node.next), 1000);
            }
        } else if (node.options && node.options.length > 0) {
            displayOptions(node.options);
        } else if (node.next) {
            setTimeout(() => traverseChatFlow(node.next), 1000);
        } else {
            chatEnded = true;
        }
    }

    // Enable Chat Input
    function enableChatInput(node) {
        const sendButton = document.getElementById('sendButton');
        const clientMessage = document.getElementById('clientMessage');
        
        sendButton.onclick = function () {
            const message = clientMessage.value;
            if (message.trim() !== "") {
                appendMessage('client', message);
                clientMessage.value = "";
                traverseChatFlow(node.next);
            }
        };

        clientMessage.addEventListener("keyup", function (event) {
            if (event.key === "Enter") {
                sendButton.click();
            }
        });
    }

    // Display Image
    function displayImage(src) {
        const chatbotBody = document.getElementById('chatbotBody');
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Image';
        img.className = 'chat-image';
        chatbotBody.appendChild(img);
        chatbotBody.scrollTop = chatbotBody.scrollHeight;
    }

    // Display Options
    function displayOptions(options) {
        const chatbotBody = document.getElementById('chatbotBody');
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';

        options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option.text;
            button.addEventListener('click', () => {
                appendMessage('client', option.text);
                optionsDiv.remove();
                traverseChatFlow(option.next);
            });
            optionsDiv.appendChild(button);
        });

        chatbotBody.appendChild(optionsDiv);
        chatbotBody.scrollTop = chatbotBody.scrollHeight;
    }

    // Append Message
    function appendMessage(sender, message) {
        const chatbotBody = document.getElementById('chatbotBody');
        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'bot' ? 'bot-message' : 'client-message';
        messageDiv.textContent = message;
        chatbotBody.appendChild(messageDiv);
        chatbotBody.scrollTop = chatbotBody.scrollHeight;

        // Save message to chat history
        saveChatHistory(sender, message);
    }

    // Save Chat History
    function saveChatHistory(sender, message) {
        let chatHistory = JSON.parse(localStorage.getItem('chat_history')) || [];
        chatHistory.push({ sender, message });
        localStorage.setItem('chat_history', JSON.stringify(chatHistory));
    }

    // Load Chat History
    function loadChatHistory() {
        let chatHistory = JSON.parse(localStorage.getItem('chat_history')) || [];
        const chatbotBody = document.getElementById('chatbotBody');
        chatbotBody.innerHTML = ''; // Clear existing chat history before loading
        chatHistory.forEach(chat => {
            appendMessage(chat.sender, chat.message);
        });
    }

    // Clear Chat History
    function clearChatHistory() {
        localStorage.removeItem('chat_history');
        const chatbotBody = document.getElementById('chatbotBody');
        chatbotBody.innerHTML = ''; // Clear chat body
    }

    // Chatbot Functionality
    const chatbotButton = document.getElementById('chatbotButton');
    const closeChatbot = document.getElementById('closeChatbot');
    const sendButton = document.getElementById('sendButton');
    const clientMessage = document.getElementById('clientMessage');

    chatbotButton.onclick = function () {
        startChat();
    }

    closeChatbot.onclick = function () {
        const chatbotModal = document.getElementById('chatbotModal');
        chatbotModal.style.display = 'none';
    }

    window.onclick = function (event) {
        const chatbotModal = document.getElementById('chatbotModal');
        if (event.target == chatbotModal) {
            chatbotModal.style.display = 'none';
        }
    }

    sendButton.onclick = async function () {
        const message = clientMessage.value;
        if (message.trim() !== "") {
            appendMessage('client', message);
            clientMessage.value = "";

            if (chatEnded) {
                const loader = createLoader();
                document.getElementById('chatbotBody').appendChild(loader);
                document.getElementById('chatbotBody').scrollTop = document.getElementById('chatbotBody').scrollHeight;

                try {
                    const response = await fetch('http://localhost:3001/generate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ message: message })
                    });

                    const data = await response.json();
                    loader.remove();
                    appendMessage('bot', data.message);
                } catch (error) {
                    console.error('Error:', error);
                    loader.remove();
                }
            } else {
                traverseChatFlow(currentChatStep);
            }
        }
    }

    function createLoader() {
        const loader = document.createElement('div');
        loader.className = 'loader';
        return loader;
    }

    // Export startChat function to be used in other scripts
    window.startChat = startChat;

})();
