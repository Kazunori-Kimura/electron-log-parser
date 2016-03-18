# CenterServer Log Parser

センターサーバーのログを解析し、モニターID毎に分割します。


## 開発方法

1. [Node.js](https://nodejs.org/en/) をインストールします。
2. `bower` をインストールします。

```
> npm install bower -g
```

3. コマンドプロンプトで プロジェクトフォルダ (electron-log-parser) に移動し  
必要なパッケージをダウンロードします。

```
> cd electron-log-parser
> npm install
> bower install
```

4. 以下のコマンドでテスト実行します。

```
> npm run start
```

ウィンドウが立ち上がってくれば、モジュールのインストールに成功しています。


5. 以下のコマンドでビルドします。

```
> npm run build
```

`bin` フォルダ配下に実行ファイルが格納されたフォルダが生成されます。  
フォルダごと、実行する環境にコピーしてください。


以上
