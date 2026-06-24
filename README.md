# 競走馬プロファイラー

競走馬の成績をエクセルでアップロードし、長所・短所を可視化するツール。最大5頭まで比較することもできる。

## フォルダ構成

```
keiba-app/
├── public/
│   └── index.html      ← フロントエンド（公開ページ）
├── api/
│   └── claude.js       ← サーバーレス関数（APIキーをここで管理）
├── vercel.json         ← Vercel設定
└── README.md
```

## デプロイ手順（Vercel）

### 1. GitHubにアップロード

1. [github.com](https://github.com) でアカウント作成（未登録の場合）
2. 「New repository」をクリック
3. リポジトリ名: `keiba-analyzer`、**Public** を選択して作成
4. 「uploading an existing file」リンクをクリック
5. `keiba-app` フォルダ内の全ファイルをドラッグ＆ドロップ
   - `public/index.html`
   - `api/claude.js`
   - `vercel.json`
   - `README.md`
6. 「Commit changes」をクリック

### 2. Vercelにデプロイ

1. [vercel.com](https://vercel.com) にアクセス
2. 「Sign Up」→「Continue with GitHub」でGitHubアカウントでログイン
3. 「Add New → Project」をクリック
4. 先ほど作成した `keiba-analyzer` リポジトリを選択して「Import」
5. 設定はそのままで「Deploy」をクリック
6. デプロイ完了後、URLが発行されます（例: `https://keiba-analyzer.vercel.app`）

### 3. APIキーを設定（重要）

1. Vercelのプロジェクトページを開く
2. 上部メニューの「Settings」をクリック
3. 左メニューの「Environment Variables」をクリック
4. 以下を入力して「Save」：
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: `sk-ant-...`（Anthropic ConsoleのAPIキー）
5. 「Deployments」タブから最新デプロイを選択し「Redeploy」をクリック

### 4. Anthropic APIキーの取得方法

1. [console.anthropic.com](https://console.anthropic.com) にアクセス
2. Googleアカウントなどでサインアップ
3. 「API Keys」→「Create Key」でキーを発行
4. 発行されたキー（`sk-ant-...`）をコピーしてVercelに設定

## 注意事項

- APIキーは絶対に `index.html` や `api/claude.js` に直接書かないでください
- Vercelの環境変数として設定することで安全に管理できます
- APIの利用料はAnthropicのコンソールで確認できます（従量課金）
- 分析結果はAIによる推定です。馬券購入は自己責任でお願いします
