---
layout: post
lang_code: ja
locale: ja_JP
ref: bringing-colour-and-life-to-black-and-white-photos
date: 2021-06-12 00:00:00 -0700
last_modified_at: 2021-06-12 00:00
permalink: /ja/bringing-colour-and-life-to-black-and-white-photos
title: "白黒写真に色彩と生命を吹き込む"
imgpath: /assets/img/colourising-black-and-white-photos
previewurl: /mama-and-vova-colorized.jpg
description: "AI と DeepAI API を使って家族の古い白黒写真をカラー化した実例や一括処理スクリプトを紹介しつつ、AI による色彩復元の限界と倫理的な課題を考えます。"
image: /assets/img/colourising-black-and-white-photos/og-preview.png
image_width: 1200
image_height: 630
image_alt: "AI でカラー復元された家族写真"
mathjax: false
tags: [computer-vision, machine-learning]
toc: true
---

{% include description.html content="機械学習を使えば白黒写真を簡単にカラー化できますが、そこにはどんなリスクがあるのでしょうか？" %}

## もう一つの世界

技術的にはカラー写真は1世紀以上前から存在していましたが（[カラー写真の先駆者であるセルゲイ・プロクジン＝ゴルスキーとピョートル・ヴェデニソフは、帝政ロシア各地を旅してフルカラーで記録を残しました](https://www.loc.gov/pictures/related/?fi=name&q=Prokudin-Gorski%20%2C%20Serge%20%20Mikha%20lovich%2C%201863-1944)）、20世紀の大部分は白黒で記録されてきました。世紀後半になっても、世界の多くの地域ではカラーフィルムは贅沢品でした。私の父も1980〜90年代のソ連領ウクライナで自ら白黒写真を現像していましたし、アメリカ側がベトナム戦争をフルカラー映像で記録していた一方で、北ベトナム側の視点は白黒写真ばかりが残っているようです。

![シム川近くの少年]({{ "/boy-sim-river.jpeg" | prepend: page.imgpath }}){: width="900" height="648" fetchpriority="high" decoding="async"}
{% include caption.html content="シム川近くの少年。帝政ロシア時代に撮影されたごく初期のカラー写真です。異なるカラーフィルターを使って同じ情景を複数枚撮影することで実現されました。米国議会図書館提供。" %}

白黒映像には独特の味わいがあると主張する人もいるでしょうし、それももっともだと思います。しかし私にとって、白黒映像はその情景との間に距離を感じさせます。明らかに「遠い昔」のものに見えてしまうのです。映画で回想シーンに白黒映像が使われる定番手法からもわかるように、私たちは皆、白黒を過去と結びつけています。そして普段フルカラーで現実を体験している私にとって、白黒の映像を自分事として体感するのは難しいのです。頭の中で「白黒の別世界」の出来事として処理されてしまい、その場や登場人物の立場に身を置くことがなかなかできません。ところが映像がカラー化されると、途端にすべてがよりリアルで、信じやすく、手触りのあるものに見えてきます。そこに映っているのは同じ地球であり、私やあなたと同じ人間なのだと、はっきりと実感できるようになるのです。

だからこそ、最近父が家族写真のコレクションをデジタル化し始めたとき――物理的な写真は劣化しますし、そこに刻まれた歴史や思い出、遺産ごと永遠に失われるリスクがあります――私はそれらをカラー化もしてみたいという衝動に駆られました。私自身がもっと深くその写真を感じられるように、そして家族がもう会えない大切な人を偲んだり、若かりし頃の思い出を振り返ったりできるようにするためです。

<div class="divider"></div>

## AI で写真をカラー化する

色彩の復元は手作業でも行えますが、途方もない労力がかかります。機械学習モデルは写真を素早く安価にカラー化できる方法を提供してくれますが、記事の後半でお話しするような限界もあります。今回、自分でモデルを学習させたわけではありません。すでに他の人々が何千時間もかけてまさにそのためのモデルを開発・学習させています。私は、非常に良い結果を出す既存のモデルを見つけました。

使ったのは [DeepAI の Image Colorization API](https://deepai.org/machine-learning-model/colorizer) です。DeepAI が本番環境で動かしているモデルは DeOldify モデルの一種のようで、[こちらの GitHub リポジトリ](https://github.com/jantic/DeOldify)で公開されています。

DeepAI の API ではモデルのパラメータを調整できないと思いますが、上記リポジトリや [Google Colab インスタンス](https://colab.research.google.com/github/jantic/DeOldify/blob/master/ImageColorizerColabStable.ipynb)から自分で実行すれば調整できます。[MyHeritage](https://www.myheritage.com/incolor) も、パラメータ調整可能な形でこの種の機能をサービスとして提供しています。

私は、ディレクトリ内の写真を一括カラー化する簡単なスクリプトを作りました。指定フォルダ内のすべての写真を走査して DeepAI の Image Colorization API に送信し、結果を別フォルダにダウンロードします（すでにカラー化済みの画像はスキップします）。同じことをしたい方は、ご自身の DeepAI API キーを環境変数に設定して[こちらのスクリプト](https://github.com/skzv/colorize-photos)を実行してみてください。

```bash
export DL_API_KEY=<your-deep-ai-key>
python3 main.py /path/to/images
```

<div class="divider"></div>

## 家族の写真

我が家の家族写真に適用した結果の例がこちらです。

![母とヴォーヴァ]({{ "/mama-and-vova.webp" | prepend: page.imgpath }}){: width="1600" height="1232" loading="lazy" decoding="async"}
{% include caption.html content="1990年代初頭、ウクライナのヘルソンで弟を抱く母。クズネツォフ家所蔵。" %}

![カラー化した母とヴォーヴァ]({{ "/mama-and-vova-colorized.webp" | prepend: page.imgpath }}){: width="800" height="616" loading="lazy" decoding="async"}
{% include caption.html content="カラー化後。" %}

![祖母のアラルカジーナ]({{ "/my-grandmother-allarkadina.jpg" | prepend: page.imgpath }}){: width="523" height="801" loading="lazy" decoding="async"}
{% include caption.html content="おそらく1950年代、大学へ向かう途中の祖母アラルカジーナ。複数の大学で電気工学を修め、船舶電気技師として立派なキャリアを築きました。" %}

![カラー化した祖母アラルカジーナ]({{ "/my-grandmother-alla-colourised.webp" | prepend: page.imgpath }}){: width="522" height="800" loading="lazy" decoding="async"}
{% include caption.html content="カラー化後。" %}

> すごく素敵で、生き生きとしているね。

新しく色がついた写真を見たときの父のこの一言だけで、やった甲斐がすべて報われました。

<div class="divider"></div>

## ベトナム戦争の写真

家族写真向けの一括カラー化スクリプトを作ってから数週間後、["The Vietnam War from the North Vietnamese Side"](https://news.ycombinator.com/item?id=27283624)（「北ベトナム側から見たベトナム戦争」）という記事が Hacker News のトップに上がりました。スクリプトを試して歴史的資料に新しい視点をもたらすには絶好の機会だと思いました。映画[『彼らは生きていた（They Shall Not Grow Old）』](https://www.imdb.com/title/tt7905466/)が第一次世界大戦の惨禍を生々しい現実として蘇らせたように、北ベトナム側の人々や情景をリアルに感じてもらいたいと考えたのです。

![枯葉剤によって破壊されたジャングル（白黒）]({{ "/vietnam-agent-orange.jpeg" | prepend: page.imgpath }}){: width="1600" height="1179" loading="lazy" decoding="async"}
{% include caption.html content="枯葉剤（エージェント・オレンジ）によって破壊されたジャングル。" %}

![枯葉剤によって破壊されたジャングル（カラー化）]({{ "/vietnam-agent-orange-colourised.webp" | prepend: page.imgpath }}){: width="800" height="590" loading="lazy" decoding="async"}
{% include caption.html content="カラー化後。" %}

![撃墜された米軍機を調べる地元の人々（白黒）]({{ "/vietnam-downed-aircraft.jpeg" | prepend: page.imgpath }}){: width="1600" height="1111" loading="lazy" decoding="async"}
{% include caption.html content="スティーヴン・オーウェン・マッセルマン中尉が操縦していた撃墜米軍機を調べる地元の人々。パイロットは生還できませんでした――戦争は地獄です。" %}

![撃墜された米軍機を調べる地元の人々（カラー化）]({{ "/vietnam-downed-aircraft-colourised.webp" | prepend: page.imgpath }}){: width="800" height="556" loading="lazy" decoding="async"}
{% include caption.html content="カラー化後。" %}

元の白黒写真はすべて[こちら](https://rarehistoricalphotos.com/vietnam-war-images-from-vietnamese-photographers/)、カラー化バージョンは[こちら](https://imgur.com/a/aJbpMjf)で見ることができます。

<div class="divider"></div>

## Hacker News での反響

この試みには称賛の声もあれば、

![称賛のコメント]({{ "/praise.webp" | prepend: page.imgpath }}){: width="624" height="934" loading="lazy" decoding="async"}

厳しい批判もありましたが、

![批判のコメント]({{ "/contempt.png" | prepend: page.imgpath }}){: width="546" height="286" loading="lazy" decoding="async"} {% include caption.html content="[flagged] になってしまったコメントは面白い指摘をしていたので残念です。たしか「お願いだからこういうことはやめてほしい」といった内容でした。" %}

何より、非常に興味深い議論が数多く生まれました。

![議論のコメント]({{ "/discussion.webp" | prepend: page.imgpath }}){: width="654" height="946" loading="lazy" decoding="async"}

カラー化写真がきっかけとなったスレッド全体は[こちら](https://news.ycombinator.com/item?id=27284795)から読めます。

<div class="divider"></div>

## 限界

その議論の中で特に印象に残った点が2つありました。1つ目は、AI の限界を改めて思い知らされたことです。

たとえば、建設中のゴールデンゲートブリッジの古い写真にモデルを適用すると、橋が白く塗られてしまいます。公平に言えばまったくの間違いではなく、建設初期には実際に白かったのですが、この写真が撮られた時点ではすでに赤い下塗り塗料が塗られていました（[DeOldify リポジトリ](https://github.com/jantic/DeOldify)の記載による）。つまり、学習データに建設中のゴールデンゲートブリッジが含まれており、モデルが「建設中の同じ橋だ」と認識できたとしても、撮影時期を見分けて「この時点ではすでに赤く下塗りされていた」と判断することはできなかったのです。

![白いゴールデンゲートブリッジ？]({{ "/golden-gate.webp" | prepend: page.imgpath }}){: width="1200" height="472" loading="lazy" decoding="async"} {% include caption.html content="白いゴールデンゲートブリッジ？白かった時期はありましたが、この写真が撮られたときではありません。" %}

また、文脈が曖昧なシーンもあります。たとえば次の写真では、特徴だけから地面が芝生なのかアスファルトなのかをモデルが判別できず、人間なら正しく塗れるはずのアスファルトを誤って緑色に塗ってしまっています。

![祝賀の場面]({{ "/a-celebration-colourised.webp" | prepend: page.imgpath }}){: width="800" height="522" loading="lazy" decoding="async"} {% include caption.html content="地面が芝生ではなくアスファルトであることをモデルが見分けられていません。" %}

もう一つ興味深かったのは、衣服には正確な色付けの手がかりとなる特徴的な色調・質感・文脈が乏しいことが多いという点です。はっきりした特徴や文脈がない限り、モデルは衣服を紫色に塗りがちでした。おそらく、服の色をうまく推測できないときに、学習損失を最小化する無難な賭けとして曖昧な色空間の中間あたりにある紫を選ぶのでしょう。

![ベトナムのダイバーたち――全員紫？]({{ "/vietnam-divers-colourised.webp" | prepend: page.imgpath }}){: width="796" height="800" loading="lazy" decoding="async"} {% include caption.html content="昔の服が、このモデルが描くほど紫だらけだったとは思いません。" %}

実際、父からも写真に写っているいくつかの物の色を直してほしいと頼まれました。残念ながらその要望には応えられませんでしたし、どうすればうまく直せるのかもすぐには思いつきませんでした。それでも、あるコメント投稿者が書いていた通り、たとえ色が間違っていたとしても、写真に命が吹き込まれることに変わりはありません。

<div class="divider"></div>

## 倫理的な考察

こうした限界が見えてくると、カラー化 AI がもたらす倫理的影響を考える準備が整います。これが議論の中で強く印象に残った2つ目の点です。このプロジェクトを始めたとき、倫理面のことは頭に浮かびもしませんでしたが、寄せられたフィードバックのおかげで深く考えるきっかけを得られました。感謝しています。

最大の倫理的課題は「真実」に関わる問題です。ディープフェイクが「何が真実かわからなくなる」という論争を呼ぶのと同じように、人工的な着色は私たちが歴史をどう体験するかを変えてしまう可能性があります。AI は過去の色について判断を下しますが、それは必ずしも正確ではありません。たとえば、AI が生成した「白いゴールデンゲートブリッジ」をそのまま保存・拡散すれば、見る人が体験する橋の姿は歴史的に不正確なものになります。もちろん白黒写真も現実そのままではありません。ただおそらく厄介なのは、白黒写真を見る人は「過去が実際に白黒だったわけではない」とわかっているのに対し、カラー写真を見る人は「これが当時の歴史そのものだ」と簡単に信じ込んでしまいやすい点です。

こうしたレタッチは歴史の書き換えに等しいとまで言う人もいますし、実際そう見えてしまう事例もあります。最近の例を見てみましょう。

> カンボジアは米メディアグループ Vice に対し、クメール・ルージュの犠牲者の写真を新たにカラー化して掲載した記事を取り下げるよう要求した。一部の写真に笑顔を付け加える改変がなされており、死者への冒涜であるとしている。

<p class="caption" style="margin-top:-25px;"><a href="https://www.aljazeera.com/news/2021/4/11/cambodia-condemns-vice-for-altered-khmer-rouge-images">出典</a></p>

これはまったく正当な抗議です。モデルが過学習しており、おそらく笑顔の写真が大半を占めるデータで学習されていたのでしょう。その結果、犠牲者の顔を学習データに近づける形で――つまり笑顔へと――改変してしまったのです。AI を不用意に適用したときの落とし穴を示す象徴的な例と言えます。

私が使ったのと同じ DeOldify モデルをベースにカラー復元サービスを提供している [MyHeritage](https://www.myheritage.com/incolor) は、加工したすべての画像に透かし（ウォーターマーク）を入れることで折衷案をとっています。彼らの主張は説得力があります。

> 私たちは、カラー化処理を施した写真の左下に特別なエンボス加工のパレット記号を入れることで、もともとカラーで撮影された写真と区別しています。極めてリアルではありますが、カラー化された写真の色は自動アルゴリズムによってシミュレートされたものであり、元々の現実の色と同一とは限りません。パレットアイコンはすべてのカラー化写真に表示され、本来の色を持つ写真と区別できるようになっています。写真のカラー化技術を利用する他の人々にも、この責任ある慣行が広がることを願っています。なお、色褪せ修復のみを行った写真には本物の色が残っているため、このアイコンは付きません。

私の場合、家族は私が写真を人工的にカラー化したことを知っていましたし、色が完全に正確ではないこともわかっていました。それでも、たとえ色が違っていても、写真とその中に写る人々や情景は確かに生き返ったのです。高校時代に老人ホームでボランティアをしていたとき、50年間訪れていなかったドレスデンの幼少期の家へ Google ストリートビューで入居者の方をお連れできたのと同じように、私は AI を使って家族を何十年も前の良き時代へ送り届けることができました。テクノロジーは道具であり、このような魔法が可能な時代に生きていることに感謝しています。
