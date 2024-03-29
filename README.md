# ictsc_sachiko_v3

## 構成

- CSS : Tailwind CSS, daisyUI
- 状態管理: SWR

This is a [Next.js](https://nextjs.org/) project bootstrapped
with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## development

First, run the development server:

```bash
# フォントのインストール
npm run font
#or
yarn font

cp .env .env.local
# 適切にコンフィグを変更して下さい
npm run dev
# or
yarn dev
```

#### テスト実行

```bash
yarn test
```

### Docker build

1. Docker をインストール
2. コンテナをビルド:

```
docker build \
  --build-arg=next_public_api_url=http://localhost:8080/api \
  -t sachiko .
```

3. コンテナを起動: `docker run -p 3000:3000 nextjs-docker`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
