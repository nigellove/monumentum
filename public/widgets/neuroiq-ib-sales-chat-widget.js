(function() {
  'use strict';
  
  const NeuroIQChat = {
    config: {
      webhookUrl: 'https://neuroiq.app.n8n.cloud/webhook/lead-intake', //https://neuroiq.app.n8n.cloud/webhook/lead-intake
      customerId: null,
      position: 'bottom-right',
      primaryColor: '#0066cc',
      greeting: 'Hi! How can we help you today?'
    },
    
    sessionId: null,
    chatOpen: false,
    history: [],  // ✅ Store conversation history
    
    init: function(userConfig) {
      // Merge user config
      Object.assign(this.config, userConfig);
      
      // Validate customerId
      if (!this.config.customerId) {
        console.error('NeuroIQ: customerId is required');
        return;
      }
      
      // Generate or retrieve sessionId
      this.sessionId = this.getOrCreateSession();
      
      // Initialize history
      this.history = [];
      
      // Inject CSS
      this.injectStyles();
      
      // Create chat UI
      this.createChatUI();
      
      // Attach event listeners
      this.attachEventListeners();
    },
    
    getOrCreateSession: function() {
      const storageKey = `neuroiq_session_${this.config.customerId}`;
      let sessionId = localStorage.getItem(storageKey);
      
      if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(storageKey, sessionId);
      }
      
      return sessionId;
    },
    
    injectStyles: function() {
      const styles = `
        #neuroiq-chat-button {
          position: fixed;
          ${this.config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
          ${this.config.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: ${this.config.primaryColor};
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: transform 0.3s;
        }
        
        #neuroiq-chat-button:hover {
          transform: scale(1.1);
        }
        
        #neuroiq-chat-window {
          position: fixed;
          ${this.config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
          ${this.config.position.includes('bottom') ? 'bottom: 90px;' : 'top: 90px;'}
          width: 380px;
          max-width: calc(100vw - 40px);
          height: 600px;
          max-height: calc(100vh - 120px);
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          display: none;
          flex-direction: column;
          z-index: 9998;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        #neuroiq-chat-window.open {
          display: flex;
        }
        
        #neuroiq-chat-header {
          background: ${this.config.primaryColor};
          color: white;
          padding: 16px;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
        }
        
        #neuroiq-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #fafafa;
        }
        
        .neuroiq-message {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 18px;
          word-wrap: break-word;
          line-height: 1.4;
        }
        
        .neuroiq-message.user {
          background: ${this.config.primaryColor};
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }
        
        .neuroiq-message.assistant {
          background: white;
          color: #333;
          align-self: flex-start;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .neuroiq-message a {
          color: #0066cc;
          text-decoration: underline;
          display: block;
          margin: 8px 0;
          word-break: break-all;
        }
        
        .neuroiq-message.system {
          background: #fff9e6;
          color: #856404;
          align-self: center;
          max-width: 90%;
          font-size: 13px;
          border: 1px solid #ffeaa7;
        }
        
        #neuroiq-chat-input-container {
          padding: 16px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 8px;
          background: white;
          border-radius: 0 0 12px 12px;
        }
        
        #neuroiq-chat-input {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 20px;
          outline: none;
          font-size: 14px;
          font-family: inherit;
        }
        
        #neuroiq-chat-input:focus {
          border-color: ${this.config.primaryColor};
        }
        
        #neuroiq-chat-send {
          background: ${this.config.primaryColor};
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s;
        }
        
        #neuroiq-chat-send:hover {
          opacity: 0.9;
        }
        
        #neuroiq-chat-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .neuroiq-typing {
          display: none;
          padding: 10px 14px;
          background: white;
          border-radius: 18px;
          align-self: flex-start;
          max-width: 80px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .neuroiq-typing.show {
          display: block;
        }
        
        .neuroiq-typing span {
          height: 8px;
          width: 8px;
          background: #999;
          border-radius: 50%;
          display: inline-block;
          margin: 0 2px;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        
        .neuroiq-typing span:nth-child(1) { animation-delay: -0.32s; }
        .neuroiq-typing span:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        
        @media (max-width: 480px) {
          #neuroiq-chat-window {
            width: calc(100vw - 20px);
            height: calc(100vh - 100px);
            right: 10px !important;
            left: 10px !important;
            bottom: 80px !important;
          }
        }
      `;
      
      const styleSheet = document.createElement('style');
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    },
    
    createChatUI: function() {
      // Chat button
      const button = document.createElement('button');
      button.id = 'neuroiq-chat-button';
      button.setAttribute('aria-label', 'Open chat');
      button.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
      
      // Chat window
      const window = document.createElement('div');
      window.id = 'neuroiq-chat-window';
      window.innerHTML = `
        <div id="neuroiq-chat-header">
          <strong>Chat with Us</strong>
          <button id="neuroiq-chat-close" style="background:none;border:none;color:white;font-size:24px;cursor:pointer;line-height:1;padding:0;width:30px;height:30px;" aria-label="Close chat">×</button>
        </div>
        <div id="neuroiq-chat-messages">
          <div class="neuroiq-message assistant">${this.config.greeting}</div>
        </div>
        <div class="neuroiq-typing">
          <span></span><span></span><span></span>
        </div>
        <div id="neuroiq-chat-input-container">
          <input type="text" id="neuroiq-chat-input" placeholder="Type your message..." aria-label="Chat message" />
          <button id="neuroiq-chat-send" aria-label="Send message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      `;
      
      document.body.appendChild(button);
      document.body.appendChild(window);
    },
    
attachEventListeners: function() {
  const button = document.getElementById('neuroiq-chat-button');
  const closeBtn = document.getElementById('neuroiq-chat-close');
  const sendBtn = document.getElementById('neuroiq-chat-send');
  const input = document.getElementById('neuroiq-chat-input');
  
  button.addEventListener('click', () => this.toggleChat());
  closeBtn.addEventListener('click', () => this.toggleChat());
  sendBtn.addEventListener('click', () => this.sendMessage());
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') this.sendMessage();
  });
},
    
    toggleChat: function() {
      const window = document.getElementById('neuroiq-chat-window');
      this.chatOpen = !this.chatOpen;
      
      if (this.chatOpen) {
        window.classList.add('open');
        document.getElementById('neuroiq-chat-input').focus();
      } else {
        window.classList.remove('open');
      }
    },
    
    sendMessage: function() {
      const input = document.getElementById('neuroiq-chat-input');
      const sendBtn = document.getElementById('neuroiq-chat-send');
      const message = input.value.trim();
      
      if (!message) return;
      
      // Disable input while sending
      input.disabled = true;
      sendBtn.disabled = true;
      
      // Display user message
      this.addMessage(message, 'user');
      input.value = '';
      
      // Show typing indicator
      this.showTyping(true);
      
      // Send to webhook WITH HISTORY ✅
      fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: this.config.customerId,
          sessionId: this.sessionId,
          message: message,
          history: this.history  // ✅ CRITICAL: Send conversation history
        })
      })
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        this.showTyping(false);
        
        const reply = data.message || 'Sorry, I didn\'t understand that.';
        this.addMessage(reply, 'assistant');
        
        // ✅ UPDATE LOCAL HISTORY
        this.history.push({ role: 'user', content: message });
        this.history.push({ role: 'assistant', content: reply });
        
        // Show lead captured notification
        if (data.hasLead && data.leadData) {
          const name = data.leadData.name ? ` for ${data.leadData.name}` : '';
          this.addMessage(`✅ Lead captured${name}. We'll be in touch soon!`, 'system');
        }
        
        // Show conversation completed notice
        if (data.conversationCompleted) {
          this.addMessage('🟢 Thank you! This conversation has been completed. Feel free to start a new chat if you have more questions.', 'system');
        }
        
        // Re-enable input
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
      })
      .catch(err => {
        this.showTyping(false);
        this.addMessage('Sorry, something went wrong. Please try again.', 'assistant');
        console.error('Chat error:', err);
        
        // Re-enable input
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
      });
    },
    
    addMessage: function(text, role) {
      const messagesContainer = document.getElementById('neuroiq-chat-messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = `neuroiq-message ${role}`;
      
      // ✅ AUTO-LINK URLs (make Calendly/booking links clickable)
      const linkedText = text.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
      );
      
      messageDiv.innerHTML = linkedText;
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    
    showTyping: function(show) {
      const typing = document.querySelector('.neuroiq-typing');
      if (show) {
        typing.classList.add('show');
      } else {
        typing.classList.remove('show');
      }
    }
  };
  
  // Expose globally
  window.NeuroIQChat = NeuroIQChat;
  
  // Log version for debugging
  console.log('NeuroIQ Chat Widget v1.0 loaded');
  
  // ✅ Clear stored session when the browser/tab closes
  window.addEventListener('beforeunload', () => {
    try {
      const id = (window.NeuroIQChat && window.NeuroIQChat.config && window.NeuroIQChat.config.customerId) || '';
      if (id) {
        localStorage.removeItem(`neuroiq_session_${id}`);
      } else {
        // Fallback: clear any NeuroIQ session keys if customerId isn't available
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('neuroiq_session_')) localStorage.removeItem(k);
        }
      }
      console.log('[NeuroIQChat] Session cleared on browser close');
    } catch (err) {
      console.error('[NeuroIQChat] Error clearing session:', err);
    }
  });
})();


