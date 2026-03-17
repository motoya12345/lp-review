# LP赤ペン先生 — 視覚アノテーション版

LPデザインレビューWebアプリ。スコアなし、LPの画像上に直接指摘箇所を可視化します。

## 特徴

```
┌─────────────────────────────────────────────┐
│  LPプレビュー画像                            │
│    ┌─①─────────────┐                        │
│    │ キャッチコピー  │  ← 赤枠＋番号         │
│    └────────────────┘                        │
│              ┌─②──┐                         │
│              │ CTA │                         │
│              └─────┘                         │
└─────────────────────────────────────────────┘
↓ 番号をクリックで対応カードへ自動スクロール
┌── ① ファーストビュー ─── [重大] ──────────┐
│ 問題 / なぜ重要か / 改善方法               │
│ BEFORE → AFTER                            │
└───────────────────────────────────────────┘
```

## 設計思想

- **指摘件数を絞らない** — 見つかった問題はすべて返す。ユーザーが優先順位を判断する
- **「どこの話か」を可視化** — AIが座標（%）を推定し、Canvas で画像に赤枠＋番号を描画
- **重大度で色分け** — critical（赤）/ major（アンバー）/ minor（ブルー）
- **双方向インタラクション** — 画像の枠クリック → カードへ、カードクリック → 枠ハイライト
- **具体的なBefore/After** — 抽象表現禁止。実際のコピー例を必ず記載

## ディレクトリ構成

```
lp-review/
├── app/
│   ├── page.tsx                  # メインUI・状態管理
│   └── api/
│       └── review/route.ts       # Claude / OpenAI / Gemini API呼び出し
├── components/
│   ├── AnnotatedImage.tsx        # Canvas で赤枠＋番号バッジを描画
│   ├── IssueCard.tsx             # 指摘カード（重大度・Before/After）
│   ├── InputPhase.tsx            # 入力フォーム（画像アップロード）
│   ├── ResultPhase.tsx           # 2カラム結果画面（画像 + カード一覧）
│   ├── NavBar.tsx
│   ├── ImageDropZone.tsx
│   └── ProviderPicker.tsx
└── lib/
    ├── types.ts                  # Issue / ReviewResult 型定義
    ├── tokens.ts                 # デザイントークン・severity色
    ├── providers.ts              # Claude / OpenAI / Gemini 設定
    └── prompts.ts                # システムプロンプト
```

## ローカル起動手順

```bash
npm install
# .env.local に ANTHROPIC_API_KEY を設定（下記参照）
npm run dev
```

ブラウザで http://localhost:3000 を開く

## 環境変数

| 変数名 | 必須 | 説明 |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Claude使用時に必要。Anthropic Consoleで取得 |

> ChatGPT・Geminiのキーはブラウザ上のUIから入力します（.env.localへの設定は不要）。

## APIキー取得先

- **Claude (Anthropic)**: https://console.anthropic.com/settings/keys
- **OpenAI (ChatGPT)**: https://platform.openai.com/api-keys
- **Google (Gemini)**: https://aistudio.google.com/app/apikey

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

Vercel ダッシュボードの **Settings > Environment Variables** で `ANTHROPIC_API_KEY` を設定してください。
