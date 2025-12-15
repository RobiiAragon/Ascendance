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
    // API Key - Set this in abundance-config.js as window.ANTHROPIC_API_KEY
    get apiKey() {
        return window.ANTHROPIC_API_KEY || '';
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
                <i class="fas fa-stars"></i>
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
                <i class="fas fa-stars"></i>
            </div>
            <div class="celeste-info">
                <div class="celeste-name">Celeste AI</div>
                <div class="celeste-status">
                    <span class="celeste-status-dot"></span>
                    Siempre lista para ayudarte
                </div>
            </div>
            <button class="celeste-close" onclick="toggleCelesteChat()">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <div class="celeste-messages" id="celeste-messages">
            <div class="celeste-message assistant">
                ¡Hola! Soy Celeste, tu asistente de Ascendance Hub. 🌟<br><br>
                Puedo ayudarte a:<br>
                • Registrar gastos<br>
                • Reportar sospechosos<br>
                • Crear anuncios<br>
                • Navegar a cualquier módulo<br>
                • ¡Y mucho más!<br><br>
                ¿En qué te puedo ayudar?
            </div>
        </div>

        <div class="celeste-quick-actions">
            <button class="celeste-quick-btn" onclick="celesteQuickAction('Registrar un gasto')">
                <i class="fas fa-money-bill"></i> Gasto
            </button>
            <button class="celeste-quick-btn" onclick="celesteQuickAction('Reportar sospechoso')">
                <i class="fas fa-user-secret"></i> Sospechoso
            </button>
            <button class="celeste-quick-btn" onclick="celesteQuickAction('Crear anuncio')">
                <i class="fas fa-bullhorn"></i> Anuncio
            </button>
            <button class="celeste-quick-btn" onclick="celesteQuickAction('Ver ventas')">
                <i class="fas fa-chart-line"></i> Ventas
            </button>
        </div>

        <div class="celeste-input-area">
            <button class="celeste-voice-btn" id="celeste-voice-btn" onclick="toggleCelesteVoice()" title="Hablar con voz">
                <i class="fas fa-microphone"></i>
            </button>
            <input type="text" class="celeste-input" id="celeste-input"
                placeholder="Escribe o habla con Celeste..."
                onkeypress="if(event.key==='Enter') sendCelesteMessage()">
            <button class="celeste-send-btn" onclick="sendCelesteMessage()" title="Enviar">
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
    celesteRecognition.lang = 'es-MX'; // Spanish Mexico

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
            addCelesteMessage('Por favor permite el acceso al micrófono para usar el reconocimiento de voz.', 'error');
        }
    };
}

/**
 * Toggle voice recognition
 */
function toggleCelesteVoice() {
    if (!celesteRecognition) {
        addCelesteMessage('El reconocimiento de voz no está disponible en este navegador.', 'error');
        return;
    }

    if (celesteIsListening) {
        celesteRecognition.stop();
        celesteIsListening = false;
    } else {
        celesteRecognition.start();
        celesteIsListening = true;
        addCelesteMessage('🎤 Escuchando... Habla ahora', 'system');
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
        addCelesteMessage('Lo siento, hubo un error. Por favor intenta de nuevo.', 'error');
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
            message: 'Entiendo que quieres hacer algo, pero necesito que configures la API key de Claude para darte una respuesta más inteligente. Por ahora, intenta ser más específico con comandos como "registrar gasto de $50" o "ir a ventas".',
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
            message: 'No pude conectar con mi cerebro en la nube, pero aún puedo ayudarte. ¿Qué necesitas hacer?',
            action: null
        };
    }
}

/**
 * Build system prompt for Claude
 */
function buildCelesteSystemPrompt() {
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : { name: 'Usuario' };
    const currentStore = localStorage.getItem('selectedStore') || 'la tienda';

    return `Eres Celeste, una asistente virtual amigable y eficiente para Ascendance Hub, un sistema de gestión de tiendas de vape/smoke shop llamadas VSU (Vape Smoke Universe).

INFORMACIÓN DEL CONTEXTO:
- Usuario actual: ${currentUser.name || 'Usuario'}
- Tienda: ${currentStore}
- Sistema: Ascendance Hub

TU PERSONALIDAD:
- Eres amigable, profesional y eficiente
- Usas español mexicano casual pero profesional
- Puedes usar emojis ocasionalmente
- Das respuestas concisas y directas

ACCIONES QUE PUEDES REALIZAR:
Cuando detectes que el usuario quiere hacer una acción, incluye al final de tu respuesta un JSON con el formato:
[ACTION:{"type":"tipo_accion","data":{...}}]

Tipos de acciones disponibles:
1. "navigate" - Navegar a un módulo: {"type":"navigate","data":{"module":"nombre_modulo"}}
2. "expense" - Registrar gasto: {"type":"expense","data":{"amount":0,"description":"","store":""}}
3. "thief" - Reportar sospechoso: {"type":"thief","data":{"description":""}}
4. "announcement" - Crear anuncio: {"type":"announcement","data":{"title":"","content":""}}
5. "change" - Registrar cambio: {"type":"change","data":{"amount":0,"type":"in/out"}}
6. "gift" - Registrar regalo: {"type":"gift","data":{"description":"","value":0}}
7. "risk" - Nota de riesgo: {"type":"risk","data":{"description":"","level":"low/medium/high"}}
8. "restock" - Solicitar restock: {"type":"restock","data":{"product":"","quantity":0}}
9. "issue" - Reportar problema: {"type":"issue","data":{"description":""}}

MÓDULOS DISPONIBLES PARA NAVEGACIÓN:
dashboard, employees, clockin, analytics, cashout, thieves, announcements, change, restock, issues, gifts, risknotes, labels, supplies, treasury, vendors, invoices, training, licenses, schedule, gconomics, passwords, gforce, abundancecloud

Si el usuario no especifica toda la información necesaria para una acción, pídela amablemente.
Si no estás segura de qué quiere el usuario, pregunta para clarificar.`;
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
                 lowerMessage.includes('go to') || lowerMessage.includes('open'))) {
                return {
                    message: `¡Claro! Te llevo a ${module}... 🚀`,
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
                        message: `Entendido, vamos a ${actionConfig.description}. Te llevo al módulo correspondiente... ✨`,
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
