# ZeniKijunkyokuChecker
善意の基準局チェッカー

## デモ
[ここ](https://bolero-fk.github.io/ZeniKijunkyokuChecker/)から利用できます

## 詳細
RTKで利用できる基準局の情報を[善意の基準局掲示板](https://rtk.silentsystem.jp/)からスクレイピングしてリポジトリにjson形式で保存しています。  
スクレイピングは毎日00:00にgithub actionsにより実行されます。

リポジトリに保存された基準局のjsonデータをもとに地図に情報をプロットしています。  
![Demo Image](image/demoImage.png)  
緑マーカーは公開中の基準局、各緑マーカーから広がる円はそのマーカーからの距離を示しています。  
円の大きさは左下のスライダーにより変更できます。  
赤マーカーは休止中の基準局を示しています。  
各基準局の詳しいデータはマーカーをクリックすると表示されます。  
