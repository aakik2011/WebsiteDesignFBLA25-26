// ADD YOUR GOOGLE GEMINI API KEY HERE
const GEMINI_API_KEY = 'AIzaSyAQip6Nv16hv29lXI43lqEBP1RTyGwqw-0';

const AI_SETTINGS_KEY = 'mf_ai_settings';
const CHAT_HISTORY_KEY = 'mf_chat_history';

let aiSettings = {
  mode: 'gemini',
  model: 'gemini-2.5-flash',
  personality: 'encouraging'
};

let chatHistory = [];

// Load AI settings
function loadAISettings() {
  const saved = localStorage.getItem(AI_SETTINGS_KEY);
  if (saved) {
    aiSettings = { ...aiSettings, ...JSON.parse(saved) };
  }
  const savedChat = localStorage.getItem(CHAT_HISTORY_KEY);
  if (savedChat) {
    chatHistory = JSON.parse(savedChat);
  }
}

// Save AI settings
function saveAISettings() {
  localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(aiSettings));
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
}

// ========================================
// THEME TOGGLE
// ========================================

function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  const storedTheme = localStorage.getItem('mf_theme') || 'light';

  // Set initial theme
  setTheme(storedTheme);

  // Add click listener
  themeToggle.addEventListener('click', () => {
    const next = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });

  function setTheme(t) {
    body.setAttribute('data-theme', t);
    const themeIcon = document.querySelector('#themeIcon');

    if (t === 'dark') {
      body.classList.add('dark');
      document.documentElement.classList.add('dark');
      themeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />';
      themeIcon.classList.remove('text-gray-700');
      themeIcon.classList.add('text-gray-300');
      themeToggle.setAttribute('aria-pressed', 'true');
    } else {
      body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
      themeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m8.66-10.66h-1M4.34 12.34h-1M18.36 18.36l-.7-.7M6.34 6.34l-.7-.7M18.36 5.64l-.7.7M6.34 17.66l-.7.7M12 8a4 4 0 100 8 4 4 0 000-8z" />';
      themeIcon.classList.remove('text-gray-300');
      themeIcon.classList.add('text-gray-700');
      themeToggle.setAttribute('aria-pressed', 'false');
    }
    localStorage.setItem('mf_theme', t);
  }
}

// ========================================
// MODAL MANAGEMENT
// ========================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('flex');
  modal.classList.add('hidden');
}

// ========================================
// AI SETTINGS MODAL
// ========================================

document.getElementById('aiSettingsBtn').addEventListener('click', () => {
  document.getElementById('aiModel').value = aiSettings.model;
  document.getElementById('aiPersonality').value = aiSettings.personality;
  openModal('aiSettingsModal');
});

const closeAISettings = document.getElementById('closeAISettings');
const cancelAISettings = document.getElementById('cancelAISettings');

if (closeAISettings) closeAISettings.addEventListener('click', () => closeModal('aiSettingsModal'));
if (cancelAISettings) cancelAISettings.addEventListener('click', () => closeModal('aiSettingsModal'));

// Save AI Settings
document.getElementById('aiSettingsForm').addEventListener('submit', (e) => {
  e.preventDefault();

  aiSettings.model = document.getElementById('aiModel').value;
  aiSettings.personality = document.getElementById('aiPersonality').value;
  saveAISettings();
  closeModal('aiSettingsModal');

  // Update mode indicator
  updateModeIndicator();

  // Re-render chat
  renderChatHistory();

  // Show notification
  alert('Settings saved successfully!');
});


// ========================================
// FIRST-TIME SETUP
// ========================================

// Start chat button
document.getElementById('startChatBtn').addEventListener('click', () => {
  localStorage.setItem('mf_ai_configured', 'true');
  closeModal('aiWelcomeModal');
  saveAISettings();
  updateModeIndicator();
  renderChatHistory();
});

// ========================================
// CLEAR CHAT
// ========================================

function clearChat() {
  if (confirm('Clear all chat history?')) {
    chatHistory = [];
    saveAISettings();
    renderChatHistory();
    // Show example prompts again
    const examplePrompts = document.getElementById('examplePrompts');
    if (examplePrompts) {
      examplePrompts.style.display = 'flex';
    }
  }
}

document.getElementById('clearChatBtn').addEventListener('click', clearChat);
document.getElementById('clearChatBtnMobile').addEventListener('click', clearChat);

// Mobile settings button
document.getElementById('aiSettingsBtnMobile').addEventListener('click', () => {
  document.getElementById('aiModel').value = aiSettings.model;
  document.getElementById('aiPersonality').value = aiSettings.personality;
  openModal('aiSettingsModal');
});

// ========================================
// CHAT FUNCTIONALITY
// ========================================

