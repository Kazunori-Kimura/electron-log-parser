"use strict";
const remote = require('remote');
const browserWindow = remote.require('browser-window');
const co = require("co");
const ko = require("knockout");
const path = require("path");
const util = require("./util");
const ComData = require("./models/ComData");
const LogData = require("./models/LogData");

/**
 * Application View Model
 */
function AppView() {
  const self = this;

  // ログフォルダ
  self.path = ko.observable("D:\\SwebLogs");
  // ログ解析結果
  self.logs = ko.observableArray([]);
  // フッターメッセージ
  self.message = ko.observable("ログフォルダを指定し、「ログ解析」ボタンをクリックしてください。");
  // プログレスバー表示
  self.progress = ko.observable(false);
  self.progressRate = ko.observable("0%");
  self.maxFileCount = ko.observable(1);
  self.currentFile = ko.observable("");
  self.currentFileCount = ko.observable(0);
  // モーダル表示
  self.modalTitle = ko.observable("");
  self.modalContent = ko.observable("");

  /**
   * フォルダ選択
   */
  self.selectPath = function() {
    const w = browserWindow.getFocusedWindow();

    co(function*(){
      const directories = yield util.showOpenDialogAsync(w, { properties: ["openDirectory"] });
      if (directories) {
        self.path(directories[0]);
      }
    }).catch((err) => {
      console.error(err);
      self.message(err.message);
    });
  };

  /**
   * ログ解析
   */
  self.parseLogs = function() {
    self.progress(true);
    self.progressRate("0%");
    // リストを初期化
    self.logs.removeAll();
    
    let logging = {
      file: "",
      lineCount: 0
    };

    co(function *(){
      // ログ解析用Map
      const currentMonitors = new Map();
      self.message(`ログファイル取得中...`);

      // ログファイルを取得 (zipは除く)
      let files = yield util.globAsync("**/CenterServer.log*", { cwd: self.path(), ignore: ["*.zip"] });
      if (files.length === 0) {
        // 対象ファイルなし
        throw new Error(`ログファイルが存在しません。`);
      }
      // ソート
      files = util.sortLogs(files);
      self.maxFileCount(files.length);

      for(let i=0; i<files.length; i++) {
        logging.file = files[i];
        
        self.currentFile(files[i]);
        self.currentFileCount(i + 1);
        self.message(`ログ解析中: ${self.currentFile()} (${self.currentFileCount()}/${self.maxFileCount()})`);
        self.progressRate(`calc(${self.currentFileCount()} / ${self.maxFileCount()} * 100%)`);

        // ファイル読み込み
        const file = path.resolve(self.path(), files[i]);
        const lines = yield util.readLogAsync(file);
        // 現在のモニターID
        let currentId = "";
        let datetimeLog;
        let errorFlag = false; // ERRORを見つけたら true
        let endFlag = false;   // endを見つけたら true

        for(let j=0; j<lines.length; j++) {
          logging.lineCount = j;
          // 1行読み込み
          const log = new LogData(lines[j]);

          // ERROR以降、次の日時付き行が出てくるまではstack trace
          if (errorFlag) {
            const item = currentMonitors.get(currentId);

            if (log.datetime) {
              // 日時付き行を見つけたら、そのMonitorIdの通信は終了
              self.logs.push(item);
              // 削除
              currentMonitors.delete(currentId);
              currentId = "";
              errorFlag = false;
            } else {
              // stack trace
              item.data.push(log.data);
              continue; // 次の行へ
            }
          }

          // <cmd>end</cmd>以降、</monitoring>が出てくるまでは電文
          if (endFlag) {
            const item = currentMonitors.get(currentId);

            if (/\<\/monitoring\>/.test(log.data)) {
              // 終了タグを見つけたら、そのMonitorIdの通信は終了
              item.data.push(log.data);
              self.logs.push(item);
              // 削除
              currentMonitors.delete(currentId);
              currentId = "";
              endFlag = false;
            } else {
              // 電文の続き
              item.data.push(log.data);
            }
            continue; // 次の行へ
          }

          if (currentId === "" && log.id === "") {
            // ログ冒頭でモニターIDが無い行は読み捨て
            continue;
          }

          if (log.id !== "") {
            currentId = log.id;
          }
          // 日時付きの場合は退避しておく
          if (log.datetime) {
            datetimeLog = log;
          }

          if (!currentMonitors.has(currentId)) {
            const item = new ComData({ id: currentId, start: log.datetime, data: [log.data] });
            currentMonitors.set(currentId, item);
          } else {
            const item = currentMonitors.get(currentId);
            item.data.push(log.data);
            errorFlag = log.isError;
            endFlag = log.isEnd;

            if (errorFlag || endFlag) {
              item.end = datetimeLog.datetime;
              item.result = endFlag;
            }
            if (log.status) {
              item.status = log.status;
            }
            currentMonitors.set(currentId, item);
          }
        } // for lines
      } // for files

      // 全部終わったのにcurrentMonitorsにデータがあればmonitorsにpushする
      currentMonitors.forEach((value, key, map) => {
        self.logs.push(value);
      });

      self.message(`ログ解析が終了しました。`);
      self.progressRate("100%");
      self.progress(false);
    }).catch((err) => {
      console.log(`error! ${logging.file}:${logging.lineCount}`);
      console.error(err);
      self.message(err.message);
      self.progress(false);
    });
  }; // parseLogs

  /**
   * ログ表示
   */
  self.showLog = function(log) {
    self.modalTitle(`${log.id} | ${log.start}`);
    self.modalContent(log.data.join("\r\n"));
    $("#myModal").modal({show: true});
  };

  /**
   * ログ保存
   */
  self.saveLog = function(log) {
    co(function *(){
      const file = path.resolve(self.path(), `CenterServer.${log.id}.log`);
      const data = log.data.join("\r\n");
      // ファイル保存
      yield util.saveLogAsync(file, data);

      self.message(`ファイルを保存しました。 ${file}`);
    });
  };
}


// エントリポイント
window.addEventListener("load", () => {
  const app = new AppView();
  ko.applyBindings(app);
});
