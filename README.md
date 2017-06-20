<p align="center">
  <img alt="nicosapo" src="https://yurarfuca.github.io/resources/nstitle.png">
</p>

<p align="center">
  Google Chrome Extension for enjoying nicolive.jp FURTHERMORE.
</p>

---

## Install

[にこさぽ - Chrome ウェブストア](https://chrome.google.com/webstore/detail/%E3%83%8B%E3%82%B3%E7%94%9F%E3%83%81%E3%82%A7%E3%83%83%E3%82%AB%E3%83%BC/kfnogdokhemdbbclknmmjpcnmjmpjknc)

## How to Build

```
yarn run build
```

## TODO

[TODO.md](https://github.com/yurarfuca/nicosapo/blob/develop/TODO.md)


## 機能一覧

1. 放送中の番組を一覧表示
1. 自動枠移動（新配信（β）対応）
1. 自動入場
1. デスクトップ通知
1. 延長通知
1. 残り時間が短くなったときにプレイヤー上に通知を表示

## 放送中の番組一覧を表示

![Alt Text](https://yurarfuca.github.io/resources/nicosapo_popup.png)

インストール後にツールバーに追加されるアイコンをクリックすると，コミュニティ登録しているコミュニティとチャンネルの放送番組を一覧表示します．サムネイルをマウスオーバーすると，放送の説明が表示されます．

アイコンには放送中の**ユーザーコミュニティ**の数がバッジとして表示されます（図中の「10」のように）．バッジに表示される値とその説明は次のとおりです．

| 表示される値 | 説明 |
| --- | --- |
| 数字 | 放送中の**ユーザーコミュニティ**の数です |
| 何も表示されない | 放送中の**ユーザーコミュニティ**の数が0です |
| x | ニコニコ動画にログインしていないか，それ以外のエラーが発生しています |

## 自動次枠移動

![Alt Text](https://yurarfuca.github.io/resources/nicosapo_auto_redirect.png)

インストールすると，放送用ページ（http：//live.nicovideo.jp/watch/lv* ）に自動次枠移動の有効/無効を切り替えるボタンが表示されます．ボタンをクリックするごとにボタンの状態が切り替わります．「自動次枠移動ON」の状態では自動次枠移動が有効になります．一方，「自動次枠移動OFF」の状態では自動次枠移動が無効になります．

放送用ページを開き続けておくと，その間にこさぽは当該コミュニティが新しく放送を開始していないかを一定時間ごとにチェックします．新しく放送が開始されたことを検知すると，にこさぽはその放送ページを自動的に同じタブで開きます．

その他細かな説明
+ 自動次枠移動の有効/無効設定はタブごとに保存されます．コミュニティやチャンネルごとには保存されません．そのため，新しく放送用ページを開くと必ずボタンの状態は後述の**設定画面**で設定した状態になります．
+ 新しく放送が開始されているかを確認するのに時間制限はありません．放送用ページを開いている間はチェックを継続します．
+ 自動枠移動は1秒から40秒程度のラグが発生します．

## 自動入場

自動入場は次の二種類に大別できます．

1. 番組への自動入場
2. コミュニティ/チャンネルへの自動入場

## 番組への自動入場

![Alt Text](https://yurarfuca.github.io/resources/nicosapo_auto_enter.png)

インストールするとゲートページに自動入場の有効/無効を切り替えるボタンが表示されます．ボタンをクリックするごとにボタンの状態が切り替わります．「自動入場ON」の状態では自動入場が有効になり，にこさぽ内部の自動入場リストに当該番組が登録されます．一方「自動入場OFF」の状態では自動入場が無効になり，自動入場リストから当該番組が削除されます．

Google Chrome が起動している間，にこさぽは自動入場リストの中から放送が始まった番組を一定時間ごとにチェックします．放送が始まった番組を検知すると，にこさぽはその番組を自動的に新しいタブで開きます．新しいタブが開かれると同時に当該番組は自動入場リストから自動的に削除されます．

## コミュニティ/チャンネルへの自動入場

![Alt Text](https://yurarfuca.github.io/resources/nicosapo_autoenter_community_1.png)
![Alt Text](https://yurarfuca.github.io/resources/nicosapo_autoenter_community_2.png)
![Alt Text](https://yurarfuca.github.io/resources/nicosapo_autoenter_community_3.png)

次のページに新たにボタンが追加されます．

+ コミュニティのトップページ
+ 放送ページ

ボタンをクリックすると，システム内部のコミュニティ/チャンネルへの自動入場リストに，当該のコミュニティ/チャンネルが登録されます．自動入場リストは設定画面から管理できます．

にこさぽは一定時間ごとに，自動入場リストに登録されたコミュニティ/チャンネルが放送を開始したか確認します．放送が開始された場合はその放送を新しいタブで開きます．

## 通知バー

![Alt Text](https://yurarfuca.github.io/resources/nicosapo_extendedbar.png)

プレイヤー上部に通知バーが表示されます．通知バーには次が表示されます．

| 表示される情報 | 説明 |
| --- | --- |
| 通知検知 | 放送が延長されたとき「放送が～に延長されました」とメッセージが表示されます |
| 終了時刻 | 放送が終了する時刻です |
| 残り時間 | 放送の残り時間です |

## デスクトップ通知

お気に入り登録（フォロー）している**ユーザーコミュニティ**が新しく放送を開始すると通知を表示します．さらに，通知に合わせて音を表示することもできます．これら機能は設定画面にて無効にできます．

通知が表示されるまでに最大1分程度のラグが発生します．

![Alt Text](https://yurarfuca.github.io/resources/nicosapo_notification.png)

## 設定画面

インストール後にツールバーに追加されるアイコンを右クリック->設定 から，にこさぽの設定をおこなえます．

![Alt Text](https://yurarfuca.github.io/resources/nicosapo_setting.png)
