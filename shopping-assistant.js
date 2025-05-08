// Shopping Assistant - Vanilla JS Implementation
(function () {
  // Main class to handle the shopping assistant
  class ShoppingAssistant {
    constructor() {
      this.isOpen = false;
      this.currentView = null; // 'chat', 'poll', 'info'
      this.messages = [
        { id: '1', content: 'What type of helmet are you looking for? Is it for cycling, motorcycling, or something else?', sender: 'assistant' },
        { id: '2', content: 'I need one for cycling.', sender: 'user' },
        { id: '3', content: 'Great! Are you looking for something lightweight, or are you more focused on protection features? Also, do you have any specific preferences for brand or budget?', sender: 'assistant' },
        { id: '4', content: 'I\'m looking for something with good protection but not too heavy. I don\'t have a specific brand in mind, but I don\'t want to spend more than $100', sender: 'user' }
      ];
      this.isThinking = true;
      this.selectedPollOptions = [];
      this.feedback = null;
      this.products = [
        { id: 1, name: 'Black MIPS Cycling Helmet', image: 'https://via.placeholder.com/300' }
      ];
      this.currentProductIndex = 0;

      // Initialize the assistant
      this.init();
    }

    init() {
      // Add CSS to the document
      this.injectStyles();

      // Create assistant button
      this.createAssistantButton();

      // Create containers for different views
      this.createContainers();

      // Add event listeners
      this.addEventListeners();
    }

    injectStyles() {
      const styles = `
        /* Reset and base styles */
        .sa-reset * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        /* Assistant Button */
        .sa-assistant-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 20px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: none;
          z-index: 9999;
          transition: background-color 0.2s;
        }
        
        .sa-assistant-btn:hover {
          background-color: #2563eb;
        }
        
        /* Popup Container - Base for all popups */
        .sa-popup {
          position: fixed;
          bottom: 80px;
          right: 20px;
          width: 100%;
          max-width: 320px;
          max-height: 80dvh;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          z-index: 9998;
          overflow: hidden;
          overflow-y: auto;
          display: none;
          animation: sa-slide-up 0.3s ease;
        }

        .sa-popup::-webkit-scrollbar { 
          display: none;
        }
        
        @keyframes sa-slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        /* Product Recommendation Styles */
        .sa-product-header {
          padding: 16px;
          font-size: 14px;
          font-weight: 400;
        }
        
        .sa-product-container {
          position: relative;
          width: 100%;
          height: 200px;
          aspect-ratio: 1;
          padding: 0 16px;
        }
        
        .sa-product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .sa-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          z-index: 1;
        }
        
        .sa-nav-btn-left {
          left: 0px;
        }
        
        .sa-nav-btn-right {
          right: 0px;
        }
        
        .sa-product-info {
          padding: 0 16px 20px 16px;
        }
        
        .sa-product-name {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 4px;
          margin-top: 5px;
        }
        
        .sa-product-link {
          color: #3b82f6;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
        }
        
        .sa-product-actions {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 20px 16px 16px;
        }
        
        .sa-btn {
          padding: 10px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 400;
          cursor: pointer;
          border: none;
          flex: 1;
        }
        
        .sa-btn-primary {
          background-color: #1f2937;
          color: white;
        }
        
        .sa-btn-primary:hover {
          background-color: #111827;
        }
        
        .sa-btn-secondary {
          background-color: white;
          color: #1f2937;
          border: 1px solid #d1d5db;
        }
        
        .sa-btn-secondary:hover {
          background-color: #f9fafb;
        }
        
        /* Chat Styles */
        .sa-chat-header {
          display: flex;
          background-color: transparent;
          justify-content: flex-end;
          padding: 8px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .sa-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
        }
        
        .sa-close-btn:hover {
          color: #374151;
        }
        
        .sa-messages-container {
          height: 300px;
          overflow-y: auto;
          padding: 16px;
        }

        .sa-messages-container::-webkit-scrollbar { 
          display: none;
        }
        
        .sa-message {
          max-width: 80%;
          padding: 10px 12px;
          border-radius: 12px;
          margin-bottom: 12px;
          word-wrap: break-word;
        }
        
        .sa-message-assistant {
          background-color: #F5F5F5;
          color: #000000;
          opacity: 0.7;
          align-self: flex-start;
          margin-right: auto;
          font-weight: 400;
          font-size: 14px;
        }
        
        .sa-message-user {
          background-color: #E6EEF1;
          color: #000000;
          opacity: 0.7;
          font-weight: 400;
          font-size: 14px;
          align-self: flex-end;
          margin-left: auto;
        }
        
        .sa-thinking {
          background-color: #e5e7eb;
          color: #4b5563;
          padding: 8px 12px;
          border-radius: 12px;
          display: inline-block;
        }
        
        .sa-chat-input-container {
          display: flex;
          align-items: center;
          padding: 12px;
          border-top: 1px solid #f0f0f0;
        }
        
        .sa-chat-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 14px;
          padding: 8px 0;
        }
        
        .sa-send-btn {
          background-color: #3b82f6;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          margin-left: 8px;
        }
        
        .sa-send-btn:hover {
          background-color: #2563eb;
        }
        
        /* Poll Styles */
        .sa-poll-container {
          padding: 16px;
        }
        
        .sa-poll-question {
          font-size: 14px;
          font-weight: 400;
          margin-bottom: 20px;
        }
        
        .sa-poll-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .sa-poll-option {
          padding: 6px 16px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
          background-color: white;
          text-align: center;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .sa-poll-option:hover {
          background-color: #f9fafb;
        }
        
        .sa-poll-option-selected {
          background-color: #f3f4f6;
          border-color: #9ca3af;
        }
        
        /* Info Card Styles */
        .sa-info-card {
          overflow: hidden;
        }
        
        .sa-info-content {
          padding: 16px;
        }
        
        .sa-info-text {
          margin-bottom: 30px;
          font-size: 14px;
        }
        
        .sa-feedback-container {
          display: flex;
          justify-content: right;
          margin-top: 16px;
        }
        
        .sa-feedback-buttons {
          display: flex;
          background-color: #232F3E;
          border-radius: 30px;
        }
        
        .sa-feedback-btn {
          padding: 5px 20px;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .sa-feedback-btn:first-child {
          border-right: 1px solid #d1d5db;
        }
        
        .sa-feedback-btn-selected {
          background-color: #e5e7eb;
        }

        .testimonial-container {
            max-width: 500px;
            margin: 0 auto;
            padding: 0 16px;
        }
        
        .testimonial-header {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
        }
        
        .testimonial-title {
            font-size: 14px;
            font-weight: 600;
            color: #232F3E;
        }
        
        .review-card {
            border: 1px solid #232F3E;
            border-radius: 12px;
            padding: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .stars {
            color: #ffc107;
            font-size: 16px;
        }
        
        .review-text {
            font-size: 14px;
            font-weight: 500;
            line-height: 1.5;
            margin: 0;
        }
      `;

      const styleElement = document.createElement('style');
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);
    }

    createAssistantButton() {
      const button = document.createElement('button');
      button.className = 'sa-assistant-btn';
      button.textContent = 'A';
      button.setAttribute('aria-label', 'Shopping Assistant');
      document.body.appendChild(button);

      this.assistantButton = button;
    }

    createContainers() {
      // Create a wrapper div with reset class
      const wrapper = document.createElement('div');
      wrapper.className = 'sa-reset';
      document.body.appendChild(wrapper);

      // Product Recommendation Container
      const productContainer = document.createElement('div');
      productContainer.className = 'sa-popup sa-product-popup';
      productContainer.innerHTML = `
        <div class="sa-product-header">
          <p>These are the best-suited helmets for your needs. 😍</p>
        </div>
        <div class="sa-product-container">
          <button class="sa-nav-btn sa-nav-btn-left">❮</button>
          <img src="helmet.png" alt="Heltmet" class="sa-product-image">
          <button class="sa-nav-btn sa-nav-btn-right">❯</button>
        </div>
        <div class="sa-product-info">
          <h3 class="sa-product-name">${this.products[0].name}</h3>
          <a href="#" class="sa-product-link">View Product</a>
        </div>
        <div class="testimonial-container">
        <div class="testimonial-header">
            <h2 class="testimonial-title">What others are saying:</h2>
        </div>
        
        <div class="review-card">
            <div class="stars">★★★★★</div>
            <p class="review-text">
                <span>"Great fit, lightweight, and excellent protection..."</span>
            </p>
        </div>
    </div>
        <div class="sa-product-actions">
          <button class="sa-btn sa-btn-primary">Add to Cart</button>
          <button class="sa-btn sa-btn-secondary">Refine My Search</button>
        </div>
      `;
      wrapper.appendChild(productContainer);
      this.productPopup = productContainer;

      // Chat Container
      const chatContainer = document.createElement('div');
      chatContainer.className = 'sa-popup sa-chat-popup';
      chatContainer.innerHTML = `
        <div class="sa-messages-container"></div>
        <div class="sa-chat-input-container">
          <input type="text" class="sa-chat-input" placeholder="Enter">
          <button class="sa-send-btn">➤</button>
        </div>
      `;
      wrapper.appendChild(chatContainer);
      this.chatPopup = chatContainer;
      this.messagesContainer = chatContainer.querySelector('.sa-messages-container');
      this.chatInput = chatContainer.querySelector('.sa-chat-input');

      // Poll Container
      const pollContainer = document.createElement('div');
      pollContainer.className = 'sa-popup sa-poll-popup';
      pollContainer.innerHTML = `
        <div class="sa-poll-container">
          <p class="sa-poll-question">What features are most important in a helmet? 🤔</p>
          <div class="sa-poll-options">
            <button class="sa-poll-option" data-option="Safety Certifications">Safety Certifications</button>
            <button class="sa-poll-option" data-option="MIPS Technology">MIPS Technology</button>
            <button class="sa-poll-option" data-option="Fit and Comfort">Fit and Comfort</button>
            <button class="sa-poll-option" data-option="Design and Style">Design and Style</button>
          </div>
          <button class="sa-btn sa-btn-primary">Ask Me</button>
        </div>
      `;
      wrapper.appendChild(pollContainer);
      this.pollPopup = pollContainer;

      // Info Card Container
      const infoContainer = document.createElement('div');
      infoContainer.className = 'sa-popup sa-info-popup sa-info-card';
      infoContainer.innerHTML = `
        <div class="sa-info-content">
          <p class="sa-info-text">
            Is a helmet with MIPS technology generally considered the top choice for cyclists because of its enhanced safety features, improved impact protection, and ability to provide added confidence during high-speed rides or in risky situations?
          </p>
          <div class="sa-feedback-container">
            <div class="sa-feedback-buttons">
              <button class="sa-feedback-btn" data-feedback="like"><img src="like-icon.png" alt="like" /></button>
              <button class="sa-feedback-btn" data-feedback="dislike"><img src="dislike-icon.png" alt="dislike" /></button>
            </div>
          </div>
        </div>
      `;
      wrapper.appendChild(infoContainer);
      this.infoPopup = infoContainer;

      // Render initial messages
      this.renderMessages();
    }

    addEventListeners() {
      // Assistant button click
      this.assistantButton.addEventListener('click', () => {
        this.toggleAssistant();
      });

      // Chat close button
      this.chatPopup.querySelector('.sa-close-btn').addEventListener('click', () => {
        this.closeAllPopups();
      });

      // Chat send button
      this.chatPopup.querySelector('.sa-send-btn').addEventListener('click', () => {
        this.sendMessage();
      });

      // Chat input enter key
      this.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Product navigation buttons
      this.productPopup.querySelector('.sa-nav-btn-left').addEventListener('click', () => {
        this.navigateProduct('prev');
      });

      this.productPopup.querySelector('.sa-nav-btn-right').addEventListener('click', () => {
        this.navigateProduct('next');
      });

      // Poll options
      const pollOptions = this.pollPopup.querySelectorAll('.sa-poll-option');
      pollOptions.forEach(option => {
        option.addEventListener('click', () => {
          const optionValue = option.dataset.option;
          this.togglePollOption(option, optionValue);
        });
      });

      // Poll submit button
      this.pollPopup.querySelector('.sa-btn-primary').addEventListener('click', () => {
        this.submitPoll();
      });

      // Feedback buttons
      const feedbackButtons = this.infoPopup.querySelectorAll('.sa-feedback-btn');
      feedbackButtons.forEach(button => {
        button.addEventListener('click', () => {
          const feedbackType = button.dataset.feedback;
          this.provideFeedback(button, feedbackType);
        });
      });
    }

    toggleAssistant() {
      if (!this.isOpen) {
        // If closed, open and cycle to next view
        this.isOpen = true;
        this.cycleView();
      } else {
        // If open, close all popups
        this.closeAllPopups();
      }
    }

    cycleView() {
      // Close all popups first
      this.closeAllPopups();

      // Cycle through views
      if (!this.currentView || this.currentView === 'info') {
        this.currentView = 'product';
        this.productPopup.style.display = 'block';
      } else if (this.currentView === 'product') {
        this.currentView = 'chat';
        this.chatPopup.style.display = 'block';
      } else if (this.currentView === 'chat') {
        this.currentView = 'poll';
        this.pollPopup.style.display = 'block';
      } else if (this.currentView === 'poll') {
        this.currentView = 'info';
        this.infoPopup.style.display = 'block';
      }
    }

    closeAllPopups() {
      this.isOpen = false;
      this.productPopup.style.display = 'none';
      this.chatPopup.style.display = 'none';
      this.pollPopup.style.display = 'none';
      this.infoPopup.style.display = 'none';
    }

    renderMessages() {
      // Clear messages container
      this.messagesContainer.innerHTML = '';

      // Add all messages
      this.messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `sa-message sa-message-${message.sender}`;
        messageElement.textContent = message.content;
        this.messagesContainer.appendChild(messageElement);
      });

      // Add thinking indicator if needed
      if (this.isThinking) {
        const thinkingElement = document.createElement('div');
        thinkingElement.className = 'sa-thinking';
        thinkingElement.textContent = 'Thinking...';
        this.messagesContainer.appendChild(thinkingElement);
      }

      // Scroll to bottom
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    sendMessage() {
      const messageText = this.chatInput.value.trim();
      if (!messageText) return;

      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        content: messageText,
        sender: 'user'
      };

      this.messages.push(userMessage);
      this.chatInput.value = '';
      this.isThinking = true;
      this.renderMessages();

      // Simulate assistant response
      setTimeout(() => {
        this.isThinking = false;

        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          content: 'Based on your preferences, I\'d recommend checking out the Giro Register MIPS helmet. It offers excellent protection with MIPS technology while remaining lightweight, and it\'s priced around $65-85 depending on the retailer.',
          sender: 'assistant'
        };

        this.messages.push(assistantMessage);
        this.renderMessages();
      }, 2000);
    }

    navigateProduct(direction) {
      if (direction === 'prev') {
        this.currentProductIndex = this.currentProductIndex === 0 ? this.products.length - 1 : this.currentProductIndex - 1;
      } else {
        this.currentProductIndex = this.currentProductIndex === this.products.length - 1 ? 0 : this.currentProductIndex + 1;
      }

      const product = this.products[this.currentProductIndex];
      this.productPopup.querySelector('.sa-product-image').src = product.image;
      this.productPopup.querySelector('.sa-product-image').alt = product.name;
      this.productPopup.querySelector('.sa-product-name').textContent = product.name;
    }

    togglePollOption(optionElement, optionValue) {
      // Toggle selection in UI
      optionElement.classList.toggle('sa-poll-option-selected');

      // Update selected options array
      if (optionElement.classList.contains('sa-poll-option-selected')) {
        if (!this.selectedPollOptions.includes(optionValue)) {
          this.selectedPollOptions.push(optionValue);
        }
      } else {
        this.selectedPollOptions = this.selectedPollOptions.filter(option => option !== optionValue);
      }
    }

    submitPoll() {
      console.log('Selected poll options:', this.selectedPollOptions);
      // Here you would typically process the poll results
      // For demo purposes, we'll just close the poll and show the next view
      this.cycleView();
    }

    provideFeedback(buttonElement, feedbackType) {
      // Remove selected class from all buttons
      this.infoPopup.querySelectorAll('.sa-feedback-btn').forEach(btn => {
        btn.classList.remove('sa-feedback-btn-selected');
      });

      // Add selected class to clicked button
      buttonElement.classList.add('sa-feedback-btn-selected');

      // Store feedback
      this.feedback = feedbackType;
      console.log('Feedback provided:', feedbackType);

      // Here you would typically send the feedback to your backend
      // For demo purposes, we'll just wait a moment and then show the next view
      setTimeout(() => {
        this.cycleView();
      }, 1000);
    }
  }

  // Initialize the shopping assistant when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    new ShoppingAssistant();
  });
})();