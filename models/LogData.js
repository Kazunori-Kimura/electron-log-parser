"use strict";

/**
 * ログデータ
 */
class LogData {
  constructor(line) {
    this.data = line;
    this.datetime = "";
    this.logType = "";
    this.id = "";

    // 先頭が日付なら
    if (/^\d{4}\/\d{2}\/\d{2}/.test(line)){
      // カンマで区切る
      const items = line.split(",");
      // 日時を取得
      this.datetime = items[0];
      // ログ種別を取得
      this.logType = trim(items[1]);
      // idを取得
      this.id = /^[A-Z0-9]{8}$/.test(trim(items[2])) ? trim(items[2]) : trim(items[3]);

      // idがモニターIDとして正しくない -> 通常行として扱う
      // ZZE1UT11
      if (!/^[A-Z0-9]{8}$/.test(this.id)) {
        this.id = "";
      }
    }
  }

  get isError() {
    return "ERROR" === this.logType;
  }

  get isEnd() {
    return /\<cmd\>end\<\/cmd\>/.test(this.data);
  }

  get status() {
    const ret = this.data.match(/\<status\>(\d{2})\<\/status\>/);
    if (ret) {
      return ret[1];
    }
    return "";
  }
}

/**
 * trim
 */
function trim(str) {
  return str.replace(/^\s+/, "").replace(/\s+$/, "");
}

module.exports = LogData;
