# LP赤ペン先生

LPデザインレビューWebアプリ。スコアなし、具体的な改善アクションだけを提供します。

## 設計思想

スコアや採点軸は一切設けない。ユーザーが「今すぐ動ける具体的な改善アクション」を得ることだけを目的とする。

- LP の目的・ターゲット入力を必須（コンテキストなしのレビューは表面的になるため）
- AI は Problem / Why / How / Before / After の5点セットで指摘
- 改善アクションは優先順位つきで3つに絞る
- 良い点（Strengths）も明示
- 最後に「今すぐひとつだけやるなら」を1行で示す

## ローカル起動手順

```bash
npm install
cp .env.local.example .env.local
# .env.local に ANTHROPIC_API_KEY を設定
npm run dev
```

ブラウザで http://localhost:3000 を開く

## APIキー取得先

- **Claude (Anthropic)**: 環境変数 `ANTHROPIC_API_KEY` を設定（.env.local）
- **OpenAI (ChatGPT)**: https://platform.openai.com/api-keys
- **Google (Gemini)**: https://aistudio.google.com/app/apikey

## Vercel デプロイ

```bash
vercel --prod
```

Vercel ダッシュボードの Settings > Environment Variables で `ANTHROPIC_API_KEY` を設定してください。
