let chatPopup = null;

function toggleConversation() {
    if (chatPopup) {
        chatPopup.remove();
        chatPopup = null;
    } else {
        const chatHTML = `
            <div id="chat-container" style="width: 300px; height: 400px; display: flex; flex-direction: column;">
                <div id="chat-messages" style="flex-grow: 1; overflow-y: auto; padding: 10px;"></div>
                <form id="chat-form" style="display: flex; padding: 10px;">
                    <input type="text" id="chat-input" placeholder="Entrez votre message..." required style="flex-grow: 1; margin-right: 10px;">
                    <button type="submit">Envoyer</button>
                </form>
            </div>
        `;

        chatPopup = new mapboxgl.Popup({
            closeOnClick: false,
            anchor: 'bottom-right',
            offset: [0, -10]
        })
            .setLngLat(map.getCenter())
            .setHTML(chatHTML)
            .addTo(map);

        // Initialiser le chat après que la popup est ajoutée au DOM
        initializeChat();
    }
}

function initializeChat() {
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

    loadChatHistory();

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (message) {
            addMessage(message);
            saveChatHistory();
            chatInput.value = '';
        }
    });
}

function addMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function saveChatHistory() {
    const chatMessages = document.getElementById('chat-messages');
    const messages = Array.from(chatMessages.children).map(msg => msg.textContent);
    localStorage.setItem('chatHistory', JSON.stringify(messages));
}

function loadChatHistory() {
    const chatMessages = document.getElementById('chat-messages');
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    history.forEach(message => addMessage(message));
}

// Ajouter l'écouteur d'événements pour le bouton Conversation
document.getElementById('conversationBtn').addEventListener('click', toggleConversation);