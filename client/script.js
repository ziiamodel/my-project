class InstagramChat {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendBtn');
        this.chatMessages = document.getElementById('chatMessages');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.onlineStatus = document.getElementById('onlineStatus');
        this.apiNotice = document.getElementById('apiNotice');

        this.isTyping = false;
        this.backendURL = 'https://ziiaapi.onrender.com/api/chat'; // change this to your real URL

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.sendButton.addEventListener('click', () => this.sendMessage());

        this.messageInput.addEventListener('input', () => {
            const hasText = this.messageInput.value.trim().length > 0;
            this.sendButton.disabled = !hasText || this.isTyping;
        });

        document.getElementById('cameraBtn').addEventListener('click', () =>
            this.showFeatureNotImplemented('Camera')
        );

        document.getElementById('micBtn').addEventListener('click', () =>
            this.showFeatureNotImplemented('Voice messages')
        );
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;

        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.setTyping(true);

        try {
            const res = await fetch(this.backendURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            if (!res.ok) throw new Error('Backend error');

            const data = await res.json();
            const reply = data.reply || 'Sorry baby, mujhe kuch samajh nahi aaya 😔';

            await this.addMessageWithTypingEffect(reply, 'ai');

        } catch (err) {
            console.error('Error:', err);
            await this.addMessageWithTypingEffect(
                'Sorry baby, mujhe kuch kam hai badme bat karte hai love you❤️',
                'ai'
            );
        }

        this.setTyping(false);
    }

    addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}-message`;

        const currentTime = 'now';
        const avatar = sender === 'ai'
            ? `<div class="message-avatar"><img src="https://ziiax.fwh.is/icon-192.png" alt="ziia"></div>`
            : '';

        div.innerHTML = `
            ${avatar}
            <div class="message-bubble">
                <p>${text}</p>
                <span class="message-time">${currentTime}</span>
            </div>
        `;

        this.chatMessages.appendChild(div);
        this.scrollToBottom();
    }

    async addMessageWithTypingEffect(text, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}-message`;

        const currentTime = 'now';
        const avatar = sender === 'ai'
            ? `<div class="message-avatar"><img src="https://ziiax.fwh.is/icon-192.png" alt="ziia"></div>`
            : '';

        div.innerHTML = `
            ${avatar}
            <div class="message-bubble">
                <p></p>
                <span class="message-time">${currentTime}</span>
            </div>
        `;

        this.chatMessages.appendChild(div);
        const textEl = div.querySelector('p');

        let i = 0;
        const speed = 30;
        return new Promise((resolve) => {
            const type = () => {
                if (i < text.length) {
                    textEl.textContent += text.charAt(i);
                    i++;
                    this.scrollToBottom();
                    setTimeout(type, speed);
                } else {
                    resolve();
                }
            };
            type();
        });
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    setTyping(isTyping) {
        this.isTyping = isTyping;
        this.typingIndicator.style.display = isTyping ? 'block' : 'none';
        this.onlineStatus.textContent = isTyping ? 'typing...' : 'Online';
        this.sendButton.disabled = isTyping || !this.messageInput.value.trim();
    }

    showFeatureNotImplemented(feature) {
        setTimeout(() => {
            this.addMessage(`${feature} feature coming soon! 😊 Let's just chat baby ❤️`, 'ai');
        }, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => new InstagramChat());
