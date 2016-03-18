"use strict";
// ログ解析結果
class ComData {
  constructor(params) {
    this.id = params.id || "";
    this.status = params.status || "";
    this.data = params.data || [];
    this.start = params.start || "";
    this.end = params.end || "";
    this.result = params.result || false;
  }

  get statusName() {
    let name = "";

    switch (this.status) {
      case "00":
        name = "テスト通信";
        break;
      case "01":
        name = "マニュアル通信";
        break;
      case "10":
        name = "定期通信";
        break;
      case "20":
        name = "発電システム異常";
        break;
      case "40":
        name = "時刻修正";
        break;
      case "50":
        name = "プライベートIPアドレス変更";
        break;
      case "99":
        name = "テスト通信";
        break;
      default:
        name = "";
    }
    if (name) {
      return `${this.status}:${name}`;
    }
    return name;
  }
}

module.exports = ComData;
