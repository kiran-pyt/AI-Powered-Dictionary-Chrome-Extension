// AI-Powered Dictionary Background Script
// Handles API calls and offline functionality

class DictionaryService {
  constructor() {
    this.cache = new Map();
    this.isOnline = true; // Default to online, will be updated by network requests
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for online/offline status changes
    chrome.runtime.onConnect.addListener((port) => {
      if (port.name === 'onlineStatus') {
        port.postMessage({ isOnline: this.isOnline });
      }
    });

    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async response
    });
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'fetchWordData':
          const wordData = await this.fetchWordData(request.word);
          sendResponse({ success: true, data: wordData });
          break;
        
        case 'explainLikeFive':
          const explanation = await this.explainLikeFive(request.word);
          sendResponse({ success: true, explanation });
          break;
        
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ 
        success: false, 
        error: this.isOnline ? 'API request failed' : 'No internet connection'
      });
    }
  }

  async fetchWordData(word) {
    // Check cache first
    const cacheKey = `word_${word}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
        return cached.data;
      }
    }

    if (!this.isOnline) {
      throw new Error('No internet connection');
    }

    try {
      // Fetch from Free Dictionary API
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      
      // Update online status based on successful request
      this.updateOnlineStatusFromRequest(true);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        throw new Error('Word not found');
      }

      // Extract relevant information from the API response
      const wordInfo = data[0];
      const result = this.parseDictionaryData(wordInfo);

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Dictionary API error:', error);
      
      // Update online status based on failed request
      this.updateOnlineStatusFromRequest(false);
      
      // Return offline-friendly response
      if (!this.isOnline) {
        return {
          definition: 'No internet connection. Please check your connection and try again.',
          synonyms: [],
          example: null
        };
      }
      
      throw error;
    }
  }

  parseDictionaryData(wordInfo) {
    let definition = 'No definition available';
    let synonyms = [];
    let example = null;

    // Extract definition from meanings
    if (wordInfo.meanings && wordInfo.meanings.length > 0) {
      const firstMeaning = wordInfo.meanings[0];
      
      if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
        const firstDef = firstMeaning.definitions[0];
        definition = firstDef.definition || definition;
        example = firstDef.example || null;
      }

      // Extract synonyms
      if (firstMeaning.synonyms && firstMeaning.synonyms.length > 0) {
        synonyms = firstMeaning.synonyms.slice(0, 5); // Limit to 5 synonyms
      }
    }

    return {
      definition,
      synonyms,
      example
    };
  }

  async explainLikeFive(word) {
    const cacheKey = `explain_${word}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 7 * 24 * 60 * 60 * 1000) { // 7 days
        return cached.explanation;
      }
    }

    if (!this.isOnline) {
      throw new Error('No internet connection');
    }

    try {
      // Get OpenAI API key from storage
      const result = await chrome.storage.sync.get(['openaiApiKey']);
      const apiKey = result.openaiApiKey;

      if (!apiKey) {
        throw new Error('OpenAI API key not configured. Please add your API key in the extension settings.');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that explains words in simple terms that a 5-year-old would understand. Keep explanations short, friendly, and use simple words.'
            },
            {
              role: 'user',
              content: `Explain the word "${word}" like I'm 5 years old. Keep it simple and fun!`
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const explanation = data.choices?.[0]?.message?.content || 'Sorry, I couldn\'t explain that word right now.';

      // Cache the explanation
      this.cache.set(cacheKey, {
        explanation,
        timestamp: Date.now()
      });

      return explanation;
    } catch (error) {
      console.error('OpenAI API error:', error);
      
      if (!this.isOnline) {
        throw new Error('No internet connection');
      }
      
      throw error;
    }
  }

  // Utility method to check online status
  updateOnlineStatus() {
    // In service worker context, we'll determine online status based on network requests
    // This will be updated when we make actual API calls
  }

  // Method to update online status based on network request results
  updateOnlineStatusFromRequest(success) {
    this.isOnline = success;
  }
}

// Initialize the dictionary service
const dictionaryService = new DictionaryService();

// Listen for online/offline events (service worker context)
self.addEventListener('online', () => {
  dictionaryService.updateOnlineStatus();
});

self.addEventListener('offline', () => {
  dictionaryService.updateOnlineStatus();
});

// Handle extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      openaiApiKey: '',
      cacheEnabled: true
    });
  }
});
