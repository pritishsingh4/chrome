document.addEventListener('DOMContentLoaded', async () => {
  const apiKeySection = document.getElementById('api-key-section');
  const mainSection = document.getElementById('main-section');
  const apiKeyInput = document.getElementById('api-key-input');
  const saveKeyBtn = document.getElementById('save-key-btn');
  const toggleAssistantBtn = document.getElementById('toggle-assistant-btn');
  const changeKeyBtn = document.getElementById('change-key-btn');

  // Check if API key exists
  const result = await chrome.storage.sync.get(['gemini_api_key']);
  
  if (result.gemini_api_key) {
    apiKeySection.style.display = 'none';
    mainSection.style.display = 'block';
  }

  // Save API key
  saveKeyBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      alert('Please enter a valid API key');
      return;
    }

    if (!apiKey.startsWith('AIza')) {
      alert('Please enter a valid Google Gemini API key (starts with AIza)');
      return;
    }

    await chrome.storage.sync.set({ gemini_api_key: apiKey });
    
    apiKeySection.style.display = 'none';
    mainSection.style.display = 'block';
    
    // Notify content script that API key is ready
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'apiKeyReady' });
  });

  // Toggle assistant
  toggleAssistantBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'toggleAssistant' });
  });

  // Change API key
  changeKeyBtn.addEventListener('click', () => {
    mainSection.style.display = 'none';
    apiKeySection.style.display = 'block';
    apiKeyInput.value = '';
  });
});