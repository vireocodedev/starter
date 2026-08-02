import { RgoVideoStreamPlayer } from "@/components/data-display/RgoVideoStreamPlayer/RgoVideoStreamPlayer";
import {
  RgoVideoStreamPlayerWithAutoStartControlDemo,
  RgoVideoStreamPlayerWithAutoStartControlDemoCode,
} from "@/components/data-display/RgoVideoStreamPlayer/stories/RgoVideoStreamPlayerWithAutoStartControlDemo";
import {
  RgoVideoStreamPlayerWithCustomStylesDemo,
  RgoVideoStreamPlayerWithCustomStylesDemoCode,
} from "@/components/data-display/RgoVideoStreamPlayer/stories/RgoVideoStreamPlayerWithCustomStylesDemo";
import {
  RgoVideoStreamPlayerWithDefaultsDemo,
  RgoVideoStreamPlayerWithDefaultsDemoCode,
} from "@/components/data-display/RgoVideoStreamPlayer/stories/RgoVideoStreamPlayerWithDefaultsDemo";
import {
  RgoVideoStreamPlayerWithDifferentSizesDemo,
  RgoVideoStreamPlayerWithDifferentSizesDemoCode,
} from "@/components/data-display/RgoVideoStreamPlayer/stories/RgoVideoStreamPlayerWithDifferentSizesDemo";
import {
  RgoVideoStreamPlayerWithErrorHandlingDemo,
  RgoVideoStreamPlayerWithErrorHandlingDemoCode,
} from "@/components/data-display/RgoVideoStreamPlayer/stories/RgoVideoStreamPlayerWithErrorHandlingDemo";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A video stream player component that uses OvenPlayer to display WebRTC video streams. Supports configurable dimensions, auto-start functionality, and handles stream URLs for real-time video playback.

## Stories

- [With default props](#with-default-props)
- [With all available props](#with-all-args)
- [With auto-start control](#with-auto-start-control)
- [With different sizes](#with-different-sizes)
- [With custom styles](#with-custom-styles)
- [With error handling](#with-error-handling)

## Local Stream Setup Guide

To test the RgoVideoStreamPlayer with a custom stream, follow these steps to set up a local test stream:

### Step 1: Install FFmpeg

Install FFmpeg on your system. You can download it from [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html) or use your package manager:

\`\`\`bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
\`\`\`

### Step 2: Start the Test Stream

Run this command to start a test stream with generated video and audio:

\`\`\`
ffmpeg -re -f lavfi -i testsrc=size=1280x720:rate=30 -f lavfi -i sine=frequency=1000:sample_rate=44100 -c:v libx264 -preset veryfast -tune zerolatency -c:a aac -ar 44100 -b:a 128k -pix_fmt yuv420p -f flv rtmp://88.198.9.184:1935/app/testing-stream
\`\`\`

### Step 3: Accept SSL Certificate

Open [https://88.198.9.184:3334/app](https://88.198.9.184:3334/app) in your browser and accept the SSL certificate when prompted. This is required for the WebSocket connection to work.

**Ready!** Your test stream should now be available at the demo URL used in the stories below. The stream will show a test pattern with moving elements and a 1kHz tone.`;

const meta: Meta<typeof RgoVideoStreamPlayer> = {
  title: "Components/Data display/RgoVideoStreamPlayer",
  component: RgoVideoStreamPlayer,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    url: {
      control: "text",
      description: "The WebRTC stream URL to play. Required for the video player to function.",
    },
    autoStart: {
      control: "boolean",
      description: "Whether the video should start playing automatically when loaded. Defaults to true.",
    },
    width: {
      control: { type: "text" },
      description: "Width of the video player. Can be a string (e.g., 100%, 400px) or a number (pixels).",
      table: {
        type: { summary: "string | number" },
        defaultValue: { summary: "100%" },
      },
    },
    height: {
      control: { type: "text" },
      description: "Height of the video player. Can be a string (e.g., 300px, 50vh) or a number (pixels).",
      table: {
        type: { summary: "string | number" },
        defaultValue: { summary: "100%" },
      },
    },
    initialVolume: {
      control: "number",
      description: "Initial volume level for the video player. Muted by default.",
    },
    sx: {
      control: false,
      description: "Custom styles for the video player container. Use MUI's SxProps format to apply styles.",
      table: {
        type: { summary: "SxProps" },
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

type StoryArgs = NonNullable<Story["args"]>;

const STORY_ARGS: StoryArgs = {
  url: "wss://88.198.9.184:3334/app/testing-stream",
  autoStart: true,
  width: "100%",
  height: "100%",
  initialVolume: 0,
  sx: {},
};

export const WithDefaultProps: Story = {
  name: "With default props",
  args: STORY_ARGS,
  render: args => <RgoVideoStreamPlayerWithDefaultsDemo {...args} />,
  parameters: {
    docs: {
      source: {
        code: RgoVideoStreamPlayerWithDefaultsDemoCode,
      },
    },
  },
};

export const WithAutoStartControl: Story = {
  name: "With auto-start control",
  render: () => <RgoVideoStreamPlayerWithAutoStartControlDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Examples demonstrating the auto-start functionality. When disabled, users need to manually start playback.",
      },
      source: {
        code: RgoVideoStreamPlayerWithAutoStartControlDemoCode,
      },
    },
  },
};

export const WithDifferentSizes: Story = {
  name: "With different sizes",
  render: () => <RgoVideoStreamPlayerWithDifferentSizesDemo />,
  parameters: {
    docs: {
      description: {
        story: "Examples showing different video player sizes using various width and height configurations.",
      },
      source: {
        code: RgoVideoStreamPlayerWithDifferentSizesDemoCode,
      },
    },
  },
};

export const WithCustomStyles: Story = {
  name: "With custom styles",
  render: () => <RgoVideoStreamPlayerWithCustomStylesDemo />,
  parameters: {
    docs: {
      description: {
        story: "Example showcasing custom styling using the sx property.",
      },
      source: {
        code: RgoVideoStreamPlayerWithCustomStylesDemoCode,
      },
    },
  },
};

export const WithErrorHandling: Story = {
  name: "With error handling",
  render: () => <RgoVideoStreamPlayerWithErrorHandlingDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Example demonstrating how the component handles invalid or unreachable stream URLs. The player should display an error message with retry button when the stream cannot be loaded.",
      },
      source: {
        code: RgoVideoStreamPlayerWithErrorHandlingDemoCode,
      },
    },
  },
};
