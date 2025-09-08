# AI-Powered Dictionary Chrome Extension

A simple and elegant Chrome extension that provides instant word definitions, synonyms, examples, and AI-powered explanations when you double-click any word on a webpage.

## Features

- **Double-click Detection**: Simply double-click any word on any webpage
- **Instant Definitions**: Get word meanings from the Free Dictionary API
- **Synonyms**: View related words and alternatives
- **Example Sentences**: See words used in context
- **AI Explanations**: "Explain like I'm five" feature powered by OpenAI GPT
- **Offline Support**: Cached results work even without internet
- **Clean UI**: Modern, minimal design with smooth animations
- **Dark Mode**: Automatically adapts to your system theme

## Installation

### From Source (Developer Mode)

1. **Download the Extension**
   - Download or clone this repository
   - Extract the files to a folder on your computer

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the extension folder
   - The extension should now appear in your extensions list

3. **Pin the Extension** (Optional)
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "AI-Powered Dictionary" and click the pin icon

## Setup

### OpenAI API Key (Optional)

To use the "Explain like I'm five" feature:

1. Click the extension icon in your toolbar
2. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
3. Paste your API key in the settings popup
4. Click "Save Settings"

**Note**: The extension works without an API key, but you'll only get basic definitions, synonyms, and examples.

## Usage

1. **Basic Usage**
   - Navigate to any webpage
   - Double-click any word
   - A popup will appear with the word's definition, synonyms, and example

2. **AI Explanation**
   - After getting a definition, click "Explain like I'm five"
   - Get a simple, child-friendly explanation of the word

3. **Offline Mode**
   - The extension caches results for 24 hours
   - Previously looked-up words will work offline
   - Shows "No internet connection" message when offline

## File Structure

```
Dictionary_APP/
├── manifest.json          # Extension configuration
├── content.js            # Main content script (double-click detection)
├── background.js         # Background service worker (API calls)
├── popup.html           # Settings popup interface
├── popup.js             # Settings popup script
├── popup.css            # Styling for the dictionary popup
├── icon48.png           # Extension icon (48x48)
├── icon128.png          # Extension icon (128x128)
└── README.md            # This file
```

## API Usage

### Free Dictionary API
- **Endpoint**: `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`
- **Rate Limit**: No official limit, but be respectful
- **Usage**: Provides definitions, synonyms, and examples

### OpenAI API
- **Model**: GPT-3.5-turbo
- **Usage**: Generates simple explanations for the "Explain like I'm five" feature
- **Cost**: Based on OpenAI's pricing (very minimal for this use case)

## Privacy & Security

- **No Data Collection**: The extension doesn't collect or store personal data
- **Local Storage**: Only caches word definitions locally
- **API Keys**: Stored securely in Chrome's sync storage
- **Permissions**: Only requests access to active tabs and API endpoints

## Troubleshooting

### Common Issues

1. **Popup doesn't appear**
   - Make sure you're double-clicking on actual text (not images or buttons)
   - Check that the extension is enabled in `chrome://extensions/`

2. **"No internet connection" error**
   - Check your internet connection
   - Try refreshing the page and double-clicking again

3. **"Explain like I'm five" not working**
   - Verify your OpenAI API key is correctly entered in settings
   - Check that you have credits in your OpenAI account
   - Ensure the API key has the correct permissions

4. **Extension not loading**
   - Make sure all files are in the same folder
   - Check the browser console for any error messages
   - Try reloading the extension in `chrome://extensions/`

### Browser Console

To debug issues:
1. Right-click on any webpage → "Inspect"
2. Go to the "Console" tab
3. Look for any error messages related to the extension

## Development

### Making Changes

1. Edit the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

### Key Files to Modify

- **content.js**: Main functionality and popup display
- **background.js**: API calls and data processing
- **popup.css**: Styling and appearance
- **manifest.json**: Extension configuration and permissions

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the extension!

## Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Look at the browser console for error messages
3. Create an issue in the repository with details about the problem
