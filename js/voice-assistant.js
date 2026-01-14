// ========== REUSABLE VOICE ASSISTANT COMPONENT ==========
// This component can be added to any modal to provide voice-to-AI functionality
// Usage: VoiceAssistant.create('unique-id', { prompt: '...', onFill: (data) => {...} })

const VoiceAssistant = {
    instances: {},

    // Generate the HTML for the voice assistant UI
    getHTML: function(id, options = {}) {
        const title = options.title || 'AI Voice Assistant';
        const subtitle = options.subtitle || 'Describe and auto-fill form';
        const buttonColor = options.buttonColor || 'linear-gradient(135deg, #8b5cf6, #6366f1)';

        return `
            <div id="voice-assistant-${id}" class="voice-assistant-container" style="margin-bottom: 20px; padding: 16px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 36px; height: 36px; background: ${buttonColor}; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-wand-magic-sparkles" style="color: white; font-size: 14px;"></i>
                        </div>
                        <div>
                            <div style="font-weight: 600; font-size: 14px; color: var(--text-primary);">${title}</div>
                            <div style="font-size: 12px; color: var(--text-muted);">${subtitle}</div>
                        </div>
                    </div>
                    <button type="button" id="va-btn-${id}" onclick="VoiceAssistant.toggle('${id}')" style="padding: 10px 16px; background: ${buttonColor}; border: none; color: white; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px; transition: all 0.2s;" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(139,92,246,0.4)';" onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
                        <i id="va-icon-${id}" class="fas fa-microphone"></i>
                        <span id="va-text-${id}" style="font-family: Outfit;">Start Recording</span>
                    </button>
                </div>
                <div id="va-status-${id}" style="display: none; margin-top: 12px; padding: 10px; background: var(--bg-secondary); border-radius: 8px; font-size: 13px;"></div>
                <div id="va-transcript-${id}" style="display: none; margin-top: 10px; padding: 12px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px;">
                    <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; font-weight: 600;">What you said:</div>
                    <div id="va-transcript-text-${id}" style="font-size: 13px; color: var(--text-primary); line-height: 1.5;"></div>
                </div>
            </div>
        `;
    },

    // Initialize a voice assistant instance
    init: function(id, options = {}) {
        this.instances[id] = {
            recognition: null,
            isRecording: false,
            transcript: '',
            stoppedByUser: false,
            prompt: options.prompt || '',
            systemPrompt: options.systemPrompt || 'You are a helpful assistant that extracts structured information from voice transcripts.',
            onFill: options.onFill || function() {},
            buttonColor: options.buttonColor || 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            listeningText: options.listeningText || 'Listening... Speak now'
        };
    },

    // Toggle recording
    toggle: function(id) {
        const instance = this.instances[id];
        if (!instance) {
            console.error('Voice assistant instance not found:', id);
            return;
        }

        if (instance.isRecording) {
            this.stop(id);
        } else {
            this.start(id);
        }
    },

    // Start recording
    start: function(id) {
        const instance = this.instances[id];
        if (!instance) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            this.updateStatus(id, '<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> <span style="color: var(--text-primary);">Voice recognition not supported. Try Chrome or Edge.</span>');
            return;
        }

        try {
            instance.recognition = new SpeechRecognition();
            instance.recognition.continuous = true;
            instance.recognition.interimResults = true;
            instance.recognition.lang = 'en-US';
            instance.recognition.maxAlternatives = 1;

            instance.transcript = '';
            instance.stoppedByUser = false;

            const btn = document.getElementById(`va-btn-${id}`);
            const icon = document.getElementById(`va-icon-${id}`);
            const text = document.getElementById(`va-text-${id}`);
            const transcriptDiv = document.getElementById(`va-transcript-${id}`);

            instance.recognition.onstart = () => {
                instance.isRecording = true;
                if (btn) btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                if (icon) icon.className = 'fas fa-stop';
                if (text) text.textContent = 'Stop Recording';
                if (transcriptDiv) transcriptDiv.style.display = 'none';
                this.updateStatus(id, `<i class="fas fa-circle" style="color: #ef4444; animation: pulse 1s infinite;"></i> <span style="color: var(--text-primary);">${instance.listeningText}</span>`);
            };

            instance.recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (finalTranscript) {
                    instance.transcript += finalTranscript;
                }

                // Show real-time transcript
                const transcriptText = document.getElementById(`va-transcript-text-${id}`);
                if (transcriptDiv && transcriptText) {
                    transcriptDiv.style.display = 'block';
                    transcriptText.innerHTML = instance.transcript + '<span style="color: var(--text-muted); font-style: italic;">' + interimTranscript + '</span>';
                }
            };

            instance.recognition.onerror = (event) => {
                console.error('Voice recognition error:', event.error);
                if (event.error !== 'aborted' && event.error !== 'no-speech') {
                    this.updateStatus(id, `<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> <span style="color: var(--text-primary);">Error: ${event.error}. Try again.</span>`);
                }
            };

            instance.recognition.onend = () => {
                // If stopped by user, processing is handled in stop()
                if (instance.stoppedByUser) return;

                // Auto-restart if still recording (browser timeout)
                if (instance.isRecording) {
                    try {
                        instance.recognition.start();
                        return;
                    } catch (e) {
                        console.log('Could not restart recognition:', e);
                    }
                }
                this.resetUI(id);
            };

            instance.recognition.start();

        } catch (error) {
            console.error('Error starting voice recognition:', error);
            this.updateStatus(id, '<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> <span style="color: var(--text-primary);">Could not start voice recording. Check microphone permissions.</span>');
        }
    },

    // Stop recording
    stop: function(id) {
        const instance = this.instances[id];
        if (!instance) return;

        instance.stoppedByUser = true;
        instance.isRecording = false;

        if (instance.recognition) {
            try {
                instance.recognition.stop();
            } catch (e) {
                console.log('Error stopping recognition:', e);
            }
        }

        // Reset UI immediately
        this.resetUI(id);

        // Process with AI if we have transcript
        if (instance.transcript.trim()) {
            this.updateStatus(id, '<i class="fas fa-spinner fa-spin" style="color: #8b5cf6;"></i> <span style="color: var(--text-primary);">Processing with AI...</span>');
            this.processWithAI(id, instance.transcript.trim());
        } else {
            this.updateStatus(id, '<i class="fas fa-info-circle" style="color: #f59e0b;"></i> <span style="color: var(--text-primary);">No speech detected. Please try again.</span>');
        }
    },

    // Reset UI to initial state
    resetUI: function(id) {
        const instance = this.instances[id];
        if (!instance) return;

        instance.isRecording = false;
        const btn = document.getElementById(`va-btn-${id}`);
        const icon = document.getElementById(`va-icon-${id}`);
        const text = document.getElementById(`va-text-${id}`);

        if (btn) btn.style.background = instance.buttonColor;
        if (icon) icon.className = 'fas fa-microphone';
        if (text) text.textContent = 'Start Recording';
    },

    // Update status message
    updateStatus: function(id, html) {
        const statusDiv = document.getElementById(`va-status-${id}`);
        if (statusDiv) {
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = html;
        }
    },

    // Process transcript with AI
    processWithAI: async function(id, transcript) {
        const instance = this.instances[id];
        if (!instance) return;

        try {
            const apiKey = window.getOpenAIKey ? window.getOpenAIKey() : localStorage.getItem('openai_api_key');

            if (!apiKey) {
                this.updateStatus(id, '<i class="fas fa-exclamation-circle" style="color: #f59e0b;"></i> <span style="color: var(--text-primary);">No API key configured. Transcript captured but not processed.</span>');
                // Call onFill with just the transcript
                instance.onFill({ _transcript: transcript });
                return;
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + apiKey
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    max_tokens: 1024,
                    messages: [
                        {
                            role: 'system',
                            content: instance.systemPrompt
                        },
                        {
                            role: 'user',
                            content: instance.prompt.replace('{transcript}', transcript)
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'API request failed');
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

            // Parse JSON response
            let parsedData;
            try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsedData = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No JSON found');
                }
            } catch (parseError) {
                console.error('Error parsing AI response:', content);
                this.updateStatus(id, '<i class="fas fa-check-circle" style="color: #f59e0b;"></i> <span style="color: var(--text-primary);">Transcript captured. AI parsing failed.</span>');
                instance.onFill({ _transcript: transcript, _parseError: true });
                return;
            }

            // Call the onFill callback with parsed data
            parsedData._transcript = transcript;
            instance.onFill(parsedData);

            this.updateStatus(id, '<i class="fas fa-check-circle" style="color: #10b981;"></i> <span style="color: var(--text-primary);">Form auto-filled! Review and save.</span>');

        } catch (error) {
            console.error('Error processing with AI:', error);
            this.updateStatus(id, `<i class="fas fa-exclamation-circle" style="color: #f59e0b;"></i> <span style="color: var(--text-primary);">AI error: ${error.message}. Transcript captured.</span>`);
            instance.onFill({ _transcript: transcript, _error: error.message });
        }
    },

    // Cleanup an instance
    destroy: function(id) {
        const instance = this.instances[id];
        if (instance && instance.recognition) {
            try {
                instance.recognition.stop();
            } catch (e) {}
        }
        delete this.instances[id];
    }
};

