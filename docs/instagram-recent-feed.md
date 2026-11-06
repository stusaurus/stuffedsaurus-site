# Instagram投稿の表示と自動更新

## 現在の状態（2026-11-06）

* **表示（V5.23）**：iPhone実機の録画で、Instagram公式埋め込みがリールのカバーを正方形・上下余白付きで表示し、サイト側のCSS変更では改善できないことを確認。そこでページ内の公式埋め込みを廃止し、9:16の紹介カードと実在する投稿3件（2026-11-05、11-03、11-02）への個別リンクに変更した。カード内のイラストは既存のサイト公式キャラクター画像であり、実際のリールのサムネイルではないことを明示する。
* **更新**：`preview/instagram-recent.json` は2026-11-06に確認した時点の内容。Instagramの認証情報をGitHubに登録していない限り、以後の投稿は自動反映されない。ページにも確認日を明示する。
* **安全**：認証トークン・署名付き画像URLは公開サイトやGitHubのソースに保存しない。
* **対象**：公開投稿とリール（Storiesは対象外）。Instagramのiframeや外部のembed.jsは読み込まず、クリックするとInstagramの投稿そのものを開く。

## 将来の投稿を自動で取り込むには

Instagramをビジネスまたはクリエイターのプロアカウントとして管理していることが必要。Meta for DevelopersのInstagram API with Instagram Loginでアプリと許可（`instagram_business_basic`）を設定し、**@stuffed_saurus本人の長期有効なアクセストークン**を取得する。

そのトークンをGitHubリポジトリの **Settings → Secrets and variables → Actions → New repository secret** に、次の名前で登録する。

```
INSTAGRAM_ACCESS_TOKEN
```

**トークンをIssue、PR、チャット、コード、公開HTMLに貼らない。**

設定できたら、GitHub Actionsの **Refresh Instagram recent reels** を一度手動実行し、実行結果を確認する。以後は毎日09:21（日本時間）のチェックが有効になる（GitHub側の実行開始は多少遅れる場合がある）。新しい投稿が見つかったときだけ`preview/instagram-recent.json`を更新・コミットし、既存のPagesワークフローからサイトに反映する。

長期トークンは永続ではない。期限が近づいたら更新が必要で、現時点では期限切れの自動再認証は未実装。トークン未設定時は失敗したデータを作らず、確認済みのスナップショットを表示する。

## 障害時・品質方針

* APIが失敗したら既存の投稿を維持し、更新失敗を記録する。古い投稿を「いま現在の最新」と表示しない。
* 画像をホットリンクしない。Instagramの一時的な画像URLは有効期限があり、恒久保存には使わない。
* `https://www.instagram.com/p/...` と `https://www.instagram.com/reel/...` 以外のURLは掲載しない。
* 実際の動画再生はInstagram側で行う。投稿が削除・非公開化されている場合、元のリンク先でも閲覧できない。
* ブラウザ上の紹介カードは9:16で、キャラクター画像には`object-fit:contain`を使用し縦横比を変えない。
