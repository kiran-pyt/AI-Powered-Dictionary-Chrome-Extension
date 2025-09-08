// AI-Powered Dictionary Content Script
// Detects double-clicks on words and displays dictionary popup

class DictionaryPopup {
  constructor() {
    this.popup = null;
    this.isVisible = false;
    this.currentWord = '';
    this.init();
  }

  init() {
    // Add double-click event listener to document
    document.addEventListener('dblclick', this.handleDoubleClick.bind(this));
    
    // Close popup when clicking outside
    document.addEventListener('click', this.handleOutsideClick.bind(this));
    
    // Close popup on scroll
    document.addEventListener('scroll', this.hidePopup.bind(this));
  }

  handleDoubleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    // Get the selected word
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText && this.isValidWord(selectedText)) {
      this.currentWord = selectedText.toLowerCase();
      this.showPopup(event.clientX, event.clientY);
      this.fetchWordData(this.currentWord);
    }
  }

  handleOutsideClick(event) {
    if (this.popup && !this.popup.contains(event.target)) {
      this.hidePopup();
    }
  }

  isValidWord(word) {
    // Check if the selected text is a valid word (letters only, reasonable length)
    return /^[a-zA-Z]+$/.test(word) && word.length > 1 && word.length < 50;
  }

  showPopup(x, y) {
    this.hidePopup(); // Remove any existing popup

    // Create popup element
    this.popup = document.createElement('div');
    this.popup.className = 'dictionary-popup';
    this.popup.innerHTML = `
      <div class="popup-header">
        <h3 class="word-title">${this.currentWord}</h3>
        <button class="close-btn" aria-label="Close">&times;</button>
      </div>
      <div class="popup-content">
        <div class="loading">Loading definition...</div>
      </div>
    `;

    // Position the popup
    this.positionPopup(x, y);

    // Add to document
    document.body.appendChild(this.popup);
    this.isVisible = true;

    // Add close button event listener
    const closeBtn = this.popup.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => this.hidePopup());
  }

  positionPopup(x, y) {
    const popupRect = this.popup.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust position if popup would go off-screen
    let left = x + 10;
    let top = y + 10;

    if (left + popupRect.width > viewportWidth) {
      left = x - popupRect.width - 10;
    }

    if (top + popupRect.height > viewportHeight) {
      top = y - popupRect.height - 10;
    }

    // Ensure popup stays within viewport
    left = Math.max(10, Math.min(left, viewportWidth - popupRect.width - 10));
    top = Math.max(10, Math.min(top, viewportHeight - popupRect.height - 10));

    this.popup.style.left = `${left}px`;
    this.popup.style.top = `${top}px`;
  }

  hidePopup() {
    if (this.popup) {
      this.popup.remove();
      this.popup = null;
      this.isVisible = false;
    }
  }

  async fetchWordData(word) {
    try {
      // Send message to background script to fetch data
      const response = await chrome.runtime.sendMessage({
        action: 'fetchWordData',
        word: word
      });

      if (response.success) {
        this.displayWordData(response.data);
      } else {
        this.displayError(response.error || 'Failed to fetch word data');
      }
    } catch (error) {
      console.error('Error fetching word data:', error);
      this.displayError('Network error. Please check your connection.');
    }
  }

  displayWordData(data) {
    if (!this.popup) return;

    const content = this.popup.querySelector('.popup-content');
    content.innerHTML = `
      <div class="definition-section">
        <h4>Definition</h4>
        <p class="definition">${data.definition || 'No definition available'}</p>
      </div>
      
      ${data.synonyms && data.synonyms.length > 0 ? `
        <div class="synonyms-section">
          <h4>Synonyms</h4>
          <div class="synonyms">${data.synonyms.join(', ')}</div>
        </div>
      ` : ''}
      
      ${data.example ? `
        <div class="example-section">
          <h4>Example</h4>
          <p class="example">"${data.example}"</p>
        </div>
      ` : ''}
      
      <div class="actions">
        <button class="explain-btn" data-word="${this.currentWord}">
          Explain like I'm five
        </button>
      </div>
    `;

    // Add event listener for explain button
    const explainBtn = content.querySelector('.explain-btn');
    explainBtn.addEventListener('click', () => this.explainLikeFive(this.currentWord));
  }

  displayError(message) {
    if (!this.popup) return;

    const content = this.popup.querySelector('.popup-content');
    content.innerHTML = `
      <div class="error-message">
        <p>${message}</p>
        <button class="retry-btn">Retry</button>
      </div>
    `;

    // Add retry functionality
    const retryBtn = content.querySelector('.retry-btn');
    retryBtn.addEventListener('click', () => this.fetchWordData(this.currentWord));
  }

  async explainLikeFive(word) {
    if (!this.popup) return;

    const explainBtn = this.popup.querySelector('.explain-btn');
    const originalText = explainBtn.textContent;
    explainBtn.textContent = 'Explaining...';
    explainBtn.disabled = true;

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'explainLikeFive',
        word: word
      });

      if (response.success) {
        this.displayExplanation(response.explanation);
      } else {
        this.displayError(response.error || 'Failed to get explanation');
      }
    } catch (error) {
      console.error('Error getting explanation:', error);
      this.displayError('Failed to get explanation');
    } finally {
      explainBtn.textContent = originalText;
      explainBtn.disabled = false;
    }
  }

  displayExplanation(explanation) {
    if (!this.popup) return;

    const content = this.popup.querySelector('.popup-content');
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'explanation-section';
    explanationDiv.innerHTML = `
      <h4>Explain like I'm five</h4>
      <p class="explanation">${explanation}</p>
    `;

    // Insert explanation at the top
    content.insertBefore(explanationDiv, content.firstChild);
  }
}

// Initialize the dictionary popup when the script loads
const dictionaryPopup = new DictionaryPopup();
