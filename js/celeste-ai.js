/**
 * Celeste AI - Intelligent Assistant for Ascendance Hub
 * Voice & Text powered by Claude AI
 * Handles all module actions through natural language
 */

// Celeste AI Configuration
const CELESTE_CONFIG = {
    name: 'Celeste',
    version: '1.0',
    apiEndpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 1024,
    // API Key - Can be set in abundance-config.js or via Project Analytics > API Settings
    get apiKey() {
        return window.ANTHROPIC_API_KEY || localStorage.getItem('anthropic_api_key') || '';
    }
};

// Celeste state
let celesteIsOpen = false;
let celesteIsListening = false;
let celesteConversation = [];
let celesteRecognition = null;

// Available actions Celeste can perform
const CELESTE_ACTIONS = {
    // Expenses / Cash Out
    expense: {
        keywords: ['gasto', 'expense', 'gastar', 'compré', 'pagué', 'cash out', 'pagar'],
        module: 'cashout',
        action: 'addExpense',
        description: 'Registrar un gasto'
    },
    // Thieves / Suspicious person
    thief: {
        keywords: ['sospechoso', 'thief', 'ladrón', 'robó', 'suspicious', 'robo', 'stealing', 'ratero'],
        module: 'thieves',
        action: 'reportThief',
        description: 'Reportar persona sospechosa'
    },
    // Announcements
    announcement: {
        keywords: ['anuncio', 'announcement', 'avisar', 'comunicar', 'notify', 'aviso'],
        module: 'announcements',
        action: 'createAnnouncement',
        description: 'Crear un anuncio'
    },
    // Change records
    change: {
        keywords: ['cambio', 'change', 'feria', 'monedas', 'coins', 'billetes'],
        module: 'change',
        action: 'recordChange',
        description: 'Registrar cambio'
    },
    // Restock
    restock: {
        keywords: ['restock', 'pedir', 'ordenar', 'falta', 'necesito', 'order', 'supply'],
        module: 'restock',
        action: 'createRestock',
        description: 'Crear solicitud de restock'
    },
    // Issues
    issue: {
        keywords: ['problema', 'issue', 'queja', 'complaint', 'cliente molesto', 'reclamo'],
        module: 'issues',
        action: 'reportIssue',
        description: 'Reportar un problema'
    },
    // Gifts
    gift: {
        keywords: ['regalo', 'gift', 'regalé', 'gave away', 'cortesía', 'gratis'],
        module: 'gifts',
        action: 'recordGift',
        description: 'Registrar un regalo'
    },
    // Risk notes
    risk: {
        keywords: ['riesgo', 'risk', 'peligro', 'danger', 'alerta', 'alert', 'cuidado'],
        module: 'risknotes',
        action: 'createRiskNote',
        description: 'Crear nota de riesgo'
    },
    // Clock in/out
    clock: {
        keywords: ['entrada', 'salida', 'clock in', 'clock out', 'llegué', 'me voy', 'checar'],
        module: 'clockin',
        action: 'toggleClock',
        description: 'Registrar entrada/salida'
    },
    // Navigate
    navigate: {
        keywords: ['ir a', 'abrir', 'mostrar', 'go to', 'open', 'show', 'ver'],
        module: null,
        action: 'navigate',
        description: 'Navegar a un módulo'
    },
    // Labels
    label: {
        keywords: ['etiqueta', 'label', 'barcode', 'código de barras', 'imprimir etiqueta'],
        module: 'labels',
        action: 'createLabel',
        description: 'Crear etiquetas'
    },
    // Supplies
    supplies: {
        keywords: ['supplies', 'suministros', 'material', 'necesitamos', 'comprar para tienda'],
        module: 'supplies',
        action: 'addSupply',
        description: 'Agregar suministro'
    }
};

// Module name mappings for navigation
const MODULE_NAMES = {
    'dashboard': ['dashboard', 'inicio', 'home', 'principal'],
    'employees': ['empleados', 'employees', 'staff', 'personal'],
    'clockin': ['clock', 'entrada', 'salida', 'checar', 'reloj'],
    'analytics': ['ventas', 'sales', 'analytics', 'estadísticas', 'reportes'],
    'cashout': ['gastos', 'expenses', 'cash out', 'egresos'],
    'thieves': ['ladrones', 'thieves', 'sospechosos', 'robos'],
    'announcements': ['anuncios', 'announcements', 'avisos'],
    'change': ['cambio', 'change', 'feria'],
    'restock': ['restock', 'pedidos', 'inventario'],
    'issues': ['problemas', 'issues', 'quejas'],
    'gifts': ['regalos', 'gifts', 'cortesías'],
    'risknotes': ['riesgos', 'risk', 'alertas'],
    'labels': ['etiquetas', 'labels', 'códigos'],
    'supplies': ['suministros', 'supplies', 'materiales'],
    'treasury': ['treasury', 'heady', 'piezas', 'arte'],
    'vendors': ['proveedores', 'vendors', 'suppliers'],
    'invoices': ['facturas', 'invoices', 'pagos'],
    'training': ['training', 'capacitación', 'entrenamiento'],
    'licenses': ['licencias', 'licenses', 'documentos'],
    'schedule': ['horario', 'schedule', 'calendario'],
    'gconomics': ['gconomics', 'finanzas', 'dinero personal'],
    'passwords': ['contraseñas', 'passwords', 'claves'],
    'gforce': ['gforce', 'motivación', 'frases']
};

/**
 * Initialize Celeste AI
 */
function initializeCelesteAI() {
    // Create floating button
    createCelesteFloatingButton();

    // Create chat modal
    createCelesteChatModal();

    // Initialize speech recognition if available
    initializeSpeechRecognition();

    console.log('🌟 Celeste AI initialized');
}

/**
 * Create floating button for Celeste
 */
function createCelesteFloatingButton() {
    // Remove if exists
    const existing = document.getElementById('celeste-floating-btn');
    if (existing) existing.remove();

    const button = document.createElement('div');
    button.id = 'celeste-floating-btn';
    button.innerHTML = `
        <div class="celeste-btn-inner">
            <div class="celeste-btn-glow"></div>
            <div class="celeste-btn-icon">
                <img src="img/celeste-ai.svg" alt="Celeste AI" class="celeste-avatar-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <i class="fas fa-stars" style="display: none;"></i>
            </div>
            <div class="celeste-btn-pulse"></div>
        </div>
        <div class="celeste-btn-label">Celeste AI</div>
    `;
    button.onclick = toggleCelesteChat;

    document.body.appendChild(button);

    // Add styles
    addCelesteStyles();
}