// Make it globally available
window.VoiceAssistant = VoiceAssistant;

// ========== END REUSABLE VOICE ASSISTANT COMPONENT ==========

// Floating add button - simple scroll threshold approach
var FLOATING_ADD_SCROLL_THRESHOLD = 150; // pixels scrolled before buttons become fixed
var FLOATING_ADD_MOBILE_THRESHOLD = 50; // smaller threshold for mobile
var floatingAddScrollListener = null;
var floatingAddScrollTimeout = null;

function isMobileView() {
    return window.innerWidth <= 768;
}

function refreshFloatingAddButtons() {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    // Clean up existing listener
    if (floatingAddScrollListener) {
        window.removeEventListener('scroll', floatingAddScrollListener);
        floatingAddScrollListener = null;
    }

    // Simple scroll listener - fix buttons when scrolled past threshold
    floatingAddScrollListener = () => {
        const scrollY = window.scrollY || window.pageYOffset;
        const isMobile = isMobileView();
        const threshold = isMobile ? FLOATING_ADD_MOBILE_THRESHOLD : FLOATING_ADD_SCROLL_THRESHOLD;
        const shouldFix = scrollY > threshold;

        document.querySelectorAll('.floating-add-btn').forEach(button => {
            if (shouldFix) {
                button.classList.add('is-fixed');
                // Add is-scrolling class during active scroll (mobile optimization)
                button.classList.add('is-scrolling');
                // En mobile, agregar clase especial para flotante
                if (isMobile) {
                    button.classList.add('is-floating-mobile');
                }
            } else {
                button.classList.remove('is-fixed');
                button.classList.remove('is-scrolling');
                button.classList.remove('is-floating-mobile');
            }
        });

        // Remove is-scrolling class after scroll stops (150ms delay)
        if (floatingAddScrollTimeout) {
            clearTimeout(floatingAddScrollTimeout);
        }
        floatingAddScrollTimeout = setTimeout(() => {
            document.querySelectorAll('.floating-add-btn.is-scrolling').forEach(button => {
                button.classList.remove('is-scrolling');
            });
        }, 150);
    };

    window.addEventListener('scroll', floatingAddScrollListener, { passive: true });

    // Initial update
    floatingAddScrollListener();
}

