import $ from "jquery";
import store from "store";

export default class WebNotification {
  show(videoInfo) {
    const $newInfos = $(videoInfo);
    const options = {
      body: $newInfos
        .first()
        .find("video title")
        .text(),
      icon: $newInfos
        .first()
        .find("community thumbnail")
        .text(),
      tag: $newInfos
        .first()
        .find("video id")
        .text()
    };
    const duration = store.get("options.openingNotification.duration") || 6;
    const notification = new Notification("放送開始のお知らせ", options);
    setTimeout(() => {
      this._timeOut(notification);
    }, duration * 1000);
    notification.onclick = e => {
      this._onClick(e);
    };
  }

  _timeOut(notificatin) {
    notificatin.close();
  }

  _onClick(e) {
    chrome.tabs.create({
      url: `http://live.nicovideo.jp/watch/${e.currentTarget.tag}`,
      active: true
    });
  }
}
