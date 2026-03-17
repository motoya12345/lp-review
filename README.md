# LP赤ペン先生 エージェント版

LPデザインレビューWebアプリ。スコアなし、根拠つきの具体的な改善アクションだけを提供します。

## アーキテクチャ

```
① LPのURLまたは画像を受け取る
② Fetch Agent   → URLをクロールして見出し・CTAテキストを取得  (MCP: Fetch)
③ Research Agent → 競合・業界事例をWeb検索                   (MCP: Brave Search)
④ UX / Copy / CRO Agent → 3エージェントが並列で分析
⑤ Synthesis Agent → 全結果を統合・優先順位をつける
⑥ Memory MCP    → レビュー履歴を保存し前回比較を可能にする   (MCP: Memory)
⑦ 根拠つき・Before/After付きのレビューを返す
```

進捗はServer-Sent Events（SSE）でリアルタイムにUIへ配信されます。

## 設計思想

スコアや採点軸は一切設けない。ユーザーが「今すぐ動ける具体的な改善アクション」を得ることだけを目的とする。

- LPの目的・ターゲット入力を必須（コンテキストなしのレビューは表面的になるため）
- AIは Problem / Why / How / Before / After / **Evidence** の6点セットで指摘
- 改善アクションは優先順位つきで3つに絞る
- 良い点（Strengths）も明示
- 最後に「今すぐひとつだけやるなら」を1行で示す

## ディレクトリ構成

```
lp-review/
├── app/
│   ├── page.tsx                  # メインUI（SSE受信・エージェント進捗表示）
│   └── api/
│       ├── review/route.ts       # SSEエントリポイント → Orchestratorを呼ぶ
│       └── history/route.ts      # 過去レビュー履歴の取得
├── components/
│   ├── AgentProgress.tsx         # エージェント進捗UI（idle/running/done/error）
│   ├── ResearchPanel.tsx         # 調査根拠・参照URLの表示
│   ├── HistoryPanel.tsx          # 過去レビュー履歴一覧
│   ├── InputPhase.tsx            # 入力フォーム（URL or 画像）
│   ├── ResultPhase.tsx           # レビュー結果表示
│   ├── ActionCard.tsx            # 改善アクション（Evidence対応）
│   └── ...
├── lib/
│   ├── agents/
│   │   ├── ai-client.ts          # Claude / OpenAI / Gemini 共通呼び出し
│   │   ├── orchestrator.ts       # エージェントループ管理
│   │   ├── research-agent.ts     # 競合・事例調査
│   │   ├── fetch-agent.ts        # URLクロール
│   │   ├── ux-agent.ts           # UX・視線誘導分析
│   │   ├── copy-agent.ts         # コピーライティング分析
│   │   ├── cro-agent.ts          # CVR・CTA分析
│   │   └── synthesis-agent.ts    # 全結果の統合
│   └── mcp/
│       ├── brave-search.ts       # Brave Search API
│       ├── fetch-mcp.ts          # cheerioによるHTMLパース
│       └── memory-mcp.ts         # JSONファイルへの履歴保存
```

## ローカル起動手順

```bash
npm install

# .env.local を作成して環境変数を設定
cp .env.local.example .env.local   # ファイルがない場合は手動で作成
npm run dev
```

ブラウザで http://localhost:3000 を開く

## 環境変数

| 変数名 | 必須 | 説明 |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Claude使用時に必要。Anthropic Consoleで取得 |
| `BRAVE_SEARCH_API_KEY` | 任意 | Research Agentの競合調査に使用。未設定の場合はスキップ |

## APIキー取得先

- **Claude (Anthropic)**: https://console.anthropic.com/settings/keys
- **OpenAI (ChatGPT)**: https://platform.openai.com/api-keys
- **Google (Gemini)**: https://aistudio.google.com/app/apikey
- **Brave Search**: https://brave.com/search/api/

> ChatGPT・Geminiのキーはブラウザ上のUIから入力します（.env.localへの設定は不要）。

## 対応AIモデル

| プロバイダー | モデル |
|---|---|
| **Claude** | Sonnet 4.6 / Opus 4.6 / Haiku 4.5 |
| **ChatGPT** | GPT-4o / GPT-4o mini |
| **Gemini** | Gemini 2.0 Flash / Gemini 1.5 Pro |

## Vercel デプロイ

```bash
vercel --prod
```

Vercel ダッシュボードの **Settings > Environment Variables** で以下を設定してください：

- `ANTHROPIC_API_KEY`
- `BRAVE_SEARCH_API_KEY`（任意）

## 実装ロードマップ

| Phase | 内容 | 状態 |
|---|---|---|
| Phase 1 | Fetch Agent（URLクロール） | ✅ 完了 |
| Phase 2 | Research Agent（Brave Search連携） | ✅ 完了 |
| Phase 3 | Memory MCP（履歴保存・前回比較） | ✅ 完了 |
| Phase 4 | マルチプロバイダー対応（Claude/OpenAI/Gemini） | ✅ 完了 |
