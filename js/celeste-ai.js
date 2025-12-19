/**
 * Celeste AI - Intelligent Assistant for Ascendance Hub
 * Voice & Text powered by OpenAI GPT-4 / Anthropic Claude (Switchable)
 * Handles all module actions through natural language
 */

// CORS Proxy for OpenAI API calls (OpenAI doesn't allow direct browser access)
const CELESTE_CORS_PROXY = 'https://corsproxy.io/?';

// ═══════════════════════════════════════════════════════════════
// DEFAULT API KEYS (can be overridden via Firebase or localStorage)
// ═══════════════════════════════════════════════════════════════
// PRIMARY: Anthropic Claude
const DEFAULT_ANTHROPIC_API_KEY = 'sk-ant-api03-09Q7EwKig5XiQ20t2bvOAluPYPxDgu5-8_N5cI25_8A1rPc44QkeVIBedrx2faxeddBUg-_8pTFgAA';
// FALLBACK: OpenAI GPT-4
const DEFAULT_OPENAI_API_KEY = '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';

// ═══════════════════════════════════════════════════════════════
// AI PROVIDER CONFIGURATION - Primary & Fallback System
// ═══════════════════════════════════════════════════════════════
// Primary provider: 'openai' (GPT-4) - More stable for browser-based calls
const AI_PROVIDER = 'openai'; // <-- PRIMARY PROVIDER (OpenAI GPT-4)
const AI_FALLBACK_PROVIDER = 'anthropic'; // <-- FALLBACK PROVIDER (Claude)

// Celeste settings loaded from Firebase (will be populated on init)
let celesteFirebaseSettings = null;

// Provider-specific configurations
const AI_PROVIDERS = {
    openai: {
        name: 'OpenAI GPT-4',
        apiEndpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-4o',
        maxTokens: 1024,
        getApiKey: () => celesteFirebaseSettings?.openai_api_key || DEFAULT_OPENAI_API_KEY
    },
    anthropic: {
        name: 'Anthropic Claude',
        apiEndpoint: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 1024,
        getApiKey: () => celesteFirebaseSettings?.anthropic_api_key || DEFAULT_ANTHROPIC_API_KEY
    }
};

// ═══════════════════════════════════════════════════════════════
// FIREBASE API KEY MANAGEMENT (Cloud-only storage)
// ═══════════════════════════════════════════════════════════════

/**
 * Get API key from Firebase (cloud-only, no localStorage)
 * @param {string} provider - 'anthropic' or 'openai'
 * @returns {string} The API key or default
 */
window.getFirebaseAPIKey = function(provider) {
    const keyField = provider === 'openai' ? 'openai_api_key' : 'anthropic_api_key';
    const defaultKey = provider === 'openai' ? DEFAULT_OPENAI_API_KEY : DEFAULT_ANTHROPIC_API_KEY;
    return celesteFirebaseSettings?.[keyField] || defaultKey;
};

/**
 * Save API key to Firebase (cloud-only)
 * @param {string} provider - 'anthropic' or 'openai'
 * @param {string} apiKey - The API key to save
 * @returns {Promise<boolean>} Success status
 */
window.saveFirebaseAPIKey = async function(provider, apiKey) {
    const keyField = provider === 'openai' ? 'openai_api_key' : 'anthropic_api_key';
    return await saveCelesteSettingsToFirebase({ [keyField]: apiKey });
};

/**
 * Get both API keys from Firebase
 * @returns {Object} { anthropic_api_key, openai_api_key, hasCustomAnthropicKey, hasCustomOpenAIKey }
 */
window.getFirebaseAPIKeys = function() {
    const anthropicKey = celesteFirebaseSettings?.anthropic_api_key || '';
    const openaiKey = celesteFirebaseSettings?.openai_api_key || '';
    return {
        anthropic_api_key: anthropicKey,
        openai_api_key: openaiKey,
        hasCustomAnthropicKey: anthropicKey && anthropicKey !== DEFAULT_ANTHROPIC_API_KEY,
        hasCustomOpenAIKey: openaiKey && openaiKey !== DEFAULT_OPENAI_API_KEY
    };
};

/**
 * Save both API keys to Firebase
 * @param {string} anthropicKey - Anthropic API key
 * @param {string} openaiKey - OpenAI API key
 * @returns {Promise<boolean>} Success status
 */
window.saveFirebaseAPIKeys = async function(anthropicKey, openaiKey) {
    const settings = {};
    if (anthropicKey !== undefined) settings.anthropic_api_key = anthropicKey;
    if (openaiKey !== undefined) settings.openai_api_key = openaiKey;
    return await saveCelesteSettingsToFirebase(settings);
};

/**
 * Reset API keys to defaults in Firebase
 * @returns {Promise<boolean>} Success status
 */
window.resetFirebaseAPIKeys = async function() {
    return await saveCelesteSettingsToFirebase({
        anthropic_api_key: DEFAULT_ANTHROPIC_API_KEY,
        openai_api_key: DEFAULT_OPENAI_API_KEY
    });
};

