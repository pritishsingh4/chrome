# AI Page Assistant Chrome Extension

A powerful Chrome extension that brings ChatGPT directly to any webpage, allowing you to analyze, understand, and interact with page content using AI.

## Features

- **Universal Access**: Works on any webpage
- **Smart Content Analysis**: Automatically extracts and analyzes page content
- **Beautiful UI**: Modern, glassmorphism design with smooth animations
- **Secure**: API keys stored locally, never shared
- **Responsive**: Works on all screen sizes
- **Real-time Chat**: Interactive conversation with AI about the current page

## Installation

1. **Get an OpenAI API Key**
   - Visit [OpenAI's API platform](https://platform.openai.com/api-keys)
   - Create an account and generate an API key
   - Copy your API key (starts with `sk-`)

2. **Install the Extension**
   - Download or clone this repository
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the extension folder

3. **Setup**
   - Click the extension icon in your browser toolbar
   - Enter your OpenAI API key
   - The AI assistant will now appear on any webpage

## Usage

1. **Activate**: Look for the floating 🤖 button on any webpage
2. **Chat**: Click the button to open the AI assistant panel
3. **Ask Questions**: Type anything about the current page:
   - "Summarize this article"
   - "What are the main points?"
   - "Explain this in simple terms"
   - "Find the contact information"
   - "What's the author's opinion on...?"

## Privacy & Security

- Your API key is stored locally in your browser
- No data is sent to third parties except OpenAI for processing
- Page content is only analyzed when you actively use the assistant
- All communication is encrypted via HTTPS

## Technical Details

- **Manifest V3** compatible
- **Modern JavaScript** with ES6+ features
- **CSS3** with advanced animations and glassmorphism effects
- **Content Security Policy** compliant
- **Cross-browser** compatible (Chrome, Edge, Brave)

## File Structure

```
ai-page-assistant/
├── manifest.json          # Extension configuration
├── popup.html             # Settings popup interface
├── popup.css              # Popup styling
├── popup.js               # Popup functionality
├── content.js             # Main assistant logic
├── content.css            # Assistant styling
├── background.js          # Service worker for API calls
├── icons/                 # Extension icons
└── README.md             # This file
```

## Development

To modify or extend the extension:

1. Make your changes to the source files
2. Reload the extension in `chrome://extensions/`
3. Test on various websites

## Troubleshooting

**Assistant not appearing?**
- Check that your API key is valid
- Ensure the extension is enabled
- Try refreshing the page

**API errors?**
- Verify your OpenAI API key is correct
- Check your OpenAI account has sufficient credits
- Ensure stable internet connection

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.