import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { vannaDesignTokens } from '../styles/vanna-design-tokens.js';

export interface SidebarTab {
  id: string;
  label: string;
  icon?: TemplateResult;
}

export interface PreviewContent {
  type: 'html' | 'text' | 'iframe';
  content: string;
  title?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Sidebar component with tabbed navigation.
 * Supports Tasks (progress tracker) and Preview tabs.
 * Preview tab can receive external content via properties, methods, or events.
 *
 * @fires tab-change - Fired when active tab changes
 * @fires preview-loaded - Fired when preview content is set
 * @fires preview-cleared - Fired when preview content is cleared
 *
 * @slot tasks - Content for the Tasks tab (default: progress tracker)
 * @slot preview - Custom content for Preview tab (overrides previewContent)
 */
@customElement('vanna-sidebar')
export class VannaSidebar extends LitElement {
  static styles = [
    vannaDesignTokens,
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, rgba(15, 23, 42, 0.02) 100%);
        font-family: var(--vanna-font-family-default);
        overflow: hidden;
      }

      :host([theme="dark"]) {
        background: linear-gradient(180deg, rgba(79, 70, 229, 0.22) 0%, rgba(15, 23, 42, 0.45) 100%);
      }

      /* Tab Bar */
      .tab-bar {
        display: flex;
        gap: var(--vanna-space-1);
        padding: var(--vanna-space-2) var(--vanna-space-3);
        background: var(--vanna-background-root);
        border-bottom: 1px solid var(--vanna-outline-default);
        flex-shrink: 0;
      }