/**
 * Add Celeste AI styles
 */
function addCelesteStyles() {
    if (document.getElementById('celeste-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'celeste-styles';
    styles.textContent = `
        /* Floating Button */
        #celeste-floating-btn {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9998;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            transition: transform 0.3s ease;
        }

        #celeste-floating-btn:hover {
            transform: scale(1.1);
        }

        .celeste-btn-inner {
            position: relative;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.5);
        }

        .celeste-btn-glow {
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
            opacity: 0.5;
            filter: blur(10px);
            animation: celesteGlow 2s ease-in-out infinite;
        }

        .celeste-btn-icon {
            position: relative;
            z-index: 2;
            color: white;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .celeste-btn-icon .celeste-avatar-img {
            width: 54px;
            height: 54px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid rgba(255,255,255,0.3);
        }

        .celeste-btn-pulse {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.5);
            animation: celestePulse 2s ease-out infinite;
        }

        .celeste-btn-label {
            font-size: 11px;
            font-weight: 600;
            color: var(--text-primary);
            background: var(--bg-secondary);
            padding: 4px 10px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            white-space: nowrap;
        }

        @keyframes celesteGlow {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.1); }
        }

        @keyframes celestePulse {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.8); opacity: 0; }
        }

        /* Chat Modal */
        #celeste-chat-modal {
            position: fixed;
            bottom: 100px;
            right: 24px;
            width: 400px;
            max-width: calc(100vw - 48px);
            max-height: 600px;
            background: var(--bg-primary);
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 9999;
            display: none;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid var(--border-color);
            animation: celesteSlideUp 0.3s ease;
        }

        #celeste-chat-modal.open {
            display: flex;
        }

        @keyframes celesteSlideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .celeste-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .celeste-avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: white;
            overflow: hidden;
        }

        .celeste-avatar .celeste-header-avatar-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
        }

        .celeste-info {
            flex: 1;
        }

        .celeste-name {
            color: white;
            font-weight: 600;
            font-size: 16px;
        }

        .celeste-status {
            color: rgba(255,255,255,0.8);
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .celeste-status-dot {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            animation: statusPulse 2s ease infinite;
        }

        @keyframes statusPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .celeste-close {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }

        .celeste-close:hover {
            background: rgba(255,255,255,0.3);
        }

        .celeste-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            min-height: 300px;
            max-height: 400px;
        }

        .celeste-message {
            max-width: 85%;
            padding: 12px 16px;
            border-radius: 16px;
            font-size: 14px;
            line-height: 1.5;
            animation: messageIn 0.3s ease;
        }

        @keyframes messageIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .celeste-message.assistant {
            background: var(--bg-secondary);
            color: var(--text-primary);
            align-self: flex-start;
            border-bottom-left-radius: 4px;
        }

        .celeste-message.user {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
        }

        .celeste-message.system {
            background: rgba(16, 185, 129, 0.1);
            color: #10b981;
            align-self: center;
            font-size: 12px;
            padding: 8px 16px;
            border-radius: 20px;
        }

        .celeste-message.error {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            align-self: center;
            font-size: 12px;
        }

        .celeste-typing {
            display: flex;
            gap: 4px;
            padding: 12px 16px;
            background: var(--bg-secondary);
            border-radius: 16px;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
        }

        .celeste-typing span {
            width: 8px;
            height: 8px;
            background: var(--text-muted);
            border-radius: 50%;
            animation: typingDot 1.4s ease-in-out infinite;
        }

        .celeste-typing span:nth-child(2) { animation-delay: 0.2s; }
        .celeste-typing span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typingDot {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-8px); }
        }

        .celeste-input-area {
            padding: 16px;
            border-top: 1px solid var(--border-color);
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .celeste-input {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid var(--border-color);
            border-radius: 24px;
            background: var(--bg-secondary);
            color: var(--text-primary);
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        }

        .celeste-input:focus {
            border-color: #667eea;
        }

        .celeste-input::placeholder {
            color: var(--text-muted);
        }

        .celeste-voice-btn {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: none;
            background: var(--bg-secondary);
            color: var(--text-primary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .celeste-voice-btn:hover {
            background: var(--bg-tertiary);
        }

        .celeste-voice-btn.listening {
            background: linear-gradient(135deg, #ef4444, #f97316);
            color: white;
            animation: voicePulse 1s ease infinite;
        }

        @keyframes voicePulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
            50% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
        }

        .celeste-send-btn {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .celeste-send-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        /* Quick Actions */
        .celeste-quick-actions {
            padding: 12px 16px;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            border-top: 1px solid var(--border-color);
        }

        .celeste-quick-btn {
            padding: 6px 12px;
            border-radius: 16px;
            border: 1px solid var(--border-color);
            background: var(--bg-secondary);
            color: var(--text-secondary);
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
        }

        .celeste-quick-btn:hover {
            background: var(--bg-tertiary);
            border-color: #667eea;
            color: #667eea;
        }

        /* Mobile responsive */
        @media (max-width: 480px) {
            #celeste-chat-modal {
                bottom: 0;
                right: 0;
                left: 0;
                width: 100%;
                max-width: 100%;
                max-height: 80vh;
                border-radius: 20px 20px 0 0;
            }

            #celeste-floating-btn {
                bottom: 16px;
                right: 16px;
            }

            .celeste-btn-inner {
                width: 50px;
                height: 50px;
            }

            .celeste-btn-icon {
                font-size: 20px;
            }

            .celeste-btn-label {
                display: none;
            }
        }
    `;

    document.head.appendChild(styles);
}

/**
 * Create chat modal
 */
function createCelesteChatModal() {
    // Remove if exists
    const existing = document.getElementById('celeste-chat-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'celeste-chat-modal';
    modal.innerHTML = `
        <div class="celeste-header">
            <div class="celeste-avatar">
                <img src="img/celeste-ai.svg" alt="Celeste AI" class="celeste-header-avatar-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <i class="fas fa-stars" style="display: none;"></i>
            </div>
            <div class="celeste-info">
                <div class="celeste-name">Celeste AI</div>
                <div class="celeste-status">
                    <span class="celeste-status-dot"></span>
                    Always ready to help
                </div>
            </div>
            <button class="celeste-close" onclick="toggleCelesteChat()">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <div class="celeste-messages" id="celeste-messages">
            <div class="celeste-message assistant">
                Hi! I'm Celeste, your Ascendance Hub assistant. 🌟<br><br>
                I can help you:<br>
                • Record expenses<br>
                • Report suspicious people<br>
                • Create announcements<br>
                • Navigate to any module<br>
                • And much more!<br><br>
                How can I help you today?
            </div>
        </div>

        <div class="celeste-quick-actions">
            <button class="celeste-quick-btn" onclick="celesteQuickAction('Record an expense')">
                <i class="fas fa-money-bill"></i> Expense
            </button>
            <button class="celeste-quick-btn" onclick="celesteQuickAction('Report suspicious person')">
                <i class="fas fa-user-secret"></i> Suspicious
            </button>
            <button class="celeste-quick-btn" onclick="celesteQuickAction('Create announcement')">
                <i class="fas fa-bullhorn"></i> Announce
            </button>
            <button class="celeste-quick-btn" onclick="celesteQuickAction('Show sales')">
                <i class="fas fa-chart-line"></i> Sales
            </button>
        </div>

        <div class="celeste-input-area">
            <button class="celeste-voice-btn" id="celeste-voice-btn" onclick="toggleCelesteVoice()" title="Speak">
                <i class="fas fa-microphone"></i>
            </button>
            <input type="text" class="celeste-input" id="celeste-input"
                placeholder="Type or speak to Celeste..."
                onkeypress="if(event.key==='Enter') sendCelesteMessage()">
            <button class="celeste-send-btn" onclick="sendCelesteMessage()" title="Send">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    `;

    document.body.appendChild(modal);
}

/**
 * Toggle chat modal
 */
function toggleCelesteChat() {
    const modal = document.getElementById('celeste-chat-modal');
    celesteIsOpen = !celesteIsOpen;

    if (celesteIsOpen) {
        modal.classList.add('open');
        document.getElementById('celeste-input')?.focus();
    } else {
        modal.classList.remove('open');
        // Stop listening if was active
        if (celesteIsListening) {
            toggleCelesteVoice();
        }
    }
}

/**
 * Initialize speech recognition
 */
function initializeSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.warn('Speech recognition not supported');
        return;
    }

    celesteRecognition = new SpeechRecognition();
    celesteRecognition.continuous = false;
    celesteRecognition.interimResults = true;
    celesteRecognition.lang = 'en-US'; // English US

    celesteRecognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');

        document.getElementById('celeste-input').value = transcript;

        // If final result, send message
        if (event.results[event.results.length - 1].isFinal) {
            setTimeout(() => sendCelesteMessage(), 500);
        }
    };

    celesteRecognition.onend = () => {
        celesteIsListening = false;
        updateVoiceButton();
    };

    celesteRecognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        celesteIsListening = false;
        updateVoiceButton();

        if (event.error === 'not-allowed') {
            addCelesteMessage('Please allow microphone access to use voice recognition.', 'error');
        }
    };
}

