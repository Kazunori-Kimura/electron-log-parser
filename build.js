// build.js
const packager = require("electron-packager");
const config = require("./package.json");
const electron = require("./node_modules/electron-prebuilt/package.json");

packager({
  dir: "./",          // 対象
  out: "./bin",      // 出力先
  name: config.name,  // 名前
  platform: "win32", // win32
  arch: "x64",        // 64bit
  version: electron.version,  // electron のバージョン
  "app-bundle-id": "io.github.kazunori-kimura",
  "app-version": config.version,          // バージョン
  overwrite: true,  // 上書き
  asar: true,       // アーカイブ
  prune: true,
  // 無視ファイル
  ignore: "node_modules/(electron-packager|electron-prebuilt|\.bin)|release\.js",
}, function done (err, appPath) {
  if(err) {
    throw new Error(err);
  }
  console.log('Done!!');
});