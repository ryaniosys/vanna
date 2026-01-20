import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { vannaDesignTokens } from '../styles/vanna-design-tokens.js';

// Web Speech API type declarations
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;
  onstart: ((event: Event) => void) | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const webkitSpeechRecognition: { new (): SpeechRecognition } | undefined;

/**
 * Voice input component for speech-to-text functionality.
 * Can be used standalone or integrated into vanna-chat.
 *
 * @fires voice-result - Fired when speech recognition produces a result
 * @fires voice-error - Fired when an error occurs during recognition
 * @fires voice-start - Fired when recording starts
 * @fires voice-end - Fired when recording ends
 */
@customElement('vanna-voice-input')
export class VannaVoiceInput extends LitElement {
  static styles = [
    vannaDesignTokens,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        gap: var(--vanna-space-2);
      }

      .voice-button {
        width: 48px;
        height: 48px;
        border-radius: var(--vanna-border-radius-full);
        border: 2px solid var(--vanna-outline-default);
        background: var(--vanna-background-root);
        color: var(--vanna-foreground-dimmer);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all var(--vanna-duration-200) ease;
      }

      .voice-button:hover:not(:disabled) {
        border-color: var(--vanna-accent-primary-default);
        background: var(--vanna-accent-primary-subtle);
        color: var(--vanna-accent-primary-default);
      }

      .voice-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .voice-button.recording {
        border-color: var(--vanna-accent-negative-default);
        background: var(--vanna-accent-negative-subtle);
        color: var(--vanna-accent-negative-default);
        animation: voice-pulse 1.5s ease-in-out infinite;
      }

      @keyframes voice-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      .voice-button svg {
        width: 18px;
        height: 18px;
      }

      .voice-status {
        font-family: var(--vanna-font-family-default);
        font-size: 12px;
        padding: var(--vanna-space-1) var(--vanna-space-3);
        border-radius: var(--vanna-border-radius-sm);
        background: rgba(0, 0, 0, 0.75);
        color: #fff;
        text-align: center;
        opacity: 0;
        transform: translateY(-4px);
        transition: opacity var(--vanna-duration-200) ease, transform var(--vanna-duration-200) ease;
      }

      .voice-status.visible {
        opacity: 1;
        transform: translateY(0);
      }

      .voice-status.error {
        background: var(--vanna-accent-negative-stronger);
      }

      :host([theme="dark"]) .voice-button {
        background: var(--vanna-background-higher);
        border-color: var(--vanna-outline-dimmer);
      }

      :host([theme="dark"]) .voice-button:hover:not(:disabled) {
        background: var(--vanna-accent-primary-subtle);
      }

      @media (prefers-reduced-motion: reduce) {
        .voice-button.recording {
          animation: none;
          border-width: 3px;
        }
      }

