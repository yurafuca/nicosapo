import store from "store";

export default class WebNotification {
  show(videoInfo) {
    // const $newInfos = $(videoInfo);
    const title = videoInfo.querySelector("video title").textContent;
    const thumbnail = videoInfo.querySelector("community thumbnail").textContent;
    const streamId = videoInfo.querySelector("video id").textContent;
    const options = {
      body: title,
      icon: thumbnail,
      tag: `nicosapo-${streamId}`
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
    const tag = e.currentTarget.tag;
    const streamId = tag.replace("nicosapo-", "");
    chrome.tabs.create({
      url: `http://live.nicovideo.jp/watch/${streamId}`,
      active: true
    });
  }
}
