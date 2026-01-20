import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './vanna-sidebar';
import './vanna-progress-tracker';

const meta: Meta = {
  title: 'Components/VannaSidebar',
  component: 'vanna-sidebar',
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
    theme: {
      control: 'select',
      options: ['dark', 'light'],
      description: 'Theme variant'
    },
    activeTab: {
      control: 'select',
      options: ['tasks', 'preview'],
      description: 'Active tab'
    },
    taskCount: {
      control: 'number',
      description: 'Badge count for tasks tab'
    },
    hasPreview: {
      control: 'boolean',
      description: 'Show preview badge'
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    theme: 'light',
    activeTab: 'tasks',
    taskCount: 0,
    hasPreview: false,
  },
  render: (args) => html`
    <div style="width: 320px; height: 500px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <vanna-sidebar
        theme=${args.theme}
        .activeTab=${args.activeTab}
        .taskCount=${args.taskCount}
        .hasPreview=${args.hasPreview}
        @tab-change=${(e: CustomEvent) => console.log('Tab changed:', e.detail)}
      >
        <vanna-progress-tracker slot="tasks" theme=${args.theme}></vanna-progress-tracker>
      </vanna-sidebar>
    </div>
  `,
};

export const WithTaskCount: Story = {
  args: {
    theme: 'light',
    activeTab: 'tasks',
    taskCount: 5,
    hasPreview: false,
  },
  render: (args) => html`
    <div style="width: 320px; height: 500px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <vanna-sidebar
        theme=${args.theme}
        .activeTab=${args.activeTab}
        .taskCount=${args.taskCount}
        .hasPreview=${args.hasPreview}
      >
        <vanna-progress-tracker slot="tasks" theme=${args.theme}></vanna-progress-tracker>
      </vanna-sidebar>
    </div>
  `,
};

export const PreviewTabActive: Story = {
  args: {
    theme: 'light',
    activeTab: 'preview',
    taskCount: 3,
    hasPreview: false,
  },
  render: (args) => html`
    <div style="width: 320px; height: 500px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <vanna-sidebar
        theme=${args.theme}
        .activeTab=${args.activeTab}
        .taskCount=${args.taskCount}
        .hasPreview=${args.hasPreview}
      >
        <vanna-progress-tracker slot="tasks" theme=${args.theme}></vanna-progress-tracker>
      </vanna-sidebar>
    </div>
    <p style="margin-top: 16px; color: #666; font-size: 12px;">
      Preview tab shows empty state when no content is set
    </p>
  `,
};

export const WithPreviewContent: Story = {
  args: {
    theme: 'light',
    activeTab: 'preview',
    taskCount: 2,
    hasPreview: true,
  },
  render: (args) => html`
    <div style="width: 320px; height: 500px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <vanna-sidebar
        id="sidebar-with-preview"
        theme=${args.theme}
        .activeTab=${args.activeTab}
        .taskCount=${args.taskCount}
        .hasPreview=${args.hasPreview}
        .previewContent=${{
          type: 'text',
          title: 'Sample Document',
          content: 'This is sample preview content that demonstrates the preview functionality.\n\nThe preview tab can display:\n- Plain text\n- HTML content\n- Iframe embeds\n\nContent can be set programmatically via the setPreviewContent() method or the previewContent property.'
        }}
        @preview-cleared=${() => console.log('Preview cleared')}
      >
        <vanna-progress-tracker slot="tasks" theme=${args.theme}></vanna-progress-tracker>
      </vanna-sidebar>
    </div>
  `,
};

export const WithHtmlPreview: Story = {
  args: {
    theme: 'light',
    activeTab: 'preview',
  },
  render: (args) => html`
    <div style="width: 320px; height: 500px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <vanna-sidebar
        theme=${args.theme}
        .activeTab=${args.activeTab}
        .hasPreview=${true}
        .previewContent=${{
          type: 'html',
          title: 'HTML Preview',
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 12px 0; color: #1e293b;">Document Title</h3>
              <p style="margin: 0 0 8px 0; color: #475569;">This is <strong>HTML content</strong> rendered in the preview tab.</p>
              <ul style="margin: 0; padding-left: 20px; color: #64748b;">
                <li>Supports formatting</li>
                <li>Lists and structure</li>
                <li>Custom styling</li>
              </ul>
            </div>
          `
        }}
      >
        <vanna-progress-tracker slot="tasks" theme=${args.theme}></vanna-progress-tracker>
      </vanna-sidebar>
    </div>
  `,
};

export const DarkTheme: Story = {
  args: {
    theme: 'dark',
    activeTab: 'tasks',
    taskCount: 3,
    hasPreview: true,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: (args) => html`
    <div style="width: 320px; height: 500px; border: 1px solid #374151; border-radius: 8px; overflow: hidden;">
      <vanna-sidebar
        theme=${args.theme}
        .activeTab=${args.activeTab}
        .taskCount=${args.taskCount}
        .hasPreview=${args.hasPreview}
      >
        <vanna-progress-tracker slot="tasks" theme=${args.theme}></vanna-progress-tracker>
      </vanna-sidebar>
    </div>
  `,
};

export const InteractiveDemo: Story = {
  args: {
    theme: 'light',
  },
  render: (args) => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="width: 320px; height: 400px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <vanna-sidebar
          id="interactive-sidebar"
          theme=${args.theme}
          @tab-change=${(e: CustomEvent) => console.log('Tab:', e.detail)}
          @preview-loaded=${(e: CustomEvent) => console.log('Preview loaded:', e.detail)}
          @preview-cleared=${() => console.log('Preview cleared')}
        >
          <vanna-progress-tracker slot="tasks" theme=${args.theme}></vanna-progress-tracker>
        </vanna-sidebar>
      </div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button
          style="padding: 8px 16px; border-radius: 6px; border: 1px solid #e2e8f0; background: white; cursor: pointer;"
          @click=${() => {
            const sidebar = document.getElementById('interactive-sidebar') as any;
            sidebar?.setPreviewContent({
              type: 'text',
              title: 'Sample Text',
              content: 'This is dynamically set text content.\n\nClick "Clear Preview" to remove it.'
            });
            sidebar?.switchTab('preview');
          }}
        >
          Set Text Preview
        </button>
        <button
          style="padding: 8px 16px; border-radius: 6px; border: 1px solid #e2e8f0; background: white; cursor: pointer;"
          @click=${() => {
            const sidebar = document.getElementById('interactive-sidebar') as any;
            sidebar?.setPreviewContent({
              type: 'html',
              title: 'HTML Content',
              content: '<div style="padding: 8px;"><h4>HTML Preview</h4><p style="color: #3877c6;">Styled content works!</p></div>'
            });
            sidebar?.switchTab('preview');
          }}
        >
          Set HTML Preview
        </button>
        <button
          style="padding: 8px 16px; border-radius: 6px; border: 1px solid #e2e8f0; background: white; cursor: pointer;"
          @click=${() => {
            const sidebar = document.getElementById('interactive-sidebar') as any;
            sidebar?.clearPreview();
          }}
        >
          Clear Preview
        </button>
        <button
          style="padding: 8px 16px; border-radius: 6px; border: 1px solid #e2e8f0; background: white; cursor: pointer;"
          @click=${() => {
            const sidebar = document.getElementById('interactive-sidebar') as any;
            sidebar?.switchTab('tasks');
          }}
        >
          Show Tasks
        </button>
      </div>

      <p style="color: #666; font-size: 12px; margin: 0;">
        Check console for events. Use buttons to interact with the sidebar programmatically.
      </p>
    </div>
  `,
};
