class AIPageAssistant {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.isLoading = false;
    this.apiKey = null;
    this.pageContent = '';
    
    this.init();
  }

  async init() {
    // Check if API key exists
    const result = await chrome.storage.sync.get(['openai_api_key']);
    this.apiKey = result.openai_api_key;
    
    if (this.apiKey) {
      this.createAssistant();
      this.extractPageContent();
    }
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'toggleAssistant') {
        this.toggle();
      } else if (request.action === 'apiKeyReady') {
        this.init(); // Reinitialize when API key is ready
      }
    });
  }

  createAssistant() {
    // Remove existing assistant if present
    const existing = document.querySelector('.ai-assistant-container');
    if (existing) {
      existing.remove();
    }

    // Create container
    this.container = document.createElement('div');
    this.container.className = 'ai-assistant-container';
    
    // Create toggle button
    this.toggleBtn = document.createElement('button');
    this.toggleBtn.className = 'ai-assistant-toggle';
    this.toggleBtn.innerHTML = '🤖';
    this.toggleBtn.addEventListener('click', () => this.toggle());
    
    // Create panel
    this.panel = document.createElement('div');
    this.panel.className = 'ai-assistant-panel';
    
    this.panel.innerHTML = `
      <div class="ai-assistant-header">
        <div class="ai-assistant-title">
          🤖 AI Assistant
        </div>
        <button class="ai-assistant-close">×</button>
      </div>
      <div class="ai-assistant-content">
        <div class="ai-chat-messages"></div>
        <div class="ai-input-container">
          <div class="ai-input-wrapper">
            <textarea class="ai-input" placeholder="Ask me anything about this page..." rows="1"></textarea>
            <button class="ai-send-btn">➤</button>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    this.setupEventListeners();
    
    // Append to container
    this.container.appendChild(this.toggleBtn);
    this.container.appendChild(this.panel);
    
    // Add to page
    document.body.appendChild(this.container);
    
    // Add welcome message
    this.addMessage('system', 'Hi! I can help you understand and analyze this webpage. What would you like to know?');
  }

  setupEventListeners() {
    const closeBtn = this.panel.querySelector('.ai-assistant-close');
    const input = this.panel.querySelector('.ai-input');
    const sendBtn = this.panel.querySelector('.ai-send-btn');
    
    closeBtn.addEventListener('click', () => this.close());
    sendBtn.addEventListener('click', () => this.sendMessage());
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
  }

  extractPageContent() {
    // Extract meaningful content from the page
    const title = document.title;
    const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
    
    // Get main text content, excluding scripts and styles
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote');
    const textContent = Array.from(textElements)
      .map(el => el.textContent?.trim())
      .filter(text => text && text.length > 10)
      .slice(0, 50) // Limit to first 50 meaningful text chunks
      .join(' ');
    
    this.pageContent = `Page Title: ${title}\n\nDescription: ${metaDescription}\n\nMain Content: ${textContent.substring(0, 2000)}...`;
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.panel.classList.add('open');
    this.toggleBtn.classList.add('minimized');
    
    // Focus input
    setTimeout(() => {
      this.panel.querySelector('.ai-input').focus();
    }, 300);
  }

  close() {
    this.isOpen = false;
    this.panel.classList.remove('open');
    this.toggleBtn.classList.remove('minimized');
  }

  addMessage(type, content) {
    const messagesContainer = this.panel.querySelector('.ai-chat-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `ai-message ${type}`;
    messageEl.textContent = content;
    messagesContainer.appendChild(messageEl);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  showLoading() {
    const messagesContainer = this.panel.querySelector('.ai-chat-messages');
    const loadingEl = document.createElement('div');
    loadingEl.className = 'ai-loading';
    loadingEl.innerHTML = `
      AI is thinking...
      <div class="ai-loading-dots">
        <div class="ai-loading-dot"></div>
        <div class="ai-loading-dot"></div>
        <div class="ai-loading-dot"></div>
      </div>
    `;
    messagesContainer.appendChild(loadingEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return loadingEl;
  }

  async sendMessage() {
    const input = this.panel.querySelector('.ai-input');
    const sendBtn = this.panel.querySelector('.ai-send-btn');
    const message = input.value.trim();
    
    if (!message || this.isLoading) return;
    
    // Add user message
    this.addMessage('user', message);
    input.value = '';
    input.style.height = 'auto';
    
    // Show loading
    this.isLoading = true;
    sendBtn.disabled = true;
    const loadingEl = this.showLoading();
    
    try {
      // Send to background script for API call
      const response = await chrome.runtime.sendMessage({
        action: 'chatGPT',
        message: message,
        pageContent: this.pageContent,
        messages: this.messages
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Remove loading
      loadingEl.remove();
      
      // Add AI response
      this.addMessage('assistant', response.message);
      this.messages.push({ role: 'user', content: message });
      this.messages.push({ role: 'assistant', content: response.message });
      
    } catch (error) {
      loadingEl.remove();
      this.addMessage('system', `Error: ${error.message}`);
    }
    
    this.isLoading = false;
    sendBtn.disabled = false;
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AIPageAssistant();
  });
} else {
  new AIPageAssistant();
}