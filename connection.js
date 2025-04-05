// connection.js
// This script automates the process of sending connection requests on LinkedIn.


const DELAY_BETWEEN_REQUESTS = 5000; // 5 seconds between requests
const SCROLL_INTERVAL = 15000;       // 15 seconds between scrolls
const MAX_SCROLL_ATTEMPTS = 5;       // Maximum number of scroll attempts

// Set to track processed cards
const processedCards = new Set();
let scrollAttempts = 0;

// Function to find all connection cards
function findConnectionCards() {
  return document.querySelectorAll('li.grid.grid__col--lg-8.block.org-people-profile-card__profile-card-spacing');
}

// Process cards one at a time
function processCards(index = 0) {
  // Get the current set of cards
  const connectionCards = findConnectionCards();
  console.log(`Found ${connectionCards.length} connection cards`);
  
  // If we've processed all visible cards, try scrolling for more
  if (index >= connectionCards.length) {
    if (scrollAttempts < MAX_SCROLL_ATTEMPTS) {
      console.log(`Processed all visible cards. Scrolling for more... (Attempt ${scrollAttempts + 1}/${MAX_SCROLL_ATTEMPTS})`);
      window.scrollTo(0, document.body.scrollHeight);
      scrollAttempts++;
      
      // Wait for new cards to load after scrolling
      setTimeout(() => {
        const newConnectionCards = findConnectionCards();
        // If we found new cards, process them
        if (newConnectionCards.length > connectionCards.length) {
          console.log(`Found ${newConnectionCards.length - connectionCards.length} new connection cards after scrolling`);
          scrollAttempts = 0; // Reset scroll attempts since we found new cards
          processCards(connectionCards.length); // Start processing from the new cards
        } else {
          // Try scrolling again if no new cards were found
          processCards(index);
        }
      }, SCROLL_INTERVAL);
      return;
    } else {
      console.log("Maximum scroll attempts reached. Finished processing all available cards.");
      return;
    }
  }
  
  const card = connectionCards[index];
  
  // Skip if already processed
  if (processedCards.has(card)) {
    console.log(`Card ${index + 1} already processed, skipping`);
    setTimeout(() => processCards(index + 1), 1000);
    return;
  }
  
  // Find connect button in current card
  const connectButton = [...card.querySelectorAll('button')].find(el => 
    el.textContent.trim() === 'Connect' || 
    el.querySelector('.artdeco-button__text')?.textContent.trim() === 'Connect'
  );

  const name = card.querySelector('span.org-people-profile-card__profile-title')?.textContent || 
               card.querySelector('.org-people-profile-card__profile-title')?.textContent || 
               'connection';
  
  if (connectButton) {
    console.log(`Processing card ${index + 1}: Clicking connect button for ${name}`);
    
    // Click the connect button
    connectButton.click();
    
    // Wait for the modal to appear
    setTimeout(() => {
      // Check if there's a "Send" or "Send now" button in the modal
      const sendButton = document.querySelector('button.artdeco-button--primary');
      
      if (sendButton) {
        console.log(`Sending connection request to ${name}`);
        sendButton.click();
        
        // Wait for any confirmation dialog
        setTimeout(() => {
          // Check for and close any confirmation dialog
          const closeButton = document.querySelector('button.artdeco-modal__dismiss');
          if (closeButton) {
            closeButton.click();
          }
          
          // Mark as processed
          processedCards.add(card);
          
          // Process next card after a delay
          setTimeout(() => processCards(index + 1), DELAY_BETWEEN_REQUESTS);
        }, 1500);
      } else {
        console.log(`Could not find send button for ${name}`);
        // Process next card if send button not found
        processedCards.add(card);
        setTimeout(() => processCards(index + 1), DELAY_BETWEEN_REQUESTS);
      }
    }, 2000);
  } else {
    console.log(`No connect button in card ${index + 1}, moving to next`);
    // No connect button found, move to next card
    setTimeout(() => processCards(index + 1), 1000);
  }
}

// Start processing cards
console.log("Starting to process connection cards...");
processCards();
