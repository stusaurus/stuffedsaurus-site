# StuffedSaurus｜スタフトサウルス 公式サイト

このリポジトリは、承認済みの絵本タッチによる公式HPの制作・確認用です。

## V5.10のアップロード（iPhoneからでも可能）

1. [リポジトリのトップ](https://github.com/stusaurus/stuffedsaurus-site)を開く。
2. **Add file → Upload files** を選択する。
3. ChatGPTから受け取った **site.zip** を、**展開せずにそのまま1個だけ**選ぶ。
4. ページ下部の **Commit changes** を押す。
5. [Settings → Pages](https://github.com/stusaurus/stuffedsaurus-site/settings/pages) で、**Build and deployment → Source → GitHub Actions** にする。
6. [Actions](https://github.com/stusaurus/stuffedsaurus-site/actions) で **Publish StuffedSaurus preview** が成功したことを確認する。
7. 公開URL: https://stusaurus.github.io/stuffedsaurus-site/

## ファイル構成

- `site.zip`：公式HP本体（`index.html` と `assets/`）。このZIPをActionsが展開して公開します。
- `.github/workflows/pages.yml`：GitHub Pagesへの公開処理。

## 制作ルール

- 英字名：**StuffedSaurus**、カタカナ：**スタフトサウルス**。
- 承認済みの水彩・色鉛筆による絵本タッチを基準にする。
- ティラノン・ステゴン・プテランの個性と生物学的構造を維持する。
- PC用・スマホ用の構図は別素材とし、キャラクターが見切れる表示を避ける。
- 公開・販売していないコンテンツを公開済みと偽って表示しない。

> 公式HPは現在制作途中です。ZIPのアップロード後も、公開URLを周知する前に表示と操作を確認してください。