/**
 * Toggle voice recognition
 */
function toggleCelesteVoice() {
    if (!celesteRecognition) {
        addCelesteMessage('Voice recognition is not available in this browser.', 'error');
        return;
    }

    if (celesteIsListening) {
        celesteRecognition.stop();
        celesteIsListening = false;
    } else {
        celesteRecognition.start();
        celesteIsListening = true;
        addCelesteMessage('🎤 Listening... Speak now', 'system');
    }

    updateVoiceButton();
}

/**
 * Update voice button state
 */
function updateVoiceButton() {
    const btn = document.getElementById('celeste-voice-btn');
    if (!btn) return;

    if (celesteIsListening) {
        btn.classList.add('listening');
        btn.innerHTML = '<i class="fas fa-stop"></i>';
    } else {
        btn.classList.remove('listening');
        btn.innerHTML = '<i class="fas fa-microphone"></i>';
    }
}

/**
 * Send message to Celeste
 */
async function sendCelesteMessage() {
    const input = document.getElementById('celeste-input');
    const message = input.value.trim();

    if (!message) return;

    // Clear input
    input.value = '';

    // Add user message to chat
    addCelesteMessage(message, 'user');

    // Show typing indicator
    showCelesteTyping();

    try {
        // Process the message
        const response = await processCelesteMessage(message);

        // Hide typing
        hideCelesteTyping();

        // Add response
        addCelesteMessage(response.message, 'assistant');

        // Execute action if detected
        if (response.action) {
            await executeCelesteAction(response.action, response.data);
        }

    } catch (error) {
        hideCelesteTyping();
        addCelesteMessage('Sorry, there was an error. Please try again.', 'error');
        console.error('Celeste error:', error);
    }
}

/**
 * Process message with Claude AI
 */
