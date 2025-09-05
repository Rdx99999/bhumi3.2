import TelegramBot from 'node-telegram-bot-api';

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const MAX_MESSAGE_LENGTH = 4096; // Telegram's message length limit
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

let bot: TelegramBot | null = null;
let lastNotificationTime = 0;
const MIN_NOTIFICATION_INTERVAL = 2000; // Prevent spam (2 seconds between notifications)

// Initialize Telegram Bot
function initializeTelegramBot() {
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN.trim() === '' || TELEGRAM_BOT_TOKEN === 'your_telegram_bot_token_here') {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN not configured. Telegram notifications disabled.');
    return null;
  }

  if (!TELEGRAM_CHAT_ID || TELEGRAM_CHAT_ID.trim() === '' || TELEGRAM_CHAT_ID === 'your_telegram_chat_id_here') {
    console.warn('⚠️ TELEGRAM_CHAT_ID not configured. Telegram notifications disabled.');
    return null;
  }

  try {
    bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { 
      polling: false
    });
    console.log('✅ Telegram bot initialized successfully');
    return bot;
  } catch (error) {
    console.error('❌ Failed to initialize Telegram bot:', error);
    return null;
  }
}

// Helper function to sanitize and truncate text
function sanitizeText(text: string | undefined | null): string {
  if (!text) return 'N/A';
  // Remove any potentially harmful characters and normalize
  return String(text).trim().replace(/[\x00-\x1F\x7F]/g, '').substring(0, 500);
}

// Helper function to truncate message if too long
function truncateMessage(message: string): string {
  if (message.length <= MAX_MESSAGE_LENGTH) {
    return message;
  }
  
  const truncated = message.substring(0, MAX_MESSAGE_LENGTH - 100);
  return truncated + '\n\n... [Message truncated due to length limit]';
}

// Helper function to validate contact data
function validateContactData(contactData: any): boolean {
  if (!contactData || typeof contactData !== 'object') {
    return false;
  }
  
  // At minimum, we need name and either email or subject
  const hasName = contactData.name && String(contactData.name).trim().length > 0;
  const hasEmail = contactData.email && String(contactData.email).trim().length > 0;
  const hasSubject = contactData.subject && String(contactData.subject).trim().length > 0;
  
  return hasName && (hasEmail || hasSubject);
}