function updateFloatingButtonsVisibility() {
    // Trigger scroll handler to update visibility
    if (floatingAddScrollListener) {
        floatingAddScrollListener();
    }
}

function ensureFloatingAddButtonFallback() {
    // This function is no longer needed but kept for compatibility
    return;
}

// Add CSS animation for password toast
const pwdToastStyles = document.createElement('style');
pwdToastStyles.textContent = `
    @keyframes pwdSlideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes pwdSlideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .password-item:hover {
        background: var(--bg-tertiary) !important;
    }
    .btn-icon:hover {
        background: var(--bg-tertiary) !important;
        transform: translateY(-1px);
    }
`;
document.head.appendChild(pwdToastStyles);

// =====================================================
// BARCODE LABELS MODULE
// =====================================================

function renderLabels() {
    const dashboard = document.querySelector('.dashboard');

    if (typeof renderLabelsPage === 'function') {
        dashboard.innerHTML = renderLabelsPage();
        // Initialize the labels module UI
        updateLabelQueueUI();
    } else {
        dashboard.innerHTML = `
            <div style="text-align: center; padding: 60px;">
                <i class="fas fa-exclamation-circle" style="font-size: 48px; color: var(--danger); margin-bottom: 16px;"></i>
                <h3>Labels Module Not Loaded</h3>
                <p style="color: var(--text-muted);">Please refresh the page to load the barcode labels module.</p>
            </div>
        `;
    }
}

