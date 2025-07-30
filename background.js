chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'chatGPT') {
    handleChatGPTRequest(request, sendResponse);
    return true; // Keep message channel open for async response
  }
});

async function handleChatGPTRequest(request, sendResponse) {
  try {
    // Get API key from storage
    const result = await chrome.storage.sync.get(['openai_api_key']);
    const apiKey = result.openai_api_key;
    
    if (!apiKey) {
      sendResponse({ error: 'No API key found. Please set your OpenAI API key in the extension popup.' });
      return;
    }
    
    // Prepare messages for ChatGPT
    const systemMessage = {
      role: 'system',
      content: `You are an AI assistant that helps users understand and analyze web pages. You have access to the current page content. Be helpful, concise, and accurate. Here's the current page content:\n\n${request.pageContent}`
    };
    
    const messages = [systemMessage, ...request.messages, { role: 'user', content: request.message }];
    
    // Make API call to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API request failed');
    }
    
    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    sendResponse({ message: aiMessage });
    
  } catch (error) {
    console.error('ChatGPT API Error:', error);
    sendResponse({ error: error.message });
  }
}