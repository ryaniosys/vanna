import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './vanna-voice-input';

const meta: Meta = {
  title: 'Components/VannaVoiceInput',
  component: 'vanna-voice-input',
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'dark', value: 'rgb(11, 15, 25)' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  argTypes: {
    disabled: { control: 'boolean' },
    showStatus: { control: 'boolean' },
    lang: { control: 'text' },
    maxDuration: { control: 'number' },
    theme: {
      control: 'select',
      options: ['dark', 'light'],
      description: 'Theme variant'
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    disabled: false,
    showStatus: true,
    lang: 'en-US',
    maxDuration: 60000,
    theme: 'light',
  },
  render: (args) => html`
    <div style="padding: 40px;">
      <vanna-voice-input
        ?disabled=${args.disabled}
        ?showStatus=${args.showStatus}
        .lang=${args.lang}
        .maxDuration=${args.maxDuration}
        theme=${args.theme}
        @voice-result=${(e: CustomEvent) => console.log('Voice result:', e.detail)}
        @voice-error=${(e: CustomEvent) => console.log('Voice error:', e.detail)}
        @voice-start=${() => console.log('Recording started')}
        @voice-end=${() => console.log('Recording ended')}
      ></vanna-voice-input>
      <p style="margin-top: 20px; color: #666; font-size: 12px;">
        Click the microphone button to start voice input.<br>
        Check console for events.
      </p>
    </div>
  `,
};

export const Disabled: Story = {
  args: {
    disabled: true,
    showStatus: true,
    theme: 'light',
  },
  render: (args) => html`
    <div style="padding: 40px;">
      <vanna-voice-input
        ?disabled=${args.disabled}
        ?showStatus=${args.showStatus}
        theme=${args.theme}
      ></vanna-voice-input>
      <p style="margin-top: 20px; color: #666; font-size: 12px;">
        Voice input is disabled
      </p>
    </div>
  `,
};

export const DarkTheme: Story = {
  args: {
    disabled: false,
    showStatus: true,
    theme: 'dark',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: (args) => html`
    <div style="padding: 40px;">
      <vanna-voice-input
        ?disabled=${args.disabled}
        ?showStatus=${args.showStatus}
        theme=${args.theme}
        @voice-result=${(e: CustomEvent) => console.log('Voice result:', e.detail)}
      ></vanna-voice-input>
      <p style="margin-top: 20px; color: #888; font-size: 12px;">
        Dark theme variant
      </p>
    </div>
  `,
};

export const WithoutStatus: Story = {
  args: {
    disabled: false,
    showStatus: false,
    theme: 'light',
  },
  render: (args) => html`
    <div style="padding: 40px;">
      <vanna-voice-input
        ?disabled=${args.disabled}
        ?showStatus=${args.showStatus}
        theme=${args.theme}
        @voice-result=${(e: CustomEvent) => console.log('Voice result:', e.detail)}
      ></vanna-voice-input>
      <p style="margin-top: 20px; color: #666; font-size: 12px;">
        Status messages hidden (used when integrated into vanna-chat)
      </p>
    </div>
  `,
};

export const InChatContext: Story = {
  args: {
    theme: 'light',
  },
  render: (args) => html`
    <div style="padding: 20px; background: #f5f5f5; border-radius: 12px;">
      <p style="margin-bottom: 10px; color: #333; font-size: 14px;">Simulated chat input area:</p>
      <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: white; border-radius: 24px; border: 1px solid #e5e7eb;">
        <input
          type="text"
          placeholder="Type a message..."
          style="flex: 1; border: none; outline: none; padding: 12px; font-size: 14px;"
          id="demo-input"
        />
        <vanna-voice-input
          theme=${args.theme}
          .showStatus=${false}
          @voice-result=${(e: CustomEvent) => {
            const input = document.getElementById('demo-input') as HTMLInputElement;
            if (input) input.value = e.detail.transcript;
          }}
        ></vanna-voice-input>
        <button style="width: 48px; height: 48px; border-radius: 50%; border: none; background: linear-gradient(135deg, #15a8a8, #023d60); color: white; cursor: pointer;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  `,
};
