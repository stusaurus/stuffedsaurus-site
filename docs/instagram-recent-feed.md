# Instagram投稿の表示と自動更新

## 現在の状態（2026-11-07）

* **表示（V5.24）**：連携済みの @stuffed_saurus の投稿データから、2026-11-05・11-03・11-02の実際のリールの表紙画像3枚（1080×1920）を取得し、`preview/instagram-covers/` にWebPで保存。公式サイトに9:16の実表紙を表示している。各画像をタップすると、その画像が属する実際のInstagramリールへ移動する。ページ内で動画を直接再生する形式ではない。別のサイト用イラストに置き換えることは禁止。
* **更新**：`preview/instagram-recent.json` は2026-11-07に確認した内容。新しい投稿の自動反映にはInstagram認証トークンのGitHub登録が必要。既存の実表紙画像は投稿URLに紐づけて保存する。新規投稿に表紙画像がまだない場合、別画像を使わず「Instagramでリールを見る」のリンクカードを表示する。
* **安全**：認証トークンを公開サイトやGitHubのソースに保存しない。Instagram CDNが返す一時的な画像URLから一度画像を取得した後、期限に依存しない自サイトのWebPに保存し、一時URLは公開サイトには配信しない。
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
* 画像をホットリンクしない。Instagramの一時的な画像URLは有効期限があるため、実際の投稿に対応した画像だけを取得・検証して自サイトに保存する（V5.24）。
* `https://www.instagram.com/p/...` と `https://www.instagram.com/reel/...` 以外のURLは掲載しない。
* 実際の動画再生はInstagram側で行う。投稿が削除・非公開化されている場合、元のリンク先でも閲覧できない。
* ブラウザの実表紙カードは9:16。画像自体も元の1080×1920を保持し、`object-fit:cover`で同じ比率の枠に表示するため、拡大縮小しても横方向に引き伸ばさない。実表紙がない場合には無関係なイラストへ差し替えない。
