(function() {
  'use strict';

  // Monumentum chat widget with resilient response parsing for n8n/Supabase flows
  const MonumentumChat = {
    config: {
      webhookUrl: 'https://nkwmfqbuhvtloihbrwef.supabase.co/functions/v1/agent',
      customerId: null,
      position: 'bottom-right',
      primaryColor: '#0066cc',
      greeting: 'Hi! How can we help you today?'
    },

    sessionId: null,
    chatOpen: false,
    history: [],

    init: function(userConfig) {
      Object.assign(this.config, userConfig);

      if (!this.config.customerId) {
        console.error('Monumentum: customerId is required');
        return;
      }

      this.sessionId = this.getOrCreateSession();
      this.history = [];
      this.injectStyles();
      this.createChatUI();
      this.attachEventListeners();
    },

    getOrCreateSession: function() {
      const storageKey = `monumentum_session_${this.config.customerId}`;
      let sessionId = localStorage.getItem(storageKey);

      if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(storageKey, sessionId);
      }

      return sessionId;
    },

    injectStyles: function() {
      const styles = `
        #monumentum-chat-button {
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

        #monumentum-chat-button:hover {
          transform: scale(1.1);
        }

        #monumentum-chat-window {
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

        #monumentum-chat-window.open {
          display: flex;
        }

        #monumentum-chat-header {
          background: ${this.config.primaryColor};
          color: white;
          padding: 16px;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
        }

        #monumentum-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #fafafa;
        }

        .monumentum-message {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 18px;
          word-wrap: break-word;
          line-height: 1.4;
        }

        .monumentum-message.user {
          background: ${this.config.primaryColor};
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }

        .monumentum-message.assistant {
          background: white;
          color: #333;
          align-self: flex-start;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .monumentum-message a {
          color: #0066cc;
          text-decoration: underline;
          display: block;
          margin: 8px 0;
          word-break: break-all;
        }

        .monumentum-message.system {
          background: #fff9e6;
          color: #856404;
          align-self: center;
          max-width: 90%;
          font-size: 13px;
          border: 1px solid #ffeaa7;
        }

        #monumentum-chat-input-container {
          padding: 16px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 8px;
          background: white;
          border-radius: 0 0 12px 12px;
        }

        #monumentum-chat-input {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 20px;
          outline: none;
          font-size: 14px;
          font-family: inherit;
        }

        #monumentum-chat-input:focus {
          border-color: ${this.config.primaryColor};
        }

        #monumentum-chat-send {
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

        #monumentum-chat-send:hover {
          opacity: 0.9;
        }

        #monumentum-chat-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .monumentum-typing {
          display: none;
          padding: 10px 14px;
          background: white;
          border-radius: 18px;
          align-self: flex-start;
          max-width: 80px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .monumentum-typing.show {
          display: block;
        }

        .monumentum-typing span {
          height: 8px;
          width: 8px;
          background: #999;
          border-radius: 50%;
          display: inline-block;
          margin: 0 2px;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .monumentum-typing span:nth-child(1) { animation-delay: -0.32s; }
        .monumentum-typing span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        @media (max-width: 480px) {
          #monumentum-chat-window {
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
      const button = document.createElement('button');
      button.id = 'monumentum-chat-button';
      button.setAttribute('aria-label', 'Open chat');
      button.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;

      const windowEl = document.createElement('div');
      windowEl.id = 'monumentum-chat-window';
      windowEl.innerHTML = `
        <div id="monumentum-chat-header">
          <strong>Chat with Us</strong>
          <button id="monumentum-chat-close" style="background:none;border:none;color:white;font-size:24px;cursor:pointer;line-height:1;padding:0;width:30px;height:30px;" aria-label="Close chat">×</button>
        </div>
        <div id="monumentum-chat-messages"></div>
        <div class="monumentum-typing">
          <span></span><span></span><span></span>
        </div>
        <div id="monumentum-chat-input-container">
          <input type="text" id="monumentum-chat-input" placeholder="Type your message..." aria-label="Chat message" />
          <button id="monumentum-chat-send" aria-label="Send message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      `;

      document.body.appendChild(button);
      document.body.appendChild(windowEl);
    },

    attachEventListeners: function() {
      const button = document.getElementById('monumentum-chat-button');
      const closeBtn = document.getElementById('monumentum-chat-close');
      const sendBtn = document.getElementById('monumentum-chat-send');
      const input = document.getElementById('monumentum-chat-input');

      button.addEventListener('click', () => this.toggleChat());
      closeBtn.addEventListener('click', () => this.toggleChat());
      sendBtn.addEventListener('click', () => this.sendMessage());
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
    },

    toggleChat: function() {
      const windowEl = document.getElementById('monumentum-chat-window');
      this.chatOpen = !this.chatOpen;

      if (this.chatOpen) {
        windowEl.classList.add('open');
        document.getElementById('monumentum-chat-input').focus();

        if (this.history.length === 0) {
          const greeting = this.config.businessGreeting || 'Hi there! How can I help you today?';
          this.addMessage(greeting, 'assistant');
        }
      } else {
        windowEl.classList.remove('open');
      }
    },

    buildPayload: function(message) {
      const conversationHistory = [...this.history, { role: 'user', content: message }];
      return {
        agentType: 'integrated',
        customerId: this.config.customerId,
        sessionId: this.sessionId,
        message,
        history: conversationHistory
      };
    },

    parseResponse: function(raw) {
      const tryJson = (value) => {
        if (typeof value !== 'string') return value;
        const trimmed = value.trim();
        if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return value;
        try {
          return JSON.parse(trimmed);
        } catch (err) {
          console.warn('Monumentum: could not parse stringified JSON response', err);
          return value;
        }
      };

      const unwrap = (value) => {
        let current = value;
        let hops = 0;

        while (current && hops < 8) {
          const maybeParsed = tryJson(current);
          if (maybeParsed !== current) {
            current = maybeParsed;
            hops += 1;
            continue;
          }

          if (Array.isArray(current)) {
            current = current[0];
            hops += 1;
            continue;
          }

          if (
            current &&
            typeof current === 'object' &&
            (current.data || current.response || current.json || current.body || current.result)
          ) {
            current = current.data ?? current.response ?? current.json ?? current.body ?? current.result;
            hops += 1;
            continue;
          }

          break;
        }

        return current;
      };

      const response = unwrap(raw) ?? {};
      const textFields = ['message', 'answer', 'text', 'content'];

      const message =
        typeof response === 'string'
          ? response.trim()
          : textFields
              .map((key) => (typeof response?.[key] === 'string' ? response[key].trim() : ''))
              .find((val) => val);

      const buttonSource = response?.buttons ?? response?.options ?? response?.actions ?? [];
      const buttons = Array.isArray(buttonSource)
        ? buttonSource
            .map((btn) => ({
              label: btn?.label || btn?.text || btn?.title || String(btn?.value ?? btn?.payload ?? ''),
              value: btn?.value ?? btn?.payload ?? btn?.text ?? btn?.label ?? ''
            }))
            .filter((btn) => btn.label && btn.value)
        : [];

      return {
        message: message || 'Sorry, I didn\'t understand that.',
        buttons,
        leadSubmitted: Boolean(response?.leadSubmitted || response?.hasLead),
        leadData: response?.leadData || null,
        ticketData: response?.ticketData || null,
        conversationCompleted: Boolean(response?.conversationCompleted)
      };
    },

    sendMessage: function() {
      const input = document.getElementById('monumentum-chat-input');
      const sendBtn = document.getElementById('monumentum-chat-send');
      const message = input.value.trim();

      if (!message) return;

      input.disabled = true;
      sendBtn.disabled = true;
      this.addMessage(message, 'user');
      input.value = '';
      this.showTyping(true);


      console.log("HISTORY SERIALIZABLE?", !!JSON.stringify(this.history));

      fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },



        // NEW CODE

        body: JSON.stringify(this.buildPayload(message))
      })

 .then(res => {
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();   // ✅ 1-line fix
})

        .then((data) => {

  // --- BULLETPROOF NORMALIZATION ---
  let normalized = data;

  // 1. If Supabase/n8n returned an array, use first element
  if (Array.isArray(normalized)) {
    normalized = normalized[0] || {};
  }

  // 2. If backend returned text, wrap it
  if (typeof normalized === "string") {
    normalized = { message: normalized };
  }

  // 3. If backend returned empty or weird shape
  if (!normalized || typeof normalized !== "object") {
    normalized = { message: "Thank you for your message." };
  }

  // 4. Guarantee message exists
  if (!normalized.message || typeof normalized.message !== "string") {
    normalized.message = "Thank you — we'll follow up shortly.";
  }
  // --- END NORMALIZATION ---

  this.showTyping(false);

  // USE NORMALIZED DIRECTLY — DO NOT CALL parseResponse()
  const response = normalized;

  this.addMessage(response.message, 'assistant');

  // Update history
  this.history.push({ role: 'user', content: message });
  this.history.push({ role: 'assistant', content: response.message });

  if (response.leadSubmitted && response.leadData) {
    const name = response.leadData.name ? ` for ${response.leadData.name}` : '';
    this.addMessage(`✅ Lead captured${name}. We'll be in touch soon!`, 'system');
  }

  if (response.ticketData) {
    this.addMessage('✅ Support ticket created. We\'ll get back to you soon!', 'system');
  }

  if (response.conversationCompleted) {
    this.addMessage('🟢 Thank you! This conversation has been completed. Feel free to start a new chat if you have more questions.', 'system');
  }

  input.disabled = false;
  sendBtn.disabled = false;
  input.focus();
})

    },

    addMessage: function(text, role, buttons) {
      const messagesContainer = document.getElementById('monumentum-chat-messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = `monumentum-message ${role}`;

      const linkedText = text.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
      );

      messageDiv.innerHTML = linkedText;
      messagesContainer.appendChild(messageDiv);

      if (buttons && buttons.length > 0) {
        buttons.forEach((btn) => {
          const button = document.createElement('button');
          button.style.cssText = 'padding: 8px 16px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 4px;';
          button.innerHTML = btn.label;
          button.onclick = () => {
            document.getElementById('monumentum-chat-input').value = btn.value;
            this.sendMessage();
          };
          messagesContainer.appendChild(button);
        });
      }

      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    showTyping: function(show) {
      const typing = document.querySelector('.monumentum-typing');
      if (show) {
        typing.classList.add('show');
      } else {
        typing.classList.remove('show');
      }
    }
  };

  window.MonumentumChat = MonumentumChat;
  console.log('Monumentum Integrated Sales & Service Widget v1.1 loaded');

  window.addEventListener('beforeunload', () => {
    try {
      const id = (window.MonumentumChat && window.MonumentumChat.config && window.MonumentumChat.config.customerId) || '';
      if (id) {
        localStorage.removeItem(`monumentum_session_${id}`);
      } else {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('monumentum_session_')) localStorage.removeItem(k);
        }
      }
      console.log('[MonumentumChat] Session cleared on browser close');
    } catch (err) {
      console.error('[MonumentumChat] Error clearing session:', err);
    }
  });
})();
