chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'gemini') {
    handleGeminiRequest(request, sendResponse);
    return true; // Keep message channel open for async response
  }
});

async function handleGeminiRequest(request, sendResponse) {
  try {
    // Get API key from storage
    const result = await chrome.storage.sync.get(['gemini_api_key']);
    const apiKey = result.gemini_api_key;
    
    if (!apiKey) {
      sendResponse({ error: 'No API key found. Please set your Google Gemini API key in the extension popup.' });
      return;
    }
    
    // Prepare prompt for Gemini
    const systemPrompt = `You are an AI assistant that helps users understand and analyze web pages. You have access to the current page content. Be helpful, concise, and accurate. Here's the current page content:\n\n${request.pageContent}\n\n`;
    
    // Build conversation history
    let conversationHistory = '';
    for (const msg of request.messages) {
      if (msg.role === 'user') {
        conversationHistory += `User: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        conversationHistory += `Assistant: ${msg.content}\n`;
      }
    }
    
    const fullPrompt = systemPrompt + conversationHistory + `User: ${request.message}\nAssistant:`;
    
    // Make API call to Google Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API request failed');
    }
    
    const data = await response.json();
    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
    
    sendResponse({ message: aiMessage });
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    sendResponse({ error: error.message });
  }
}