      .tab-button {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--vanna-space-2);
        padding: var(--vanna-space-2) var(--vanna-space-3);
        border: none;
        background: transparent;
        border-radius: var(--vanna-border-radius-md);
        font-family: var(--vanna-font-family-default);
        font-size: 12px;
        font-weight: 500;
        color: var(--vanna-foreground-dimmer);
        cursor: pointer;
        transition: all var(--vanna-duration-150) ease;
        position: relative;
      }

      .tab-button:hover:not(.active) {
        background: var(--vanna-background-higher);
        color: var(--vanna-foreground-default);
      }

      .tab-button.active {
        background: var(--vanna-accent-primary-subtle);
        color: var(--vanna-accent-primary-default);
      }

      .tab-button.active::after {
        content: '';
        position: absolute;
        bottom: -9px;
        left: 50%;
        transform: translateX(-50%);
        width: 24px;
        height: 2px;
        background: var(--vanna-accent-primary-default);
        border-radius: 1px;
      }

      .tab-button svg {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
      }

      .tab-badge {
        min-width: 16px;
        height: 16px;
        padding: 0 var(--vanna-space-1);
        border-radius: 8px;
        background: var(--vanna-accent-primary-default);
        color: white;
        font-size: 10px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .tab-badge.empty {
        display: none;
      }

      /* Tab Content */
      .tab-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .tab-panel {
        display: none;
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: var(--vanna-space-4);
      }

      .tab-panel.active {
        display: flex;
        flex-direction: column;
      }

      .tab-panel::-webkit-scrollbar {
        width: 6px;
      }

      .tab-panel::-webkit-scrollbar-track {
        background: transparent;
      }

      .tab-panel::-webkit-scrollbar-thumb {
        background: var(--vanna-outline-default);
        border-radius: var(--vanna-border-radius-full);
      }

      /* Preview Content Styles */
      .preview-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: var(--vanna-space-8);
        color: var(--vanna-foreground-dimmest);
        flex: 1;
      }

      .preview-empty-icon {
        width: 48px;
        height: 48px;
        margin-bottom: var(--vanna-space-4);
        opacity: 0.5;
      }

      .preview-empty-text {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: var(--vanna-space-2);
      }

      .preview-empty-hint {
        font-size: 12px;
        opacity: 0.7;
      }

      .preview-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--vanna-space-3);
        background: var(--vanna-background-root);
        border-bottom: 1px solid var(--vanna-outline-dimmer);
        border-radius: var(--vanna-border-radius-md) var(--vanna-border-radius-md) 0 0;
        margin-bottom: var(--vanna-space-3);
      }

      .preview-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--vanna-foreground-default);
        display: flex;
        align-items: center;
        gap: var(--vanna-space-2);
      }

      .preview-close {
        width: 24px;
        height: 24px;
        border: none;
        background: transparent;
        border-radius: var(--vanna-border-radius-sm);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--vanna-foreground-dimmer);
        transition: all var(--vanna-duration-150) ease;
      }

      .preview-close:hover {
        background: var(--vanna-accent-negative-subtle);
        color: var(--vanna-accent-negative-default);
      }

      /* Preview width expansion animation */
      @keyframes previewExpand {
        from {
          width: 0%;
          opacity: 0;
        }
        to {
          width: 100%;
          opacity: 1;
        }
      }

      .preview-body {
        flex: 1;
        width: 100%;
        overflow: auto;
        background: var(--vanna-background-root);
        border-radius: var(--vanna-border-radius-md);
        border: 1px solid var(--vanna-outline-dimmer);
        box-sizing: border-box;
        animation: previewExpand 300ms ease-out forwards;
      }

      .preview-text {
        width: 100%;
        padding: var(--vanna-space-4);
        font-size: 13px;
        line-height: 1.6;
        color: var(--vanna-foreground-default);
        white-space: pre-wrap;
        word-break: break-word;
        box-sizing: border-box;
      }

      .preview-html {
        width: 100%;
        padding: var(--vanna-space-4);
        font-size: 13px;
        line-height: 1.6;
        color: var(--vanna-foreground-default);
        box-sizing: border-box;
      }

      .preview-iframe {
        width: 100%;
        height: 100%;
        border: none;
        border-radius: var(--vanna-border-radius-md);
      }

      /* Slotted content */
      ::slotted(*) {
        width: 100%;
      }
    `
  ];

  /** Theme: 'light' or 'dark' */
  @property({ type: String, reflect: true })
  theme: 'light' | 'dark' = 'light';

  /** Currently active tab ID */
  @property({ type: String })
  activeTab = 'tasks';

  /** Preview content to display */
  @property({ type: Object })
  previewContent: PreviewContent | null = null;

  /** Badge count for tasks tab */
  @property({ type: Number })
  taskCount = 0;

  /** Show preview notification badge */
  @property({ type: Boolean })
  hasPreview = false;

  /** Animation key to force re-render and trigger animation */
  @state()
  private _animationKey = 0;

  /** Available tabs */
  @state()
  private _tabs: SidebarTab[] = [
    {
      id: 'tasks',
      label: 'Tasks',
      icon: html`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM17.99 9l-1.41-1.42-6.59 6.59-2.58-2.57-1.42 1.41 4 3.99z"/></svg>`
    },
    {
      id: 'preview',
      label: 'Preview',
      icon: html`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`
    }
  ];

  /** Switch to a specific tab */
  public switchTab(tabId: string) {
    if (this._tabs.some(t => t.id === tabId)) {
      const previousTab = this.activeTab;
      this.activeTab = tabId;

      if (previousTab !== tabId) {
        this.dispatchEvent(new CustomEvent('tab-change', {
          detail: { tabId, previousTab },
          bubbles: true,
          composed: true
        }));
      }
    }
  }

  /** Set preview content programmatically */
  public setPreviewContent(content: PreviewContent) {
    this.previewContent = content;
    this.hasPreview = true;
    // Increment animation key to force a fresh element and trigger animation
    this._animationKey++;

    this.dispatchEvent(new CustomEvent('preview-loaded', {
      detail: content,
      bubbles: true,
      composed: true
    }));
  }

  /** Clear preview content */
  public clearPreview() {
    this.previewContent = null;
    this.hasPreview = false;

    this.dispatchEvent(new CustomEvent('preview-cleared', {
      bubbles: true,
      composed: true
    }));
  }

  /** Set preview and switch to preview tab */
  public showPreview(content: PreviewContent) {
    this.setPreviewContent(content);
    this.switchTab('preview');
  }

  private _handleTabClick(tabId: string) {
    this.switchTab(tabId);
  }

  private _handlePreviewClose() {
    this.clearPreview();
    this.switchTab('tasks');
  }

  private _renderTabButton(tab: SidebarTab) {
    const isActive = this.activeTab === tab.id;
    const badge = tab.id === 'tasks' && this.taskCount > 0
      ? html`<span class="tab-badge">${this.taskCount}</span>`
      : tab.id === 'preview' && this.hasPreview
        ? html`<span class="tab-badge">1</span>`
        : '';

    return html`
      <button
        class="tab-button ${isActive ? 'active' : ''}"
        @click=${() => this._handleTabClick(tab.id)}
        aria-selected=${isActive}
        role="tab"
      >
        ${tab.icon}
        <span>${tab.label}</span>
        ${badge}
      </button>
    `;
  }

  private _renderPreviewContent() {
    if (!this.previewContent) {
      return html`
        <div class="preview-empty">
          <svg class="preview-empty-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/>
          </svg>
          <div class="preview-empty-text">No preview content</div>
          <div class="preview-empty-hint">Content will appear here when available</div>
        </div>
      `;
    }

    const { type, content, title } = this.previewContent;

    return html`
      ${title ? html`
        <div class="preview-header">
          <span class="preview-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
            </svg>
            ${title}
          </span>
          <button class="preview-close" @click=${this._handlePreviewClose} aria-label="Close preview">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      ` : ''}
      <div class="preview-body" key=${this._animationKey}>
        ${type === 'text' ? html`
          <div class="preview-text">${content}</div>
        ` : type === 'html' ? html`
          <div class="preview-html">${unsafeHTML(content)}</div>
        ` : type === 'iframe' ? html`
          <iframe class="preview-iframe" src=${content} sandbox="allow-scripts allow-same-origin"></iframe>
        ` : ''}
      </div>
    `;
  }

  render() {
    return html`
      <div class="tab-bar" role="tablist">
        ${this._tabs.map(tab => this._renderTabButton(tab))}
      </div>

      <div class="tab-content">
        <div
          class="tab-panel ${this.activeTab === 'tasks' ? 'active' : ''}"
          role="tabpanel"
          aria-labelledby="tab-tasks"
        >
          <slot name="tasks">
            <!-- Default: progress tracker will be slotted here -->
          </slot>
        </div>

        <div
          class="tab-panel ${this.activeTab === 'preview' ? 'active' : ''}"
          role="tabpanel"
          aria-labelledby="tab-preview"
        >
          <slot name="preview">
            ${this._renderPreviewContent()}
          </slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vanna-sidebar': VannaSidebar;
  }
}