// Retry function with exponential backoff
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on authentication errors or invalid chat ID
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as any).response;
        if (response?.statusCode === 401 || response?.statusCode === 403) {
          throw error; // Don't retry auth failures
        }
      }
      
      if (i < maxRetries - 1) {
        console.log(`⏳ Telegram API attempt ${i + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
  
  throw lastError!;
}

// Send notification when someone contacts you
export async function sendContactNotification(contactData: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  // Rate limiting check
  const now = Date.now();
  if (now - lastNotificationTime < MIN_NOTIFICATION_INTERVAL) {
    console.log('⏳ Rate limiting: Skipping notification (too frequent)');
    return { success: false, reason: 'rate_limited' };
  }

  // Validate input data
  if (!validateContactData(contactData)) {
    console.error('❌ Invalid contact data provided to notification system');
    logContactToConsole(contactData, 'Invalid data provided');
    return { success: false, reason: 'invalid_data' };
  }

  // Initialize bot if needed
  if (!bot && !initializeTelegramBot()) {
    console.log('⚠️ Telegram bot not available. Logging contact to console instead.');
    logContactToConsole(contactData, 'Telegram bot not configured');
    return { success: false, reason: 'bot_not_configured' };
  }

  if (!TELEGRAM_CHAT_ID) {
    console.warn('⚠️ TELEGRAM_CHAT_ID not found. Logging contact to console instead.');
    logContactToConsole(contactData, 'Chat ID not configured');
    return { success: false, reason: 'chat_id_not_configured' };
  }

  try {
    // Sanitize all input data
    const sanitizedData = {
      name: sanitizeText(contactData.name),
      email: sanitizeText(contactData.email),
      phone: contactData.phone ? sanitizeText(contactData.phone) : undefined,
      subject: sanitizeText(contactData.subject),
      message: sanitizeText(contactData.message)
    };

    // Create notification message
    let notificationMessage = `
🔔 NEW CONTACT FORM SUBMISSION!

👤 Name: ${sanitizedData.name}
📧 Email: ${sanitizedData.email}
${sanitizedData.phone ? `📱 Phone: ${sanitizedData.phone}` : ''}
📋 Subject: ${sanitizedData.subject}

💬 Message:
${sanitizedData.message}

⏰ Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

🔗 Check your admin panel: https://bhumiconsultancy.in/admin
    `.trim();

    // Truncate if too long
    notificationMessage = truncateMessage(notificationMessage);

    // Send with retry logic
    await retryWithBackoff(async () => {
      await bot!.sendMessage(TELEGRAM_CHAT_ID!, notificationMessage, {
        disable_web_page_preview: true,
        parse_mode: undefined // Use plain text to avoid parsing issues
      });
    });

    lastNotificationTime = now;
    console.log(`✅ Telegram notification sent successfully to ${sanitizedData.name} (${sanitizedData.email})`);
    return { success: true };

  } catch (error: any) {
    // Comprehensive error handling
    const errorMessage = error?.message || 'Unknown error';
    const errorCode = error?.response?.statusCode || error?.code;
    
    console.error(`❌ Failed to send Telegram notification: ${errorMessage} (Code: ${errorCode})`);
    
    // Log the contact details to console as fallback
    logContactToConsole(contactData, `Telegram failed: ${errorMessage}`);
    
    // Specific error handling
    if (errorCode === 401) {
      console.error('🔐 Authentication failed: Invalid bot token');
    } else if (errorCode === 403) {
      console.error('🚫 Forbidden: Bot may be blocked or chat ID invalid');
    } else if (errorCode === 429) {
      console.error('⏱️ Rate limited by Telegram API');
    } else if (errorCode === 400) {
      console.error('📝 Bad request: Message format issue');
    } else if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
      console.error('🌐 Network error: Cannot reach Telegram servers');
    }
    
    return { success: false, reason: 'telegram_api_error', error: errorMessage };
  }
}

// Fallback: Log contact details to console when Telegram fails
function logContactToConsole(contactData: any, reason: string) {
  console.log('\n' + '='.repeat(60));
  console.log('📋 CONTACT FORM SUBMISSION (Console Fallback)');
  console.log('='.repeat(60));
  console.log(`Reason: ${reason}`);
  console.log(`Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  console.log(`Name: ${contactData?.name || 'N/A'}`);
  console.log(`Email: ${contactData?.email || 'N/A'}`);
  console.log(`Phone: ${contactData?.phone || 'N/A'}`);
  console.log(`Subject: ${contactData?.subject || 'N/A'}`);
  console.log(`Message: ${contactData?.message || 'N/A'}`);
  console.log('='.repeat(60));
  console.log('🔗 Check admin panel: https://bhumiconsultancy.in/admin');
  console.log('='.repeat(60) + '\n');
}

// Test function to verify bot is working
export async function testTelegramBot() {
  if (!bot && !initializeTelegramBot()) {
    return { success: false, error: 'Bot not initialized - check TELEGRAM_BOT_TOKEN' };
  }

  if (!TELEGRAM_CHAT_ID) {
    return { success: false, error: 'Chat ID not configured - check TELEGRAM_CHAT_ID' };
  }

  try {
    // Test with retry logic
    await retryWithBackoff(async () => {
      await bot!.sendMessage(TELEGRAM_CHAT_ID!, 
        '🤖 TEST MESSAGE\n\nYour Telegram notification bot is working perfectly! You will now receive instant alerts when someone contacts you through your website.\n\n✅ All systems operational',
        { disable_web_page_preview: true }
      );
    });
    
    return { 
      success: true, 
      message: 'Test message sent successfully',
      botToken: TELEGRAM_BOT_TOKEN ? '✅ Configured' : '❌ Missing',
      chatId: TELEGRAM_CHAT_ID ? '✅ Configured' : '❌ Missing'
    };
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    const errorCode = error?.response?.statusCode || error?.code;
    
    let specificError = errorMessage;
    if (errorCode === 401) {
      specificError = 'Invalid bot token - check your TELEGRAM_BOT_TOKEN';
    } else if (errorCode === 403) {
      specificError = 'Bot blocked or invalid chat ID - check your TELEGRAM_CHAT_ID';
    } else if (errorCode === 400) {
      specificError = 'Bad request - check your bot configuration';
    }
    
    return { 
      success: false, 
      error: specificError,
      botToken: TELEGRAM_BOT_TOKEN ? '✅ Configured' : '❌ Missing',
      chatId: TELEGRAM_CHAT_ID ? '✅ Configured' : '❌ Missing',
      errorCode
    };
  }
}

// Health check function
export function getTelegramBotStatus() {
  return {
    botInitialized: bot !== null,
    tokenConfigured: !!(TELEGRAM_BOT_TOKEN && TELEGRAM_BOT_TOKEN !== 'your_telegram_bot_token_here'),
    chatIdConfigured: !!(TELEGRAM_CHAT_ID && TELEGRAM_CHAT_ID !== 'your_telegram_chat_id_here'),
    lastNotificationTime: lastNotificationTime ? new Date(lastNotificationTime).toISOString() : null
  };
}

// Initialize bot on module load
initializeTelegramBot();