async function processCelesteMessage(userMessage) {
    // First, try to detect intent locally
    const localIntent = detectLocalIntent(userMessage);

    if (localIntent) {
        return localIntent;
    }

    // If no API key, use local processing only
    if (!CELESTE_CONFIG.apiKey) {
        return {
            message: 'I understand you want to do something, but I need the Claude API key to give you smarter responses. For now, try being more specific with commands like "record expense $50" or "go to sales".',
            action: null
        };
    }

    // Call Claude API
    try {
        const systemPrompt = buildCelesteSystemPrompt();

        const response = await fetch(CELESTE_CONFIG.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CELESTE_CONFIG.apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: CELESTE_CONFIG.model,
                max_tokens: CELESTE_CONFIG.maxTokens,
                system: systemPrompt,
                messages: [
                    ...celesteConversation.slice(-6), // Keep last 6 messages for context
                    { role: 'user', content: userMessage }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const assistantMessage = data.content[0].text;

        // Add to conversation history
        celesteConversation.push({ role: 'user', content: userMessage });
        celesteConversation.push({ role: 'assistant', content: assistantMessage });

        // Parse response for actions
        return parseClaudeResponse(assistantMessage);

    } catch (error) {
        console.error('Claude API error:', error);
        // Fallback to local processing
        return {
            message: "I couldn't connect to my cloud brain, but I can still help you. What do you need to do?",
            action: null
        };
    }
}

/**
 * Build system prompt for Claude
 */
function buildCelesteSystemPrompt() {
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : { name: 'User' };
    const currentStore = localStorage.getItem('selectedStore') || 'the store';

    return `You are Celeste, a friendly and efficient virtual assistant for Ascendance Hub, a management system for vape/smoke shops called VSU (Vape Smoke Universe).

CONTEXT INFORMATION:
- Current user: ${currentUser.name || 'User'}
- Store: ${currentStore}
- System: Ascendance Hub

YOUR PERSONALITY:
- You are friendly, professional and efficient
- You use casual but professional English
- You can use emojis occasionally
- You give concise and direct answers

ACTIONS YOU CAN PERFORM:
When you detect that the user wants to perform an action, include at the end of your response a JSON with the format:
[ACTION:{"type":"action_type","data":{...}}]

Available action types:
1. "navigate" - Navigate to a module: {"type":"navigate","data":{"module":"module_name"}}
2. "expense" - Record expense: {"type":"expense","data":{"amount":0,"description":"","store":""}}
3. "thief" - Report suspicious person: {"type":"thief","data":{"description":""}}
4. "announcement" - Create announcement: {"type":"announcement","data":{"title":"","content":""}}
5. "change" - Record change: {"type":"change","data":{"amount":0,"type":"in/out"}}
6. "gift" - Record gift: {"type":"gift","data":{"description":"","value":0}}
7. "risk" - Risk note: {"type":"risk","data":{"description":"","level":"low/medium/high"}}
8. "restock" - Request restock: {"type":"restock","data":{"product":"","quantity":0}}
9. "issue" - Report issue: {"type":"issue","data":{"description":""}}

AVAILABLE MODULES FOR NAVIGATION:
dashboard, employees, clockin, analytics, cashout, thieves, announcements, change, restock, issues, gifts, risknotes, labels, supplies, treasury, vendors, invoices, training, licenses, schedule, gconomics, passwords, gforce, abundancecloud

If the user doesn't specify all the information needed for an action, ask for it politely.
If you're not sure what the user wants, ask to clarify.`;
}

/**
 * Detect intent locally without API
 */
function detectLocalIntent(message) {
    const lowerMessage = message.toLowerCase();

    // Check for navigation intent
    for (const [module, aliases] of Object.entries(MODULE_NAMES)) {
        for (const alias of aliases) {
            if (lowerMessage.includes(alias) &&
                (lowerMessage.includes('ir ') || lowerMessage.includes('abrir') ||
                 lowerMessage.includes('ver') || lowerMessage.includes('mostrar') ||
                 lowerMessage.includes('go to') || lowerMessage.includes('open') ||
                 lowerMessage.includes('show') || lowerMessage.includes('take me'))) {
                return {
                    message: `Sure! Taking you to ${module}... 🚀`,
                    action: { type: 'navigate', data: { module } }
                };
            }
        }
    }

    // Check for action intents
    for (const [actionKey, actionConfig] of Object.entries(CELESTE_ACTIONS)) {
        for (const keyword of actionConfig.keywords) {
            if (lowerMessage.includes(keyword)) {
                // Extract amount if present
                const amountMatch = lowerMessage.match(/\$?(\d+(?:\.\d{2})?)/);
                const amount = amountMatch ? parseFloat(amountMatch[1]) : null;

                if (actionConfig.module) {
                    return {
                        message: `Got it! Taking you to the right module... ✨`,
                        action: {
                            type: 'navigate',
                            data: {
                                module: actionConfig.module,
                                prefill: amount ? { amount } : null
                            }
                        }
                    };
                }
            }
        }
    }

    return null;
}

/**
 * Parse Claude response for actions
 */
function parseClaudeResponse(response) {
    // Look for action JSON in response
    const actionMatch = response.match(/\[ACTION:(\{.*?\})\]/);

    let action = null;
    let message = response;

    if (actionMatch) {
        try {
            action = JSON.parse(actionMatch[1]);
            // Remove action JSON from message
            message = response.replace(actionMatch[0], '').trim();
        } catch (e) {
            console.error('Error parsing action:', e);
        }
    }

    return { message, action };
}

/**
 * Execute detected action
 */
async function executeCelesteAction(action, data) {
    switch (action.type) {
        case 'navigate':
            if (data?.module && typeof navigateTo === 'function') {
                setTimeout(() => {
                    navigateTo(data.module);
                    toggleCelesteChat(); // Close chat after navigation
                }, 500);
            }
            break;

        case 'expense':
            navigateTo('cashout');
            // Could prefill form here if needed
            break;

        case 'thief':
            navigateTo('thieves');
            // Open report modal
            if (typeof openThiefReportModal === 'function') {
                setTimeout(() => openThiefReportModal(), 500);
            }
            break;

        case 'announcement':
            navigateTo('announcements');
            break;

        // Add more action handlers as needed
        default:
            console.log('Unknown action:', action.type);
    }
}

/**
 * Add message to chat
 */
function addCelesteMessage(text, type = 'assistant') {
    const container = document.getElementById('celeste-messages');
    if (!container) return;

    const message = document.createElement('div');
    message.className = `celeste-message ${type}`;
    message.innerHTML = text;

    container.appendChild(message);
    container.scrollTop = container.scrollHeight;
}

/**
 * Show typing indicator
 */
function showCelesteTyping() {
    const container = document.getElementById('celeste-messages');
    if (!container) return;

    // Remove existing typing indicator
    hideCelesteTyping();

    const typing = document.createElement('div');
    typing.className = 'celeste-typing';
    typing.id = 'celeste-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';

    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
}

/**
 * Hide typing indicator
 */
function hideCelesteTyping() {
    const typing = document.getElementById('celeste-typing');
    if (typing) typing.remove();
}

/**
 * Quick action button handler
 */
function celesteQuickAction(action) {
    const input = document.getElementById('celeste-input');
    if (input) {
        input.value = action;
        sendCelesteMessage();
    }
}

/**
 * Text-to-Speech for Celeste responses
 */
function celesteSpeak(text) {
    if (!('speechSynthesis' in window)) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    utterance.rate = 1;
    utterance.pitch = 1.1;

    // Try to find a female Spanish voice
    const voices = speechSynthesis.getVoices();
    const spanishVoice = voices.find(v => v.lang.includes('es') && v.name.includes('female')) ||
                         voices.find(v => v.lang.includes('es'));

    if (spanishVoice) {
        utterance.voice = spanishVoice;
    }

    speechSynthesis.speak(utterance);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCelesteAI);
} else {
    initializeCelesteAI();
}

// Export functions for global access
window.toggleCelesteChat = toggleCelesteChat;
window.toggleCelesteVoice = toggleCelesteVoice;
window.sendCelesteMessage = sendCelesteMessage;
window.celesteQuickAction = celesteQuickAction;

// ============================================
// CELESTE AI FULL PAGE MODULE
// ============================================

// Conversation history storage
let celestePageConversations = [];
let celesteCurrentConversationId = null;

/**
 * Render the full Celeste AI page
 */
window.renderCelesteAIPage = function() {
    const dashboard = document.querySelector('.dashboard');

    // Load conversations from Firebase/localStorage
    loadCelesteConversations();

    dashboard.innerHTML = `
        <div class="celeste-page">
            <!-- Page Header -->
            <div class="celeste-page-header">
                <div class="celeste-page-hero">
                    <div class="celeste-hero-avatar">
                        <img src="img/celeste-ai.svg" alt="Celeste AI" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="celeste-hero-fallback" style="display: none;">
                            <i class="fas fa-stars"></i>
                        </div>
                        <div class="celeste-hero-status"></div>
                    </div>
                    <div class="celeste-hero-info">
                        <h1>Celeste AI</h1>
                        <p>Your intelligent assistant for Ascendance Hub</p>
                        <div class="celeste-hero-badges">
                            <span class="celeste-badge"><i class="fas fa-microphone"></i> Voice Enabled</span>
                            <span class="celeste-badge"><i class="fas fa-brain"></i> Claude Powered</span>
                            <span class="celeste-badge"><i class="fas fa-bolt"></i> Real-time Actions</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content Grid -->
            <div class="celeste-page-grid">
                <!-- Left Sidebar - Conversations -->
                <div class="celeste-sidebar">
                    <div class="celeste-sidebar-header">
                        <h3><i class="fas fa-comments"></i> Conversations</h3>
                        <button class="celeste-new-chat-btn" onclick="startNewCelesteConversation()">
                            <i class="fas fa-plus"></i> New
                        </button>
                    </div>
                    <div class="celeste-conversations-list" id="celeste-conversations-list">
                        <!-- Conversations loaded here -->
                    </div>
                </div>

                <!-- Center - Main Chat -->
                <div class="celeste-main-chat">
                    <div class="celeste-chat-container">
                        <div class="celeste-chat-messages" id="celeste-page-messages">
                            <div class="celeste-welcome-message">
                                <img src="img/celeste-ai.svg" alt="Celeste" class="celeste-welcome-avatar" onerror="this.style.display='none'; var d=document.createElement('div'); d.className='celeste-welcome-avatar-fallback'; d.innerHTML='<i class=fa fa-stars></i>'; this.parentNode.insertBefore(d,this);">
                                <h2>Hello! I'm Celeste</h2>
                                <p>Your AI-powered assistant for managing VSU stores. I can help you navigate, record data, generate reports, and much more.</p>
                                <div class="celeste-welcome-suggestions">
                                    <button onclick="celestePageQuickAction('Show me today\\'s sales')">
                                        <i class="fas fa-chart-line"></i> Today's Sales
                                    </button>
                                    <button onclick="celestePageQuickAction('Record an expense')">
                                        <i class="fas fa-receipt"></i> Record Expense
                                    </button>
                                    <button onclick="celestePageQuickAction('Report a suspicious person')">
                                        <i class="fas fa-user-secret"></i> Report Suspicious
                                    </button>
                                    <button onclick="celestePageQuickAction('Create an announcement')">
                                        <i class="fas fa-bullhorn"></i> New Announcement
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="celeste-chat-input-container">
                            <div class="celeste-chat-input-wrapper">
                                <button class="celeste-voice-toggle" id="celeste-page-voice-btn" onclick="toggleCelestePageVoice()">
                                    <i class="fas fa-microphone"></i>
                                </button>
                                <input type="text"
                                    id="celeste-page-input"
                                    class="celeste-chat-input"
                                    placeholder="Ask Celeste anything..."
                                    onkeypress="if(event.key==='Enter') sendCelestePageMessage()">
                                <button class="celeste-send-toggle" onclick="sendCelestePageMessage()">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                            <p class="celeste-input-hint">Press Enter to send or click the microphone to speak</p>
                        </div>
                    </div>
                </div>

                <!-- Right Sidebar - Quick Actions & Info -->
                <div class="celeste-info-panel">
                    <!-- Quick Actions -->
                    <div class="celeste-panel-section">
                        <h4><i class="fas fa-bolt"></i> Quick Actions</h4>
                        <div class="celeste-quick-grid">
                            <button onclick="celestePageQuickAction('Go to dashboard')" class="celeste-quick-tile">
                                <i class="fas fa-th-large"></i>
                                <span>Dashboard</span>
                            </button>
                            <button onclick="celestePageQuickAction('Show analytics')" class="celeste-quick-tile">
                                <i class="fas fa-chart-bar"></i>
                                <span>Analytics</span>
                            </button>
                            <button onclick="celestePageQuickAction('Clock in')" class="celeste-quick-tile">
                                <i class="fas fa-clock"></i>
                                <span>Clock In</span>
                            </button>
                            <button onclick="celestePageQuickAction('Record expense')" class="celeste-quick-tile">
                                <i class="fas fa-money-bill"></i>
                                <span>Expense</span>
                            </button>
                            <button onclick="celestePageQuickAction('Report thief')" class="celeste-quick-tile">
                                <i class="fas fa-user-secret"></i>
                                <span>Suspicious</span>
                            </button>
                            <button onclick="celestePageQuickAction('New announcement')" class="celeste-quick-tile">
                                <i class="fas fa-bullhorn"></i>
                                <span>Announce</span>
                            </button>
                        </div>
                    </div>

                    <!-- Available Commands -->
                    <div class="celeste-panel-section">
                        <h4><i class="fas fa-terminal"></i> Available Commands</h4>
                        <div class="celeste-commands-list">
                            <div class="celeste-command-item">
                                <span class="celeste-command-name">Navigation</span>
                                <span class="celeste-command-example">"Go to [module]", "Open sales"</span>
                            </div>
                            <div class="celeste-command-item">
                                <span class="celeste-command-name">Expenses</span>
                                <span class="celeste-command-example">"Record expense $50"</span>
                            </div>
                            <div class="celeste-command-item">
                                <span class="celeste-command-name">Security</span>
                                <span class="celeste-command-example">"Report suspicious person"</span>
                            </div>
                            <div class="celeste-command-item">
                                <span class="celeste-command-name">Announcements</span>
                                <span class="celeste-command-example">"Create announcement"</span>
                            </div>
                            <div class="celeste-command-item">
                                <span class="celeste-command-name">Inventory</span>
                                <span class="celeste-command-example">"Request restock"</span>
                            </div>
                            <div class="celeste-command-item">
                                <span class="celeste-command-name">Issues</span>
                                <span class="celeste-command-example">"Report an issue"</span>
                            </div>
                        </div>
                    </div>

                    <!-- Connection Status -->
                    <div class="celeste-panel-section celeste-status-section">
                        <div class="celeste-connection-status" id="celeste-connection-status">
                            <i class="fas fa-circle"></i>
                            <span>Checking connection...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <style>
            .celeste-page {
                padding: 0;
                max-width: 100%;
            }

            /* Header */
            .celeste-page-header {
                background: linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%);
                border: 1px solid rgba(102,126,234,0.2);
                border-radius: 20px;
                padding: 32px;
                margin-bottom: 24px;
            }

            .celeste-page-hero {
                display: flex;
                align-items: center;
                gap: 24px;
            }

            .celeste-hero-avatar {
                position: relative;
                width: 100px;
                height: 100px;
                border-radius: 50%;
                overflow: hidden;
                border: 3px solid rgba(168, 85, 247, 0.5);
                box-shadow: 0 0 30px rgba(168, 85, 247, 0.3);
            }

            .celeste-hero-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .celeste-hero-fallback {
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea, #764ba2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 40px;
                color: white;
            }

            .celeste-hero-status {
                position: absolute;
                bottom: 5px;
                right: 5px;
                width: 20px;
                height: 20px;
                background: #10b981;
                border-radius: 50%;
                border: 3px solid var(--bg-primary);
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
            }

            .celeste-hero-info h1 {
                font-size: 32px;
                font-weight: 700;
                margin: 0 0 8px;
                background: linear-gradient(135deg, #667eea, #a855f7);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .celeste-hero-info p {
                color: var(--text-secondary);
                margin: 0 0 16px;
                font-size: 16px;
            }

            .celeste-hero-badges {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }

            .celeste-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 14px;
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
                color: var(--text-secondary);
            }

            .celeste-badge i {
                color: #a855f7;
            }

            /* Main Grid */
            .celeste-page-grid {
                display: grid;
                grid-template-columns: 280px 1fr 300px;
                gap: 24px;
                min-height: calc(100vh - 350px);
            }

            /* Left Sidebar */
            .celeste-sidebar {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 16px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .celeste-sidebar-header {
                padding: 16px;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .celeste-sidebar-header h3 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .celeste-new-chat-btn {
                padding: 6px 12px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border: none;
                border-radius: 8px;
                color: white;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
            }

            .celeste-new-chat-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }

            .celeste-conversations-list {
                flex: 1;
                overflow-y: auto;
                padding: 12px;
            }

            .celeste-conversation-item {
                padding: 12px;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s;
                margin-bottom: 8px;
                border: 1px solid transparent;
            }

            .celeste-conversation-item:hover {
                background: var(--bg-primary);
                border-color: var(--border-color);
            }

            .celeste-conversation-item.active {
                background: rgba(168, 85, 247, 0.1);
                border-color: rgba(168, 85, 247, 0.3);
            }

            .celeste-conversation-title {
                font-weight: 500;
                font-size: 13px;
                margin-bottom: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .celeste-conversation-date {
                font-size: 11px;
                color: var(--text-muted);
            }

            /* Main Chat */
            .celeste-main-chat {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 16px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .celeste-chat-container {
                display: flex;
                flex-direction: column;
                height: 100%;
            }

            .celeste-chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 24px;
            }

            .celeste-welcome-message {
                text-align: center;
                padding: 40px 20px;
            }

            .celeste-welcome-avatar {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                margin-bottom: 20px;
                border: 3px solid rgba(168, 85, 247, 0.3);
            }

            .celeste-welcome-avatar-fallback {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea, #764ba2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                color: white;
                margin: 0 auto 20px;
            }

            .celeste-welcome-message h2 {
                margin: 0 0 12px;
                font-size: 24px;
                background: linear-gradient(135deg, #667eea, #a855f7);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .celeste-welcome-message p {
                color: var(--text-secondary);
                max-width: 500px;
                margin: 0 auto 24px;
                line-height: 1.6;
            }

            .celeste-welcome-suggestions {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: center;
            }

            .celeste-welcome-suggestions button {
                padding: 10px 16px;
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: 10px;
                color: var(--text-primary);
                font-size: 13px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
            }

            .celeste-welcome-suggestions button:hover {
                border-color: #a855f7;
                background: rgba(168, 85, 247, 0.1);
            }

            .celeste-welcome-suggestions button i {
                color: #a855f7;
            }

            /* Chat Messages */
            .celeste-page-msg {
                display: flex;
                gap: 12px;
                margin-bottom: 20px;
                animation: fadeInUp 0.3s ease;
            }

            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .celeste-page-msg.user {
                flex-direction: row-reverse;
            }

            .celeste-page-msg-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                flex-shrink: 0;
                overflow: hidden;
            }

            .celeste-page-msg-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .celeste-page-msg-avatar-fallback {
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea, #764ba2);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 14px;
            }

            .celeste-page-msg.user .celeste-page-msg-avatar-fallback {
                background: var(--accent-primary);
            }

            .celeste-page-msg-content {
                max-width: 70%;
                padding: 12px 16px;
                border-radius: 16px;
                font-size: 14px;
                line-height: 1.5;
            }

            .celeste-page-msg.assistant .celeste-page-msg-content {
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: 16px 16px 16px 4px;
            }

            .celeste-page-msg.user .celeste-page-msg-content {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border-radius: 16px 16px 4px 16px;
            }

            .celeste-page-msg.system .celeste-page-msg-content {
                background: rgba(168, 85, 247, 0.1);
                border: 1px solid rgba(168, 85, 247, 0.2);
                color: var(--text-secondary);
                font-style: italic;
            }

            /* Chat Input */
            .celeste-chat-input-container {
                padding: 16px 24px 24px;
                border-top: 1px solid var(--border-color);
            }

            .celeste-chat-input-wrapper {
                display: flex;
                align-items: center;
                gap: 12px;
                background: var(--bg-primary);
                border: 2px solid var(--border-color);
                border-radius: 16px;
                padding: 8px 12px;
                transition: all 0.2s;
            }

            .celeste-chat-input-wrapper:focus-within {
                border-color: #a855f7;
                box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
            }

            .celeste-chat-input {
                flex: 1;
                border: none;
                background: none;
                font-size: 15px;
                color: var(--text-primary);
                outline: none;
            }

            .celeste-chat-input::placeholder {
                color: var(--text-muted);
            }

            .celeste-voice-toggle,
            .celeste-send-toggle {
                width: 40px;
                height: 40px;
                border-radius: 12px;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .celeste-voice-toggle {
                background: var(--bg-secondary);
                color: var(--text-secondary);
            }

            .celeste-voice-toggle:hover {
                background: rgba(168, 85, 247, 0.1);
                color: #a855f7;
            }

            .celeste-voice-toggle.listening {
                background: #ef4444;
                color: white;
                animation: pulse 1s infinite;
            }

            .celeste-send-toggle {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
            }

            .celeste-send-toggle:hover {
                transform: scale(1.05);
            }

            .celeste-input-hint {
                text-align: center;
                font-size: 11px;
                color: var(--text-muted);
                margin: 10px 0 0;
            }

            /* Right Panel */
            .celeste-info-panel {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .celeste-panel-section {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 16px;
                padding: 16px;
            }

            .celeste-panel-section h4 {
                margin: 0 0 14px;
                font-size: 13px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                color: var(--text-primary);
            }

            .celeste-panel-section h4 i {
                color: #a855f7;
            }

            /* Quick Actions Grid */
            .celeste-quick-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }

            .celeste-quick-tile {
                padding: 14px 10px;
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
            }

            .celeste-quick-tile:hover {
                border-color: #a855f7;
                background: rgba(168, 85, 247, 0.05);
                transform: translateY(-2px);
            }

            .celeste-quick-tile i {
                font-size: 18px;
                color: #a855f7;
            }

            .celeste-quick-tile span {
                font-size: 11px;
                font-weight: 500;
                color: var(--text-secondary);
            }

            /* Commands List */
            .celeste-commands-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .celeste-command-item {
                padding: 10px 12px;
                background: var(--bg-primary);
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .celeste-command-name {
                font-size: 12px;
                font-weight: 600;
                color: var(--text-primary);
            }

            .celeste-command-example {
                font-size: 11px;
                color: var(--text-muted);
                font-style: italic;
            }

            /* Connection Status */
            .celeste-status-section {
                margin-top: auto;
            }

            .celeste-connection-status {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                color: var(--text-muted);
            }

            .celeste-connection-status i {
                font-size: 8px;
            }

            .celeste-connection-status.connected i {
                color: #10b981;
            }

            .celeste-connection-status.disconnected i {
                color: #ef4444;
            }

            /* Typing Indicator */
            .celeste-typing {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 8px 16px;
            }

            .celeste-typing-dot {
                width: 8px;
                height: 8px;
                background: #a855f7;
                border-radius: 50%;
                animation: typingBounce 1.4s infinite ease-in-out;
            }

            .celeste-typing-dot:nth-child(1) { animation-delay: 0s; }
            .celeste-typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .celeste-typing-dot:nth-child(3) { animation-delay: 0.4s; }

            @keyframes typingBounce {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-8px); }
            }

            /* Responsive */
            @media (max-width: 1200px) {
                .celeste-page-grid {
                    grid-template-columns: 1fr;
                }

                .celeste-sidebar,
                .celeste-info-panel {
                    display: none;
                }

                .celeste-main-chat {
                    min-height: 500px;
                }
            }

            @media (max-width: 768px) {
                .celeste-page-header {
                    padding: 20px;
                }

                .celeste-page-hero {
                    flex-direction: column;
                    text-align: center;
                }

                .celeste-hero-info h1 {
                    font-size: 24px;
                }

                .celeste-hero-badges {
                    justify-content: center;
                }
            }
        </style>
    `;

    // Initialize the page
    renderCelesteConversationsList();
    checkCelesteConnection();
}

/**
 * Load conversations from storage
 */
function loadCelesteConversations() {
    try {
        const saved = localStorage.getItem('celeste_conversations');
        if (saved) {
            celestePageConversations = JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Failed to load Celeste conversations:', e);
        celestePageConversations = [];
    }
}

/**
 * Save conversations to storage
 */
function saveCelesteConversations() {
    try {
        localStorage.setItem('celeste_conversations', JSON.stringify(celestePageConversations));
        // Also save to Firebase if available
        saveCelesteConversationsToFirebase();
    } catch (e) {
        console.warn('Failed to save Celeste conversations:', e);
    }
}

/**
 * Save conversations to Firebase
 */
async function saveCelesteConversationsToFirebase() {
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
            if (user && user.email) {
                const db = firebase.firestore();
                await db.collection('celeste_conversations').doc(user.email).set({
                    conversations: celestePageConversations,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        }
    } catch (e) {
        console.warn('Failed to save to Firebase:', e);
    }
}

/**
 * Render conversations list
 */
function renderCelesteConversationsList() {
    const container = document.getElementById('celeste-conversations-list');
    if (!container) return;

    if (celestePageConversations.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                <i class="fas fa-comments" style="font-size: 24px; margin-bottom: 10px; opacity: 0.3;"></i>
                <p style="font-size: 12px; margin: 0;">No conversations yet</p>
            </div>
        `;
        return;
    }

    container.innerHTML = celestePageConversations.map((conv, index) => `
        <div class="celeste-conversation-item ${conv.id === celesteCurrentConversationId ? 'active' : ''}"
             onclick="loadCelesteConversation('${conv.id}')">
            <div class="celeste-conversation-title">${conv.title || 'New Conversation'}</div>
            <div class="celeste-conversation-date">${formatConversationDate(conv.createdAt)}</div>
        </div>
    `).join('');
}

/**
 * Format conversation date
 */
function formatConversationDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' min ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago';
    return date.toLocaleDateString();
}

/**
 * Start new conversation
 */
window.startNewCelesteConversation = function() {
    const newConv = {
        id: 'conv_' + Date.now(),
        title: 'New Conversation',
        messages: [],
        createdAt: new Date().toISOString()
    };

    celestePageConversations.unshift(newConv);
    celesteCurrentConversationId = newConv.id;

    saveCelesteConversations();
    renderCelesteConversationsList();

    // Clear chat messages and show welcome
    const messagesContainer = document.getElementById('celeste-page-messages');
    if (messagesContainer) {
        messagesContainer.innerHTML = `
            <div class="celeste-welcome-message">
                <img src="img/celeste-ai.svg" alt="Celeste" class="celeste-welcome-avatar" onerror="this.style.display='none';">
                <h2>New Conversation</h2>
                <p>How can I help you today?</p>
            </div>
        `;
    }
}

/**
 * Load a conversation
 */
window.loadCelesteConversation = function(convId) {
    celesteCurrentConversationId = convId;
    const conv = celestePageConversations.find(c => c.id === convId);

    if (!conv) return;

    renderCelesteConversationsList();

    const messagesContainer = document.getElementById('celeste-page-messages');
    if (!messagesContainer) return;

    if (conv.messages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="celeste-welcome-message">
                <img src="img/celeste-ai.svg" alt="Celeste" class="celeste-welcome-avatar">
                <h2>Continue Conversation</h2>
                <p>What would you like to discuss?</p>
            </div>
        `;
        return;
    }

    messagesContainer.innerHTML = conv.messages.map(msg => {
        const avatarHtml = msg.role === 'assistant'
            ? '<img src="img/celeste-ai.svg" alt="Celeste" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';"><div class="celeste-page-msg-avatar-fallback" style="display:none;"><i class="fas fa-stars"></i></div>'
            : '<div class="celeste-page-msg-avatar-fallback"><i class="fas fa-user"></i></div>';
        return `
            <div class="celeste-page-msg ${msg.role}">
                <div class="celeste-page-msg-avatar">${avatarHtml}</div>
                <div class="celeste-page-msg-content">${msg.content}</div>
            </div>
        `;
    }).join('');

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Send message from page
 */
window.sendCelestePageMessage = async function() {
    const input = document.getElementById('celeste-page-input');
    const messagesContainer = document.getElementById('celeste-page-messages');

    if (!input || !input.value.trim()) return;

    const userMessage = input.value.trim();
    input.value = '';

    // Ensure we have a conversation
    if (!celesteCurrentConversationId) {
        startNewCelesteConversation();
    }

    // Find current conversation
    let conv = celestePageConversations.find(c => c.id === celesteCurrentConversationId);
    if (!conv) {
        startNewCelesteConversation();
        conv = celestePageConversations[0];
    }

    // Clear welcome message if present
    const welcomeMsg = messagesContainer.querySelector('.celeste-welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }

    // Add user message to UI
    messagesContainer.innerHTML += `
        <div class="celeste-page-msg user">
            <div class="celeste-page-msg-avatar">
                <div class="celeste-page-msg-avatar-fallback"><i class="fas fa-user"></i></div>
            </div>
            <div class="celeste-page-msg-content">${escapeHtml(userMessage)}</div>
        </div>
    `;

    // Save user message
    conv.messages.push({ role: 'user', content: userMessage });

    // Update title if first message
    if (conv.messages.length === 1) {
        conv.title = userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : '');
        renderCelesteConversationsList();
    }

    // Show typing indicator
    messagesContainer.innerHTML += `
        <div class="celeste-page-msg assistant" id="celeste-typing-indicator">
            <div class="celeste-page-msg-avatar">
                <img src="img/celeste-ai.svg" alt="Celeste" onerror="this.style.display='none';">
            </div>
            <div class="celeste-typing">
                <div class="celeste-typing-dot"></div>
                <div class="celeste-typing-dot"></div>
                <div class="celeste-typing-dot"></div>
            </div>
        </div>
    `;

    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Process message
    try {
        const response = await processCelesteMessage(userMessage);

        // Remove typing indicator
        const typingIndicator = document.getElementById('celeste-typing-indicator');
        if (typingIndicator) typingIndicator.remove();

        // Add assistant response
        messagesContainer.innerHTML += `
            <div class="celeste-page-msg assistant">
                <div class="celeste-page-msg-avatar">
                    <img src="img/celeste-ai.svg" alt="Celeste" onerror="this.style.display='none';">
                </div>
                <div class="celeste-page-msg-content">${response.message}</div>
            </div>
        `;

        // Save assistant message
        conv.messages.push({ role: 'assistant', content: response.message });
        saveCelesteConversations();

        // Execute action if any
        if (response.action) {
            await executeCelesteAction(response.action, response.data);
        }

    } catch (error) {
        console.error('Celeste error:', error);

        // Remove typing indicator
        const typingIndicator = document.getElementById('celeste-typing-indicator');
        if (typingIndicator) typingIndicator.remove();

        messagesContainer.innerHTML += `
            <div class="celeste-page-msg assistant">
                <div class="celeste-page-msg-avatar">
                    <img src="img/celeste-ai.svg" alt="Celeste">
                </div>
                <div class="celeste-page-msg-content">Sorry, I encountered an error. Please try again.</div>
            </div>
        `;
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Quick action from page
 */
window.celestePageQuickAction = function(action) {
    const input = document.getElementById('celeste-page-input');
    if (input) {
        input.value = action;
        sendCelestePageMessage();
    }
}

/**
 * Toggle voice on page
 */
window.toggleCelestePageVoice = function() {
    const btn = document.getElementById('celeste-page-voice-btn');

    if (!celesteRecognition) {
        initializeSpeechRecognition();
    }

    if (!celesteRecognition) {
        alert('Voice recognition is not available in this browser.');
        return;
    }

    if (celesteIsListening) {
        celesteRecognition.stop();
        celesteIsListening = false;
        if (btn) btn.classList.remove('listening');
    } else {
        // Override the onresult to use page input
        celesteRecognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');

            const input = document.getElementById('celeste-page-input');
            if (input) input.value = transcript;

            if (event.results[0].isFinal) {
                celesteIsListening = false;
                if (btn) btn.classList.remove('listening');
                sendCelestePageMessage();
            }
        };

        celesteRecognition.start();
        celesteIsListening = true;
        if (btn) btn.classList.add('listening');
    }
}

/**
 * Check API connection
 */
function checkCelesteConnection() {
    const statusEl = document.getElementById('celeste-connection-status');
    if (!statusEl) return;

    const apiKey = CELESTE_CONFIG.apiKey;

    if (apiKey) {
        statusEl.className = 'celeste-connection-status connected';
        statusEl.innerHTML = '<i class="fas fa-circle"></i> <span>Connected to Claude AI</span>';
    } else {
        statusEl.className = 'celeste-connection-status disconnected';
        statusEl.innerHTML = '<i class="fas fa-circle"></i> <span>API key not configured</span>';
    }
}

/**
 * Escape HTML for safe display
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
