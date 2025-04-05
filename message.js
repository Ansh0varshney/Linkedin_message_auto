// message.js
// This script automates sending messages to LinkedIn connections.

const connectionCards = document.querySelectorAll('li.mn-connection-card.artdeco-list');
console.log(`Found ${connectionCards.length} connection cards`);

// Set to track flagged buttons
const flaggedButtons = new Set();

// Configuration for timing (all values in milliseconds)
const config = {
  timeBetweenCards: 5000,        // 5 seconds between processing cards
  timeAfterButtonClick: 3000,     // 3 seconds for message window to open
  timeAfterSend: 2000,           // 2 seconds after sending message
  timeBetweenBatches: 60000,     // 1 minute pause after every 5 messages
  maxMessagesPerBatch: 5         // Maximum messages to send before taking a longer pause
};

let messagesSent = 0;

// Process cards one at a time
function processCards(index = 0) {
  if (index >= connectionCards.length) {
    console.log("✅ Finished processing all cards");
    return;
  }
  
  // Check if we need to take a longer pause
  if (messagesSent > 0 && messagesSent % config.maxMessagesPerBatch === 0) {
    console.log(`⏱ Taking a longer pause after sending ${messagesSent} messages to avoid spam detection...`);
    setTimeout(() => processCards(index), config.timeBetweenBatches);
    return;
  }
  
  const card = connectionCards[index];
  
  // Find message button in current card
  const messageButton = [...card.querySelectorAll('button')].find(el => 
    el.textContent.trim() === 'Message' || 
    el.querySelector('.artdeco-button__text')?.textContent.trim() === 'Message'
  );

  const name = card.querySelector('span.mn-connection-card__name')?.textContent.trim() || "there";
  console.log(`Processing connection: ${name} (${index + 1}/${connectionCards.length})`);
  
  if (messageButton) {
    console.log(`📨 Found message button for ${name}`);
    
    // Click the message button
    messageButton.click();
    
    // Wait for UI to update then check content and close
    setTimeout(() => {
      // Check if already flagged
      if (!flaggedButtons.has(messageButton)) {
        // Check if message content exists
        const messageContent = document.querySelector('div.msg-s-event__content');
        
        if (messageContent) {
          console.log(`⚠ You have already messaged ${name}`);
        } else {
          // Function to set text in contenteditable div and send message
          function setMessageAndSend(text) {
          
            // Find the contenteditable message box
            const messageBox = document.querySelector('div.msg-form__contenteditable[role="textbox"][aria-label="Write a message…"]');
            
            if (!messageBox) {
              console.log("❌ Message box not found");
              return false;
            }
            
            // Focus on the message box
            messageBox.focus();
            
            // Set the content using backticks for proper template literal
            messageBox.innerHTML = `<p>${text}</p>`;
            
            // Dispatch input event to trigger LinkedIn's message form validation
            messageBox.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Add a small random delay before sending (more human-like)
            const typingDelay = 1000 + Math.random() * 2000; // 1-3 seconds
            
            setTimeout(() => {
              // Find and click the send button
              const sendButton = document.querySelector('button.msg-form__send-button');
              
              if (sendButton && !sendButton.disabled) {
                console.log(`✉ Sending message to ${name}`);
                sendButton.click();
                if(messagesSent === 2) {
                  return false;
                }
                messagesSent++;
              
                return true;
              } else {
                console.log("❌ Send button not found or disabled");
                return false;
              }
            }, typingDelay);
          }

          // Add personalization to make messages less spammy
          // Replace with your own message text
          const messageText = `Hi ${name},

          My Name is (your name goes here ). (your introduction, previous intern exp goes here )

          I'm currently exploring internship opportunity at your company I would love to connect and learn more. Please let me know if we could discuss this further. I would love to chat!

          Link to CV:  (goes here) `;
          setMessageAndSend(messageText);
        }
        
        // Mark as flagged
        flaggedButtons.add(messageButton);
      }
      
      // Find and click close button after a delay
      setTimeout(() => {
        const closeButton = document.querySelector('button.msg-overlay-bubble-header__control.artdeco-button--circle');
        if (closeButton) {
          closeButton.click();
          console.log(`🔒 Closed message window for ${name}`);
        } else {
          console.log("❌ Close button not found");
        }
        
        // Process next card after a delay
        console.log(`⏱ Waiting before processing next connection...`);
        setTimeout(() => processCards(index + 1), config.timeBetweenCards);
      }, config.timeAfterSend);
      
    }, config.timeAfterButtonClick);
  } else {
    console.log(`No message button for ${name}, moving to next`);
    // No message button found, move to next card
    setTimeout(() => processCards(index + 1), 1000);
  }
}

console.log("🚀 Starting LinkedIn message automation");
console.log("⚠ IMPORTANT: Keep this tab open and visible while the script runs");
console.log("⚠ You may need to occasionally interact with the page to avoid detection");

// Start processing cards with a small initial delay
setTimeout(() => processCards(), 2000);