/**
 * Check if Firebase settings are loaded
 * @returns {boolean}
 */
window.areFirebaseSettingsLoaded = function() {
    return celesteFirebaseSettings !== null;
};

/**
 * Force reload settings from Firebase
 * @returns {Promise<Object|null>} The loaded settings or null
 */
window.reloadFirebaseAPISettings = async function() {
    await loadCelesteSettingsFromFirebase();
    return celesteFirebaseSettings;
};

// Celeste AI Configuration (uses selected provider)
const CELESTE_CONFIG = {
    name: 'Celeste',
    version: '1.0',
    get provider() {
        return AI_PROVIDER;
    },
    get providerConfig() {
        return AI_PROVIDERS[AI_PROVIDER];
    },
    get apiEndpoint() {
        return this.providerConfig.apiEndpoint;
    },
    get model() {
        return this.providerConfig.model;
    },
    get maxTokens() {
        return this.providerConfig.maxTokens;
    },
    get apiKey() {
        return this.providerConfig.getApiKey();
    },
    get providerName() {
        return this.providerConfig.name;
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
        module: 'customercare',
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
    'customercare': ['regalos', 'gifts', 'cortesías', 'customer care'],
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
async function initializeCelesteAI() {
    // Load settings from Firebase first
    await loadCelesteSettingsFromFirebase();

    // Create floating button
    createCelesteFloatingButton();

    // Create chat modal
    createCelesteChatModal();

    // Initialize speech recognition if available
    initializeSpeechRecognition();

    console.log('🌟 Celeste AI initialized');
}

/**
 * Load Celeste AI settings from Firebase
 */
async function loadCelesteSettingsFromFirebase() {
    try {
        const db = window.db || (typeof firebase !== 'undefined' ? firebase.firestore() : null);
        if (!db) {
            console.log('[Celeste] Firebase not available, using default settings');
            return;
        }

        const doc = await db.collection('settings').doc('celeste_ai').get();
        if (doc.exists) {
            celesteFirebaseSettings = doc.data();
            console.log('[Celeste] Settings loaded from Firebase');
        } else {
            // Initialize settings in Firebase with default API key
            await saveCelesteSettingsToFirebase({
                openai_api_key: DEFAULT_OPENAI_API_KEY,
                anthropic_api_key: '',
                provider: AI_PROVIDER,
                created_at: new Date().toISOString()
            });
            console.log('[Celeste] Default settings saved to Firebase');
        }
    } catch (error) {
        console.error('[Celeste] Error loading settings from Firebase:', error);
    }
}

/**
 * Save Celeste AI settings to Firebase
 */
async function saveCelesteSettingsToFirebase(settings) {
    try {
        const db = window.db || (typeof firebase !== 'undefined' ? firebase.firestore() : null);
        if (!db) {
            console.warn('[Celeste] Firebase not available, cannot save settings');
            return false;
        }

        await db.collection('settings').doc('celeste_ai').set({
            ...settings,
            updated_at: new Date().toISOString()
        }, { merge: true });

        celesteFirebaseSettings = { ...celesteFirebaseSettings, ...settings };
        console.log('[Celeste] Settings saved to Firebase');
        return true;
    } catch (error) {
        console.error('[Celeste] Error saving settings to Firebase:', error);
        return false;
    }
}

/**
 * Update Celeste API key (can be called from settings page)
 */
async function updateCelesteApiKey(provider, apiKey) {
    const keyField = provider === 'openai' ? 'openai_api_key' : 'anthropic_api_key';
    return await saveCelesteSettingsToFirebase({ [keyField]: apiKey });
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
            width: 420px;
            max-width: calc(100vw - 48px);
            height: 75vh;
            max-height: 700px;
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
            min-height: 350px;
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

        /* Quick Actions - Moved to bottom */
        .celeste-quick-actions {
            padding: 12px 16px;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            border-top: 1px solid var(--border-color);
            background: var(--bg-secondary);
            order: 10;
        }

        .celeste-quick-actions-label {
            width: 100%;
            font-size: 11px;
            color: var(--text-muted);
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .celeste-quick-btn {
            padding: 6px 12px;
            border-radius: 16px;
            border: 1px solid var(--border-color);
            background: var(--bg-primary);
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

        .celeste-quick-btn i {
            margin-right: 4px;
            opacity: 0.7;
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
                Hi! I'm Celeste, your Ascendance Hub assistant.<br><br>
                I can help you with expenses, announcements, reports, navigation and much more.<br><br>
                How can I help you today?
            </div>
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

        <div class="celeste-quick-actions">
            <span class="celeste-quick-actions-label">Quick actions</span>
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
            <button class="celeste-quick-btn" onclick="celesteQuickAction('Create restock request')">
                <i class="fas fa-boxes"></i> Restock
            </button>
            <button class="celeste-quick-btn" onclick="celesteQuickAction('Report an issue')">
                <i class="fas fa-exclamation-triangle"></i> Issue
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
            await executeCelesteAction(response.action, response.action.data);
        }

    } catch (error) {
        hideCelesteTyping();
        addCelesteMessage('Sorry, there was an error. Please try again.', 'error');
        console.error('Celeste error:', error);
    }
}

/**
 * Process message with AI (OpenAI or Anthropic based on config)
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
            message: `I understand you want to do something, but I need the ${CELESTE_CONFIG.providerName} API key to give you smarter responses. For now, try being more specific with commands like "record expense $50" or "go to sales".`,
            action: null
        };
    }

    // Call AI API with fallback system (Primary: Claude, Fallback: OpenAI)
    const systemPrompt = buildCelesteSystemPrompt();
    let assistantMessage = null;

    // ═══════════════════════════════════════════════════════════════
    // TRY PRIMARY PROVIDER FIRST (Anthropic Claude)
    // ═══════════════════════════════════════════════════════════════
    try {
        const anthropicConfig = AI_PROVIDERS.anthropic;
        const anthropicApiKey = anthropicConfig.getApiKey();

        if (anthropicApiKey) {
            console.log('🤖 Celeste: Trying primary provider (Anthropic Claude)...');
            const response = await fetch(anthropicConfig.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': anthropicApiKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: anthropicConfig.model,
                    max_tokens: anthropicConfig.maxTokens,
                    system: systemPrompt,
                    messages: [
                        ...celesteConversation.slice(-6),
                        { role: 'user', content: userMessage }
                    ]
                })
            });

            if (response.ok) {
                const data = await response.json();
                assistantMessage = data.content[0].text;
                console.log('✅ Celeste: Primary provider (Claude) succeeded');
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Anthropic API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }
        } else {
            throw new Error('No Anthropic API key available');
        }
    } catch (primaryError) {
        console.warn('⚠️ Celeste: Primary provider (Claude) failed:', primaryError.message);

        // ═══════════════════════════════════════════════════════════════
        // TRY FALLBACK PROVIDER (OpenAI GPT-4)
        // ═══════════════════════════════════════════════════════════════
        try {
            const openaiConfig = AI_PROVIDERS.openai;
            const openaiApiKey = openaiConfig.getApiKey();

            if (openaiApiKey) {
                console.log('🔄 Celeste: Trying fallback provider (OpenAI GPT-4)...');
                const openaiUrl = CELESTE_CORS_PROXY + encodeURIComponent(openaiConfig.apiEndpoint);
                const response = await fetch(openaiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${openaiApiKey}`
                    },
                    body: JSON.stringify({
                        model: openaiConfig.model,
                        max_tokens: openaiConfig.maxTokens,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            ...celesteConversation.slice(-6),
                            { role: 'user', content: userMessage }
                        ]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    assistantMessage = data.choices[0].message.content;
                    console.log('✅ Celeste: Fallback provider (OpenAI) succeeded');
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
                }
            } else {
                throw new Error('No OpenAI API key available');
            }
        } catch (fallbackError) {
            console.error('❌ Celeste: Both providers failed:', fallbackError.message);
            // All providers failed - return error message
            return {
                message: "I couldn't connect to any AI provider. Both Claude and OpenAI are unavailable. Please check your API keys in Project Analytics settings.",
                action: null
            };
        }
    }

    // Successfully got a response from one of the providers
    if (assistantMessage) {
        // Add to conversation history
        celesteConversation.push({ role: 'user', content: userMessage });
        celesteConversation.push({ role: 'assistant', content: assistantMessage });

        // Parse response for actions (same format for both providers)
        return parseAnthropicResponse(assistantMessage);
    }

    // Fallback if something unexpected happened
    return {
        message: "I couldn't process your request. Please try again.",
        action: null
    };
}

/**
 * Build system prompt for AI - Full Integration with All Modules
 * Works with both OpenAI GPT-4 and Anthropic Claude
 */
function buildCelesteSystemPrompt() {
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : { name: 'User', role: 'employee' };
    const currentStore = localStorage.getItem('selectedStore') || 'vsu';
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return `You are Celeste, a powerful AI assistant for Ascendance Hub - a comprehensive management system for VSU (Vape Smoke Universe) smoke shops.

CURRENT CONTEXT:
- User: ${currentUser.name || 'User'} (${currentUser.role || 'employee'})
- Store: ${currentStore}
- Date: ${today}
- System: Ascendance Hub v2.0

PERSONALITY:
- Friendly, efficient, and proactive
- Use emojis sparingly but effectively
- Give concise, actionable responses
- Always confirm actions before executing

═══════════════════════════════════════════════════════════════
ACTIONS - Include [ACTION:{"type":"...","data":{...}}] at end
═══════════════════════════════════════════════════════════════

1. NAVIGATION
   {"type":"navigate","data":{"module":"module_name"}}
   Modules: dashboard, employees, clockin, analytics, cashout, thieves, announcements,
            change, restock, issues, gifts, risknotes, labels, supplies, treasury,
            vendors, invoices, training, licenses, schedule, gconomics, passwords,
            gforce, abundancecloud, celesteai, projectanalytics

2. CREATE EMPLOYEE
   {"type":"create_employee","data":{
     "name":"Full Name",
     "role":"Sales Associate|Shift Lead|Store Manager|Inventory Specialist",
     "store":"miramar|morena|kearnymesa|chulavista|hillcrest",
     "email":"email@example.com",
     "phone":"(619) 555-0000",
     "emergencyContact":"Name - Phone",
     "allergies":"None or list"
   }}

3. RECORD EXPENSE (Cashout)
   {"type":"create_expense","data":{
     "amount":0.00,
     "description":"What was purchased",
     "category":"supplies|maintenance|inventory|utilities|other",
     "store":"store_name",
     "paymentMethod":"cash|card|transfer"
   }}

4. CREATE ANNOUNCEMENT
   {"type":"create_announcement","data":{
     "title":"Announcement Title",
     "content":"Full message content",
     "priority":"normal|important|urgent",
     "targetStores":["all"] or ["miramar","morena"],
     "targetRoles":["all"] or ["manager","employee"]
   }}

5. REPORT SUSPICIOUS PERSON (Thieves)
   {"type":"create_thief","data":{
     "description":"Physical description, behavior",
     "incident":"What happened",
     "store":"store_name",
     "date":"YYYY-MM-DD",
     "severity":"low|medium|high"
   }}

6. RECORD CHANGE (Cash transfers)
   {"type":"create_change","data":{
     "amount":0.00,
     "direction":"in|out",
     "fromStore":"store_name",
     "toStore":"store_name",
     "reason":"Why the transfer"
   }}

7. RECORD GIFT
   {"type":"create_gift","data":{
     "recipient":"Customer/Person name",
     "item":"What was given",
     "value":0.00,
     "reason":"Why it was given",
     "store":"store_name"
   }}

8. CREATE RISK NOTE
   {"type":"create_risk","data":{
     "title":"Brief title",
     "description":"Full risk description",
     "level":"low|medium|high|critical",
     "store":"store_name or all",
     "actionRequired":"What should be done"
   }}

9. REQUEST RESTOCK
   {"type":"create_restock","data":{
     "product":"Product name",
     "quantity":0,
     "urgency":"low|normal|high|urgent",
     "store":"store_name",
     "notes":"Additional notes"
   }}

10. REPORT ISSUE (Customer complaints)
    {"type":"create_issue","data":{
      "customerName":"Name if known",
      "description":"Issue description",
      "category":"product|service|refund|complaint|other",
      "store":"store_name",
      "resolution":"Proposed resolution"
    }}

11. ADD SUPPLY REQUEST
    {"type":"create_supply","data":{
      "item":"Supply item needed",
      "quantity":0,
      "store":"store_name",
      "urgency":"low|normal|high"
    }}

12. CREATE INVOICE
    {"type":"create_invoice","data":{
      "vendor":"Vendor name",
      "amount":0.00,
      "dueDate":"YYYY-MM-DD",
      "description":"What it's for",
      "status":"pending|paid|overdue"
    }}

13. ADD VENDOR
    {"type":"create_vendor","data":{
      "name":"Vendor/Supplier name",
      "contact":"Contact person",
      "phone":"Phone number",
      "email":"Email",
      "category":"products|supplies|services|other"
    }}

14. SAVE PASSWORD
    {"type":"create_password","data":{
      "service":"Service/Website name",
      "username":"Username or email",
      "password":"The password",
      "url":"Website URL",
      "notes":"Additional notes"
    }}

15. ADD HEADY PIECE (Treasury)
    {"type":"create_treasury","data":{
      "name":"Piece name/description",
      "artist":"Artist name",
      "value":0.00,
      "store":"store_name",
      "description":"Details about the piece"
    }}

16. CLOCK IN/OUT
    {"type":"clock_action","data":{
      "action":"in|out",
      "store":"store_name"
    }}

17. UPDATE/EDIT RECORD
    {"type":"update_record","data":{
      "module":"module_name",
      "id":"record_id",
      "updates":{field:value,...}
    }}

18. DELETE RECORD
    {"type":"delete_record","data":{
      "module":"module_name",
      "id":"record_id",
      "confirm":true
    }}

19. SEARCH DATA
    {"type":"search","data":{
      "module":"module_name or all",
      "query":"search terms"
    }}

20. GET ANALYTICS
    {"type":"get_analytics","data":{
      "type":"sales|employees|inventory|expenses",
      "period":"today|week|month|year"
    }}

═══════════════════════════════════════════════════════════════
STORES AVAILABLE:
- miramar (VSU Miramar)
- morena (VSU Morena)
- kearnymesa (VSU Kearny Mesa)
- chulavista (VSU Chula Vista)
- hillcrest (VSU Hillcrest)

IMPORTANT RULES:
1. Always confirm destructive actions (delete, update) before executing
2. Ask for missing required fields politely
3. For amounts, extract numbers from natural language ("fifty dollars" = 50)
4. When unsure, ask clarifying questions
5. After creating something, offer to navigate to that module
6. Use the current store context unless user specifies differently

EXAMPLES:
- "Add an expense of $45 for cleaning supplies" → create_expense with amount:45, category:supplies
- "Record that John Smith was caught stealing" → create_thief with description
- "Tell everyone the store closes early today" → create_announcement
- "We need more RAZ disposables" → create_restock with product info
- "Clock me in" → clock_action with action:in`;
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
 * Parse AI response for actions (works with both OpenAI and Anthropic)
 */
function parseAnthropicResponse(response) {
    // Look for action JSON in response - support multi-line JSON
    const actionMatch = response.match(/\[ACTION:(\{[\s\S]*?\})\]/);

    let action = null;
    let message = response;

    if (actionMatch) {
        try {
            // Clean up the JSON (remove newlines, extra spaces)
            const jsonStr = actionMatch[1].replace(/\n/g, '').replace(/\s+/g, ' ');
            action = JSON.parse(jsonStr);
            // Remove action JSON from message
            message = response.replace(actionMatch[0], '').trim();
            console.log('Parsed action:', action);
        } catch (e) {
            console.error('Error parsing action:', e, 'Raw JSON:', actionMatch[1]);
        }
    }

    return { message, action };
}

/**
 * Execute detected action - Full Firebase Integration
 */
async function executeCelesteAction(action, data) {
    const db = window.db || (typeof firebase !== 'undefined' ? firebase.firestore() : null);
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : { name: 'System' };
    const currentStore = localStorage.getItem('selectedStore') || 'vsu';
    const timestamp = new Date().toISOString();

    console.log('Executing Celeste action:', action.type, data);

    try {
        switch (action.type) {
            // ═══════════════════════════════════════════════════════════
            // NAVIGATION
            // ═══════════════════════════════════════════════════════════
            case 'navigate':
                if (data?.module && typeof window.navigateTo === 'function') {
                    setTimeout(() => {
                        window.navigateTo(data.module);
                        if (typeof toggleCelesteChat === 'function') {
                            toggleCelesteChat();
                        }
                    }, 500);
                    return { success: true, message: `Navigating to ${data.module}...` };
                }
                break;

            // ═══════════════════════════════════════════════════════════
            // CREATE EMPLOYEE
            // ═══════════════════════════════════════════════════════════
            case 'create_employee':
                if (db && data) {
                    const employeeData = {
                        name: data.name || 'New Employee',
                        role: data.role || 'Sales Associate',
                        store: data.store || currentStore,
                        email: data.email || '',
                        phone: data.phone || '',
                        emergencyContact: data.emergencyContact || '',
                        allergies: data.allergies || 'None',
                        status: 'active',
                        hireDate: timestamp.split('T')[0],
                        createdAt: timestamp,
                        createdBy: currentUser.name,
                        createdByCeleste: true
                    };
                    const docRef = await db.collection('employees').add(employeeData);
                    return { success: true, message: `Employee "${data.name}" created!`, id: docRef.id };
                }
                break;

            // ═══════════════════════════════════════════════════════════
            // CREATE EXPENSE (Cashout)
            // ═══════════════════════════════════════════════════════════
            case 'create_expense':
                if (db && data) {
                    const expenseData = {
                        amount: parseFloat(data.amount) || 0,
                        description: data.description || 'Expense',
                        category: data.category || 'other',
                        store: data.store || currentStore,
                        paymentMethod: data.paymentMethod || 'cash',
                        date: timestamp.split('T')[0],
                        createdAt: timestamp,
                        createdBy: currentUser.name,
                        createdByCeleste: true
                    };
                    const docRef = await db.collection('expenses').add(expenseData);
                    return { success: true, message: `Expense of $${data.amount} recorded!`, id: docRef.id };
                }
                break;

            // ═══════════════════════════════════════════════════════════
            // CREATE ANNOUNCEMENT
            // ═══════════════════════════════════════════════════════════
            case 'create_announcement':
                if (db && data) {
                    const announcementData = {
                        title: data.title || 'Announcement',
                        content: data.content || '',
                        priority: data.priority || 'normal',
                        targetStores: data.targetStores || ['all'],
                        targetRoles: data.targetRoles || ['all'],
                        author: currentUser.name,
                        createdAt: timestamp,
                        createdByCeleste: true,
                        active: true
                    };
                    const docRef = await db.collection('announcements').add(announcementData);
                    return { success: true, message: `Announcement "${data.title}" posted!`, id: docRef.id };
                }
                break;

            // ═══════════════════════════════════════════════════════════
            // CREATE THIEF REPORT
            // ═══════════════════════════════════════════════════════════
            case 'create_thief':
                if (db && data) {
                    const thiefData = {
                        description: data.description || '',
                        incident: data.incident || '',
                        store: data.store || currentStore,
                        date: data.date || timestamp.split('T')[0],
                        severity: data.severity || 'medium',
                        reportedBy: currentUser.name,
                        createdAt: timestamp,
                        createdByCeleste: true,
                        status: 'active'
                    };
                    const docRef = await db.collection('thieves').add(thiefData);
                    return { success: true, message: `Suspicious person report filed!`, id: docRef.id };
                }
                break;

            // ═══════════════════════════════════════════════════════════
            // CREATE CHANGE RECORD
            // ═══════════════════════════════════════════════════════════
            case 'create_change':
                if (db && data) {
                    const changeData = {
                        amount: parseFloat(data.amount) || 0,
                        direction: data.direction || 'out',
                        fromStore: data.fromStore || currentStore,
                        toStore: data.toStore || '',
                        reason: data.reason || '',
                        date: timestamp.split('T')[0],
                        createdAt: timestamp,
                        createdBy: currentUser.name,
                        createdByCeleste: true
                    };
                    const docRef = await db.collection('changes').add(changeData);
                    return { success: true, message: `Change of $${data.amount} recorded!`, id: docRef.id };
                }
                break;

            // ═══════════════════════════════════════════════════════════
            // CREATE GIFT RECORD
            // ═══════════════════════════════════════════════════════════
            case 'create_gift':
                if (db && data) {
                    const giftData = {
                        recipient: data.recipient || 'Customer',
                        item: data.item || '',
                        value: parseFloat(data.value) || 0,
                        reason: data.reason || '',
                        store: data.store || currentStore,
                        date: timestamp.split('T')[0],
                        createdAt: timestamp,
                        createdBy: currentUser.name,
                        createdByCeleste: true
                    };
                    const docRef = await db.collection('gifts').add(giftData);
                    return { success: true, message: `Gift to "${data.recipient}" recorded!`, id: docRef.id };
                }
                break;

            // ═══════════════════════════════════════════════════════════
            // CREATE RISK NOTE
            // ═══════════════════════════════════════════════════════════
            case 'create_risk':
                if (db && data) {
                    const riskData = {
                        title: data.title || 'Risk Alert',
                        description: data.description || '',
                        level: data.level || 'medium',
                        store: data.store || currentStore,
                        actionRequired: data.actionRequired || '',
                        date: timestamp.split('T')[0],
                        createdAt: timestamp,
                        createdBy: currentUser.name,
                        createdByCeleste: true,
                        status: 'active'
                    };
                    const docRef = await db.collection('risknotes').add(riskData);
                    return { success: true, message: `Risk note "${data.title}" created!`, id: docRef.id };
                }
                break;

            // ═══════════════════════════════════════════════════════════
            // CREATE RESTOCK REQUEST
            // ═══════════════════════════════════════════════════════════
            case 'create_restock':
                if (db && data) {
                    const restockData = {
                        product: data.product || '',
                        quantity: parseInt(data.quantity) || 1,
                        urgency: data.urgency || 'normal',
                        store: data.store || currentStore,
                        notes: data.notes || '',
                        date: timestamp.split('T')[0],
                        createdAt: timestamp,
                        createdBy: currentUser.name,
                        createdByCeleste: true,
                        status: 'pending'
                    };
                    const docRef = await db.collection('restock').add(restockData);
                    return { success: true, message: `Restock request for "${data.product}" submitted!`, id: docRef.id };
                }
                break;

            // ═══════════════════════════════════════════════════════════
            // CREATE ISSUE REPORT
            // ═══════════════════════════════════════════════════════════
            case 'create_issue':
                if (db && data) {
                    const issueData = {
                        customerName: data.customerName || 'Anonymous',
                        description: data.description || '',
                        category: data.category || 'complaint',
                        store: data.store || currentStore,
                        resolution: data.resolution || '',
                        date: timestamp.split('T')[0],
                        createdAt: timestamp,
                        createdBy: currentUser.name,
                        createdByCeleste: true,
                        status: 'open'
                    };
                    const docRef = await db.collection('issues').add(issueData);
                    return { success: true, message: `Issue report filed!`, id: docRef.id };
                }
                break;

            // ═══════════════════════════════════════════════════════════
            // CREATE SUPPLY REQUEST
            // ═══════════════════════════════════════════════════════════
            case 'create_supply':
                if (db && data) {
                    const supplyData = {
                        item: data.item || '',
                        quantity: parseInt(data.quantity) || 1,
                        store: data.store || currentStore,
                        urgency: data.urgency || 'normal',
                        date: timestamp.split('T')[0],
                        createdAt: timestamp,
                        createdBy: currentUser.name,
                        createdByCeleste: true,
                        status: 'pending'
                    };
                    const docRef = await db.collection('supplies').add(supplyData);
                    return { success: true, message: `Supply request for "${data.item}" added!`, id: docRef.id };
                }
                break;

            // ═══════════════════════════════════════════════════════════
            // CREATE INVOICE
            // ═══════════════════════════════════════════════════════════
            case 'create_invoice':
                if (db && data) {
                    const invoiceData = {
                        vendor: data.vendor || '',
                        amount: parseFloat(data.amount) || 0,
                        dueDate: data.dueDate || '',
                        description: data.description || '',
                        status: data.status || 'pending',
                        createdAt: timestamp,
                        createdBy: currentUser.name,
                        createdByCeleste: true
                    };
                    const docRef = await db.collection('invoices').add(invoiceData);
                    return { success: true, message: `Invoice for $${data.amount} from "${data.vendor}" created!`, id: docRef.id };
                }
                break;

            // ═══════════════════════════════════════════════════════════
            // CREATE VENDOR
            // ═══════════════════════════════════════════════════════════
            case 'create_vendor':
                if (db && data) {
                    const vendorData = {
                        name: data.name || '',
                        contact: data.contact || '',
                        phone: data.phone || '',
                        email: data.email || '',
                        category: data.category || 'other',
                        createdAt: timestamp,
                        createdBy: currentUser.name,
                        createdByCeleste: true,
                        active: true
                    };
                    const docRef = await db.collection('vendors').add(vendorData);
                    return { success: true, message: `Vendor "${data.name}" added!`, id: docRef.id };
                }
                break;

            // ═══════════════════════════════════════════════════════════
            // CREATE PASSWORD ENTRY
            // ═══════════════════════════════════════════════════════════
            case 'create_password':
                if (db && data) {
                    const passwordData = {
                        service: data.service || '',
                        username: data.username || '',
                        password: data.password || '', // Note: In production, encrypt this
                        url: data.url || '',
                        notes: data.notes || '',
                        createdAt: timestamp,
                        createdBy: currentUser.name,
                        createdByCeleste: true
                    };
                    const docRef = await db.collection('passwords').add(passwordData);
                    return { success: true, message: `Password for "${data.service}" saved!`, id: docRef.id };
                }
                break;

            // ═══════════════════════════════════════════════════════════
            // CREATE TREASURY/HEADY PIECE
            // ═══════════════════════════════════════════════════════════
            case 'create_treasury':
                if (db && data) {
                    const treasuryData = {
                        name: data.name || '',
                        artist: data.artist || 'Unknown',
                        value: parseFloat(data.value) || 0,
                        store: data.store || currentStore,
                        description: data.description || '',
                        createdAt: timestamp,
                        createdBy: currentUser.name,
                        createdByCeleste: true,
                        status: 'available'
                    };
                    const docRef = await db.collection('treasury').add(treasuryData);
                    return { success: true, message: `Heady piece "${data.name}" added to treasury!`, id: docRef.id };
                }
                break;

            // ═══════════════════════════════════════════════════════════
            // CLOCK IN/OUT
            // ═══════════════════════════════════════════════════════════
            case 'clock_action':
                if (db && data) {
                    const clockData = {
                        action: data.action || 'in',
                        store: data.store || currentStore,
                        employee: currentUser.name,
                        employeeId: currentUser.id || null,
                        timestamp: timestamp,
                        createdByCeleste: true
                    };
                    const docRef = await db.collection('clockins').add(clockData);
                    const actionText = data.action === 'in' ? 'clocked in' : 'clocked out';
                    return { success: true, message: `You've been ${actionText}!`, id: docRef.id };
                }
                break;

            // ═══════════════════════════════════════════════════════════
            // UPDATE RECORD
            // ═══════════════════════════════════════════════════════════
            case 'update_record':
                if (db && data && data.module && data.id && data.updates) {
                    const updateData = {
                        ...data.updates,
                        updatedAt: timestamp,
                        updatedBy: currentUser.name,
                        updatedByCeleste: true
                    };
                    await db.collection(data.module).doc(data.id).update(updateData);
                    return { success: true, message: `Record updated successfully!` };
                }
                break;

            // ═══════════════════════════════════════════════════════════
            // DELETE RECORD
            // ═══════════════════════════════════════════════════════════
            case 'delete_record':
                if (db && data && data.module && data.id && data.confirm) {
                    await db.collection(data.module).doc(data.id).delete();
                    return { success: true, message: `Record deleted successfully!` };
                }
                break;

            // ═══════════════════════════════════════════════════════════
            // SEARCH
            // ═══════════════════════════════════════════════════════════
            case 'search':
                // Trigger global search
                if (data?.query && typeof performGlobalSearch === 'function') {
                    performGlobalSearch(data.query);
                    return { success: true, message: `Searching for "${data.query}"...` };
                }
                break;

            // ═══════════════════════════════════════════════════════════
            // GET ANALYTICS
            // ═══════════════════════════════════════════════════════════
            case 'get_analytics':
                window.navigateTo('analytics');
                return { success: true, message: `Opening analytics...` };

            default:
                console.log('Unknown action type:', action.type);
                return { success: false, message: `Unknown action: ${action.type}` };
        }
    } catch (error) {
        console.error('Error executing Celeste action:', error);
        return { success: false, message: `Error: ${error.message}` };
    }

    return { success: false, message: 'Action could not be completed' };
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
            <!-- Main Chat - Full Width -->
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

            <!-- Bottom Section - Quick Actions & Commands -->
            <div class="celeste-bottom-section">
                <!-- Quick Actions -->
                <div class="celeste-panel-card">
                    <div class="celeste-panel-header">
                        <h4><i class="fas fa-bolt"></i> Quick Actions</h4>
                    </div>
                    <div class="celeste-quick-grid-wide">
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
                        <button onclick="celestePageQuickAction('Request restock')" class="celeste-quick-tile">
                            <i class="fas fa-boxes"></i>
                            <span>Restock</span>
                        </button>
                        <button onclick="celestePageQuickAction('Report an issue')" class="celeste-quick-tile">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>Report Issue</span>
                        </button>
                    </div>
                </div>

                <!-- Available Commands -->
                <div class="celeste-panel-card">
                    <div class="celeste-panel-header">
                        <h4><i class="fas fa-terminal"></i> Available Commands</h4>
                        <div class="celeste-connection-status" id="celeste-connection-status">
                            <i class="fas fa-circle"></i>
                            <span>Checking...</span>
                        </div>
                    </div>
                    <div class="celeste-commands-grid">
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

                <!-- Conversations Panel -->
                <div class="celeste-panel-card">
                    <div class="celeste-panel-header">
                        <h4><i class="fas fa-comments"></i> Conversations</h4>
                        <button class="celeste-new-chat-btn" onclick="startNewCelesteConversation()">
                            <i class="fas fa-plus"></i> New Chat
                        </button>
                    </div>
                    <div class="celeste-conversations-grid" id="celeste-conversations-list">
                        <!-- Conversations loaded here -->
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

            /* Main Chat - Full Width */
            .celeste-main-chat {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 16px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                min-height: 450px;
                margin-bottom: 24px;
            }

            .celeste-chat-container {
                display: flex;
                flex-direction: column;
                height: 100%;

            }

            /* New Chat Button */
            .celeste-new-chat-btn {
                padding: 8px 16px;
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

            /* Conversations Grid - Horizontal Layout */
            .celeste-conversations-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 12px;
                max-height: 200px;
                overflow-y: auto;
                padding: 4px;
            }

            .celeste-conversation-item {
                padding: 12px 14px;
                background: var(--bg-primary);
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s;
                border: 1px solid var(--border-color);
            }

            .celeste-conversation-item:hover {
                border-color: #a855f7;
                transform: translateY(-2px);
            }

            .celeste-conversation-item.active {
                background: rgba(168, 85, 247, 0.1);
                border-color: rgba(168, 85, 247, 0.5);
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
                padding: 20px 24px 28px;
                border-top: 1px solid var(--border-color);
            }

            .celeste-chat-input-wrapper {
                display: flex;
                align-items: center;
                gap: 14px;
                background: var(--bg-primary);
                border: 2px solid var(--border-color);
                border-radius: 20px;
                padding: 14px 18px;
                transition: all 0.2s;
            }

            .celeste-chat-input-wrapper:focus-within {
                border-color: #a855f7;
                box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.1);
            }

            .celeste-chat-input {
                flex: 1;
                border: none;
                background: none;
                font-size: 16px;
                color: var(--text-primary);
                outline: none;
                padding: 4px 0;
            }

            .celeste-chat-input::placeholder {
                color: var(--text-muted);
            }

            .celeste-voice-toggle,
            .celeste-send-toggle {
                width: 44px;
                height: 44px;
                border-radius: 14px;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                font-size: 18px;
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

            /* Bottom Section - Panels Below Chat */
            .celeste-bottom-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 24px;
            }

            .celeste-panel-card {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 16px;
                padding: 20px;
            }

            .celeste-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }

            .celeste-panel-header h4 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                color: var(--text-primary);
            }

            .celeste-panel-header h4 i {
                color: #a855f7;
            }

            /* Quick Actions Grid - Wide Version */
            .celeste-quick-grid-wide {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 12px;
            }

            .celeste-quick-tile {
                padding: 16px 12px;
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
                font-size: 20px;
                color: #a855f7;
            }

            .celeste-quick-tile span {
                font-size: 12px;
                font-weight: 500;
                color: var(--text-secondary);
            }

            /* Commands Grid - Wide Version */
            .celeste-commands-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
            }

            .celeste-command-item {
                padding: 12px 14px;
                background: var(--bg-primary);
                border-radius: 10px;
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
            .celeste-connection-status {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                color: var(--text-muted);
                padding: 6px 12px;
                background: var(--bg-primary);
                border-radius: 20px;
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
                .celeste-bottom-section {
                    grid-template-columns: 1fr;
                }

                .celeste-quick-grid-wide {
                    grid-template-columns: repeat(4, 1fr);
                }

                .celeste-commands-grid {
                    grid-template-columns: repeat(2, 1fr);
                }

                .celeste-conversations-grid {
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
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

                .celeste-main-chat {
                    min-height: 350px;
                }

                .celeste-quick-grid-wide {
                    grid-template-columns: repeat(2, 1fr);
                }

                .celeste-commands-grid {
                    grid-template-columns: 1fr;
                }

                .celeste-conversations-grid {
                    grid-template-columns: 1fr;
                    max-height: 150px;
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
            await executeCelesteAction(response.action, response.action.data);
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
        statusEl.innerHTML = '<i class="fas fa-circle"></i> <span>Connected to Anthropic AI</span>';
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
