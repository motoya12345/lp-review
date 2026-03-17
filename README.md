# LP赤ペン先生 — エージェント × 視覚アノテーション版

LPデザインレビューWebアプリ。マルチエージェントで根拠のある分析を行い、指摘箇所をLP画像上に直接可視化します。
PC版・SP版はそれぞれ独立したレビューパイプラインで分析されます。

## アーキテクチャ

```
画像（PC / SP）+ コンテキスト
        ↓ PC・SP それぞれ独立して実行
┌─────────────────────────────────────────────────────┐
│  Fetch Agent     LPのURL → 本文・見出し・CTAを取得   │  MCP: Fetch (cheerio)
│  Research Agent  競合・業界事例をWeb検索              │  MCP: Brave Search
│                          ↓ 並列実行                  │
│  UX Agent        視線誘導・レイアウトの問題を分析      │
│  Copy Agent      コピー・文章の問題を分析             │
│  CRO Agent       CTAとコンバージョン導線を分析        │
│                          ↓                          │
│  Synthesis Agent 全知見 + LP画像を同時参照して        │
│                  座標（box %）付き Issue[] を生成     │
│                          ↓                          │
│  Memory MCP      履歴を保存・前回レビューと比較        │  MCP: Memory (JSON)
└─────────────────────────────────────────────────────┘
        ↓  SSE でリアルタイム配信（[PC] / [SP] ラベル付き）
┌─────────────────────────────────────────────┐
│  PC / SP タブ切替                            │
│  LPプレビュー画像                            │
│    ┌─①─────────────┐                        │
│    │ キャッチコピー  │  ← Canvas で重大度別色枠＋番号  │
│    └────────────────┘                        │
│              ┌─②──┐                         │
│              │ CTA │                         │
│              └─────┘                         │
└─────────────────────────────────────────────┘
↓ 番号クリックで対応カードへ自動スクロール
┌── ① ファーストビュー ─── [重大] ──────────┐
│ 問題 / なぜ重要か / 改善方法               │
│ BEFORE → AFTER                            │
└───────────────────────────────────────────┘
📎 参考サイト（Research Agent の調査結果）
📋 Slack コピーボタン
```

進捗はServer-Sent Events（SSE）でリアルタイムにUIへ配信されます。

## 設計思想

- **PC・SP 独立レビュー** — PC版とSP版でそれぞれ別パイプラインを実行。デバイス特有の問題を見落とさない
- **エージェントで精度を上げる** — UX・Copy・CROを専門分離して並列実行。Synthesisが全知見 + 画像を同時参照して座標を推定
- **根拠のある指摘** — Research Agentが競合・業界ベストプラクティスを調査して根拠として提供。参考サイトをレビュー結果に表示
- **「どこの話か」を可視化** — AIが座標（%）を推定し、Canvas で画像に重大度別の色枠＋番号を描画
- **指摘件数を絞らない** — 見つかった問題はすべて返す。ユーザーが優先順位を判断する
- **双方向インタラクション** — 画像の枠クリック → カードへ、カードクリック → 枠ハイライト
- **具体的なBefore/After** — 抽象表現禁止。実際のコピー例を必ず記載
- **Slackへ即シェア** — 📋ボタン1クリックで総評・指摘・参考サイトをテキスト形式でコピー
- **ハング防止** — 2分タイムアウト + キャンセルボタン + 経過時間表示でフリーズを防ぐ

## ディレクトリ構成

```
lp-review/
├── app/
│   ├── page.tsx                      # メインUI・状態管理（pcResult / spResult）
│   └── api/
│       └── review/route.ts           # SSEエントリポイント → PC/SP 別 Orchestrator
├── components/
│   ├── AgentProgress.tsx             # エージェント進捗UI（[PC]/[SP] ラベル付き）
│   ├── AnnotatedImage.tsx            # Canvas で重大度別色枠＋番号バッジを描画
│   ├── IssueCard.tsx                 # 指摘カード（重大度・Before/After）
│   ├── InputPhase.tsx                # 入力フォーム + AgentProgress表示
│   ├── ResultPhase.tsx               # PC/SPタブ・2カラム結果・参考サイト・Slackコピー
│   ├── NavBar.tsx
│   ├── ImageDropZone.tsx
│   └── ProviderPicker.tsx
└── lib/
    ├── agents/
    │   ├── ai-client.ts              # Claude / OpenAI / Gemini 共通呼び出し
    │   ├── orchestrator.ts           # エージェントループ管理・sources をResultに含める
    │   ├── research-agent.ts         # 競合・事例調査（参考URLを返す）
    │   ├── fetch-agent.ts            # URLクロール
    │   ├── ux-agent.ts               # UX・視線誘導分析
    │   ├── copy-agent.ts             # コピーライティング分析
    │   ├── cro-agent.ts              # CVR・CTA分析
    │   └── synthesis-agent.ts        # 全結果統合 + 座標推定
    ├── mcp/
    │   ├── brave-search.ts           # Brave Search API
    │   ├── fetch-mcp.ts              # cheerio による HTML パース
    │   └── memory-mcp.ts             # JSON ファイルへの履歴保存
    ├── types.ts                      # Issue / ReviewResult / AgentStep 型定義
    ├── tokens.ts                     # デザイントークン・severity 色
    ├── providers.ts                  # Claude / OpenAI / Gemini 設定
    └── prompts.ts                    # システムプロンプト（シングルコール用）
```

## ローカル起動手順

```bash
npm install
# .env.local に環境変数を設定（下記参照）
npm run dev
```

ブラウザで http://localhost:3000 を開く

## 環境変数

| 変数名 | 必須 | 説明 |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Claude使用時に必要。Anthropic Consoleで取得 |
| `BRAVE_SEARCH_API_KEY` | 任意 | Research Agentの競合調査・参考サイト収集に使用。未設定の場合はスキップして続行 |

> ChatGPT・Geminiのキーはブラウザ上のUIから入力します（.env.localへの設定は不要）。

## APIキー取得先

- **Claude (Anthropic)**: https://console.anthropic.com/settings/keys
- **OpenAI (ChatGPT)**: https://platform.openai.com/api-keys
- **Google (Gemini)**: https://aistudio.google.com/app/apikey
- **Brave Search**: https://brave.com/search/api/

## 対応AIモデル

| プロバイダー | モデル | 備考 |
|---|---|---|
| **Claude** | Sonnet 4.6 / Opus 4.6 / Haiku 4.5 | APIキー不要（サーバー設定） |
| **ChatGPT** | GPT-4o / GPT-4o mini | OpenAI APIキーをUIから入力 |
| **Gemini** | Gemini 2.5 Flash / Gemini 2.5 Pro | Google APIキーをUIから入力。thinking無効化済み |

> Gemini 2.5 はthinkingモデルのため、内部で `thinkingBudget: 0` を設定しJSON出力を安定させています。

## レビュー結果の見方

| 重大度 | 意味 |
|---|---|
| 🔴 重大 (critical) | CVに直結（ファーストビュー・CTA・信頼性の欠如） |
| 🟠 要改善 (major) | CVに影響（構成・コピー品質・導線） |
| 🔵 軽微 (minor) | 改善するとよい（細かいUX・デザイン不統一） |

## Vercel デプロイ

```bash
vercel --prod
```

Vercel ダッシュボードの **Settings > Environment Variables** で以下を設定してください：

- `ANTHROPIC_API_KEY`
- `BRAVE_SEARCH_API_KEY`（任意）