      /* Hidden state when speech recognition not supported */
      :host(.unsupported) {
        display: none;
      }
    `
  ];

  /** Whether the button is disabled */
  @property({ type: Boolean })
  disabled = false;

  /** Theme: 'light' or 'dark' */
  @property({ type: String, reflect: true })
  theme: 'light' | 'dark' = 'light';

  /** Language for speech recognition (BCP 47 format) */
  @property({ type: String })
  lang = 'en-US';

  /** Maximum recording duration in milliseconds */
  @property({ type: Number })
  maxDuration = 60000;

  /** Whether to show status messages */
  @property({ type: Boolean })
  showStatus = true;

  /** Whether currently recording */
  @state()
  private _isRecording = false;

  /** Current status message */
  @state()
  private _statusMessage = '';

  /** Whether status is an error */
  @state()
  private _isError = false;

  /** Whether status is visible */
  @state()
  private _statusVisible = false;

  private _recognition: SpeechRecognition | null = null;
  private _maxTimer: ReturnType<typeof setTimeout> | null = null;
  private _statusTimer: ReturnType<typeof setTimeout> | null = null;
  private _supported = false;

  constructor() {
    super();
    // Check for SpeechRecognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this._supported = !!SpeechRecognition;

    if (this._supported) {
      this._recognition = new SpeechRecognition();
      this._setupRecognition();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this._supported) {
      this.classList.add('unsupported');
    }
  }

  private _setupRecognition() {
    if (!this._recognition) return;

    this._recognition.interimResults = false;
    this._recognition.continuous = false;

    this._recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;

      this.dispatchEvent(new CustomEvent('voice-result', {
        detail: { transcript, confidence },
        bubbles: true,
        composed: true
      }));

      this._showStatus('Review and press Enter to send');
    };

    this._recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const messages: Record<string, string> = {
        'not-allowed': 'Microphone access denied. Enable in browser settings.',
        'no-speech': 'No speech detected. Try again.',
        'audio-capture': 'No microphone found.',
        'network': 'Network error. Check your connection.',
        'aborted': 'Recording cancelled.',
      };

      const message = messages[event.error] || 'Error occurred. Try again.';
      this._showStatus(message, true);

      this.dispatchEvent(new CustomEvent('voice-error', {
        detail: { error: event.error, message },
        bubbles: true,
        composed: true
      }));
    };

    this._recognition.onend = () => {
      this._isRecording = false;
      this._clearMaxTimer();

      this.dispatchEvent(new CustomEvent('voice-end', {
        bubbles: true,
        composed: true
      }));
    };

    this._recognition.onstart = () => {
      this.dispatchEvent(new CustomEvent('voice-start', {
        bubbles: true,
        composed: true
      }));
    };
  }

  private _toggleRecording() {
    if (!this._recognition || this.disabled) return;

    if (this._isRecording) {
      this._stopRecording();
    } else {
      this._startRecording();
    }
  }

  private _startRecording() {
    if (!this._recognition) return;

    try {
      this._recognition.lang = this.lang;
      this._recognition.start();
      this._isRecording = true;
      this._showStatus('Listening...');

      // Set max duration timer
      this._maxTimer = setTimeout(() => {
        this._stopRecording();
      }, this.maxDuration);
    } catch (e) {
      console.error('Failed to start voice recognition:', e);
      this._showStatus('Failed to start recording', true);
    }
  }

  private _stopRecording() {
    if (!this._recognition) return;

    this._recognition.stop();
    this._clearMaxTimer();
  }

  private _clearMaxTimer() {
    if (this._maxTimer) {
      clearTimeout(this._maxTimer);
      this._maxTimer = null;
    }
  }

  private _showStatus(message: string, isError = false) {
    if (!this.showStatus) return;

    this._statusMessage = message;
    this._isError = isError;
    this._statusVisible = true;

    // Clear previous timer
    if (this._statusTimer) {
      clearTimeout(this._statusTimer);
    }

    // Auto-hide after 4 seconds (unless error)
    if (!isError) {
      this._statusTimer = setTimeout(() => {
        this._statusVisible = false;
      }, 4000);
    }
  }

  /** Programmatically start recording */
  public startRecording() {
    if (!this._isRecording) {
      this._startRecording();
    }
  }

  /** Programmatically stop recording */
  public stopRecording() {
    if (this._isRecording) {
      this._stopRecording();
    }
  }

  /** Check if speech recognition is supported */
  public get isSupported(): boolean {
    return this._supported;
  }

  /** Check if currently recording */
  public get isRecording(): boolean {
    return this._isRecording;
  }

  render() {
    if (!this._supported) {
      return html``;
    }

    return html`
      <button
        class="voice-button ${this._isRecording ? 'recording' : ''}"
        type="button"
        aria-label="${this._isRecording ? 'Stop recording' : 'Start voice input'}"
        aria-pressed="${this._isRecording}"
        ?disabled=${this.disabled}
        @click=${this._toggleRecording}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      </button>
      ${this.showStatus ? html`
        <span class="voice-status ${this._statusVisible ? 'visible' : ''} ${this._isError ? 'error' : ''}">
          ${this._statusMessage}
        </span>
      ` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vanna-voice-input': VannaVoiceInput;
  }
}
