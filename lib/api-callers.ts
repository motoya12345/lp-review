import { Provider } from "./types";

export const PROVIDERS: Provider[] = [
  {
    id: "claude", name: "Claude", needsKey: false,
    color: "#c8291e", note: "APIキー不要",
    models: [
      { id: "claude-sonnet-4-6", label: "Sonnet 4.6" },
      { id: "claude-opus-4-6",   label: "Opus 4.6"   },
      { id: "claude-haiku-4-5",  label: "Haiku 4.5"  },
    ],
  },
  {
    id: "openai", name: "ChatGPT", needsKey: true,
    color: "#16a37f", note: "OpenAI APIキーが必要",
    models: [
      { id: "gpt-4o",      label: "GPT-4o"      },
      { id: "gpt-4o-mini", label: "GPT-4o mini" },
    ],
  },
  {
    id: "gemini", name: "Gemini", needsKey: true,
    color: "#1a52a0", note: "Google APIキーが必要",
    models: [
      { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
      { id: "gemini-1.5-pro",   label: "Gemini 1.5 Pro"   },
    ],
  },
];