// Render chat history
function renderChatHistory() {
  const container = document.getElementById('chatMessages');
  container.innerHTML = '';

  // Show/hide example prompts based on chat history
  const examplePrompts = document.getElementById('examplePrompts');
  if (examplePrompts) {
    examplePrompts.style.display = chatHistory.length > 0 ? 'none' : 'flex';
  }

  // Add welcome message
  const welcomeDiv = document.createElement('div');
  welcomeDiv.className = 'flex items-start gap-3';

  welcomeDiv.innerHTML = `
    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-lg flex-shrink-0">🤖</div>
    <div class="flex-1 bg-gray-100  rounded-lg p-4 max-w-[85%]">
      <p class="text-sm">
        <strong>Hello! I'm your Google Gemini AI tutor (${aiSettings.model}).</strong><br><br>
        I can help you with math problems, explain concepts, provide step-by-step solutions, and answer your questions. What would you like to learn today?
      </p>
    </div>
  `;

  container.appendChild(welcomeDiv);

  // Add chat history
  chatHistory.forEach(msg => {
    addMessageToUI(msg.role, msg.content, false);
  });

  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

// Add message to UI
function addMessageToUI(role, content, save = true) {
  const container = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');

  if (role === 'user') {
    messageDiv.className = 'flex items-start gap-3 justify-end';
    messageDiv.innerHTML = `
      <div class="flex-1 bg-primary text-white rounded-lg p-4 max-w-[85%] ml-auto">
        <p class="text-sm whitespace-pre-wrap">${escapeHtml(content)}</p>
      </div>
      <div class="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">U</div>
    `;
  } else {
    messageDiv.className = 'flex items-start gap-3';
    messageDiv.innerHTML = `
      <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-lg flex-shrink-0">🤖</div>
      <div class="flex-1 bg-gray-100 rounded-lg p-4 max-w-[85%]">
        <p class="text-sm whitespace-pre-wrap">${escapeHtml(content)}</p>
      </div>
    `;
  }

  container.appendChild(messageDiv);
  container.scrollTop = container.scrollHeight;

  if (save) {
    chatHistory.push({ role, content });
    saveAISettings();
  }
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Example prompt handlers
document.querySelectorAll('.example-prompt').forEach(btn => {
  btn.addEventListener('click', () => {
    const prompt = btn.textContent;
    document.getElementById('chatInput').value = prompt;
    document.getElementById('chatForm').dispatchEvent(new Event('submit'));
  });
});

// Chat input keyboard shortcuts
document.getElementById('chatInput').addEventListener('keydown', (e) => {
  // Enter = submit
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    document.getElementById('chatForm').dispatchEvent(new Event('submit'));
  }
});

// Handle chat form submission
document.getElementById('chatForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const input = document.getElementById('chatInput');
  const message = input.value.trim();

  if (!message) return;

  // Hide example prompts after first message
  const examplePrompts = document.getElementById('examplePrompts');
  if (examplePrompts) {
    examplePrompts.style.display = 'none';
  }

  // Add user message
  addMessageToUI('user', message);
  input.value = '';

  // Show typing indicator
  const sendBtn = document.getElementById('sendBtn');
  sendBtn.disabled = true;
  sendBtn.innerHTML = '<span>Thinking...</span>';

  try {
    const response = await getGeminiResponse(message);
    addMessageToUI('assistant', response);
  } catch (error) {
    console.error('Gemini API Error:', error);
    addMessageToUI('assistant', `⚠️ I'm having trouble responding right now. Error: ${error.message}. Please try again in a moment.`);
  } finally {
    sendBtn.disabled = false;
    sendBtn.innerHTML = `
      <span>Send</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    `;
  }
});

// Get Gemini response
async function getGeminiResponse(message) {
  const systemPrompts = {
    encouraging: "You are an encouraging and supportive math tutor. Help students learn by breaking down problems, providing encouragement, and celebrating their progress. Be friendly and make math feel approachable. IMPORTANT: Do not use asterisks (*) for emphasis or any markdown formatting. Use plain text only.",
    concise: "You are a concise and direct math tutor. Provide clear, brief explanations and solutions without unnecessary details. IMPORTANT: Do not use asterisks (*) for emphasis or any markdown formatting. Use plain text only.",
    detailed: "You are a thorough math tutor. Provide detailed explanations with multiple examples, step-by-step solutions, and comprehensive coverage of topics. IMPORTANT: Do not use asterisks (*) for emphasis or any markdown formatting. Use plain text only.",
    socratic: "You are a Socratic tutor. Guide students to discover answers themselves by asking thoughtful questions rather than providing direct answers. Use the Socratic method to help them think critically. IMPORTANT: Do not use asterisks (*) for emphasis or any markdown formatting. Use plain text only."
  };

  const systemPrompt = systemPrompts[aiSettings.personality] || systemPrompts.encouraging;

  // Build conversation history for context
  let conversationText = systemPrompt + "\n\n";

  // Add recent chat history (last 10 messages for context)
  const recentHistory = chatHistory.slice(-10);
  recentHistory.forEach(msg => {
    if (msg.role === 'user') {
      conversationText += `Student: ${msg.content}\n\n`;
    } else {
      conversationText += `Tutor: ${msg.content}\n\n`;
    }
  });

  conversationText += `Student: ${message}\n\nTutor:`;

  // Debug log
  console.log('Sending request to Gemini API:', {
    model: aiSettings.model,
    hasApiKey: !!GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE',
    conversationLength: conversationText.length
  });

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${aiSettings.model}:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: conversationText
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000
      }
    })
  });

  if (!response.ok) {
    // Try to get detailed error message from response
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error && errorData.error.message) {
        errorMessage += ` - ${errorData.error.message}`;
      }
    } catch (e) {
      // If we can't parse the error, just use the status
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();

  // Validate response structure
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid API response format');
  }

  return data.candidates[0].content.parts[0].text;
}


// ========================================
// MODE INDICATOR
// ========================================

function updateModeIndicator() {
  const indicator = document.getElementById('aiModeIndicator');
  indicator.textContent = `Google Gemini (${aiSettings.model})`;
  indicator.className = 'px-4 py-2 bg-white/20 backdrop-blur-sm rounded-btn text-sm font-medium text-white';
}

// ========================================
// INITIALIZATION
// ========================================

document.getElementById('year').textContent = new Date().getFullYear();

// Initialize theme toggle
initTheme();

loadAISettings();
updateModeIndicator();

// Check if this is first time
const hasConfigured = localStorage.getItem('mf_ai_configured');
if (!hasConfigured) {
  openModal('aiWelcomeModal');
} else {
  renderChatHistory();
}
