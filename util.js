"use strict";
const glob = require("glob");
const fs = require("fs-extra-promise");
const path = require("path");
const jconv = require("jconv");

const remote = require('remote');
const dialog = remote.require('dialog');

class Util {

  /**
   * 非同期glob
   */
  static globAsync(pattern, options) {
    return new Promise((resolve, reject) => {
      glob(pattern, options, (err, files) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(files);
      });
    });
  }

  /**
   * ファイル名に日付が入っていないログが
   * 先頭に来るように並び替える
   */
  static sortLogs(files) {
    files = files.reverse();
    const todayLogs = [];
    const dailyLogs = [];
    // yyyy-MM-ddのチェック
    const reg = /\.\d{4}\-\d{2}\-\d{2}/;

    files.forEach((file) => {
      if (reg.test(file)) {
        dailyLogs.push(file);
      } else {
        todayLogs.push(file);
      }
    });
    return todayLogs.concat(dailyLogs);
  }

  /**
   * ログファイル読み込み
   */
  static readLogAsync(file) {
    return new Promise((resolve, reject) => {
      // ファイル読み込み
      fs.readFile(file, (err, buf) => {
        if (err) {
          reject(err);
          return;
        }
        // sjis -> utf8
        const data = jconv.decode(buf, "SJIS");
        // 改行で分割
        resolve(data.split("\r\n"));
      });
    });
  }

  static saveLogAsync(file, data) {
    return new Promise((resolve, reject) => {
      // utf-8 -> sjis
      const buf = jconv.encode(data, "SJIS");
      // ファイル保存
      fs.writeFile(file, buf, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }

  /**
   * electronからファイル選択ダイアログを開く
   */
  static showOpenDialogAsync(focusedWindow, properties) {
    return new Promise((resolve, reject) => {
      dialog.showOpenDialog(focusedWindow, properties, (items) => {
        if (items) {
          //console.log(items);
          resolve(items);
        } else {
          reject(new Error("no file or directory."));
        }
      })
    });
  }
}

module.exports = Util;
