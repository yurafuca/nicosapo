import IdHolder from "../modules/IdHolder";
import Api from "../api/Api";

const idHolder = new IdHolder();
const goToCast  = (liveId) => {
  const baseUrl = 'http://live.nicovideo.jp/watch/';
  const liveUrl = baseUrl + liveId;
  window.location.replace(liveUrl);
}
let _prolongReceiver = null;

export default class NewCastChecker {
  run() {
    this.repeat(this.checkNewCast.bind(this));
  }

  setProlongReceiver(recieverFunc) {
    _prolongReceiver = recieverFunc;
  }

  repeat(repeatFunc) {
    chrome.runtime.sendMessage({
        purpose: 'getFromLocalStorage',
        key: 'options.redirect.time'
      }, (response) => {
        const intervalTime = response || 50;
        setTimeout(repeatFunc, intervalTime * 1000);
    });
  }

  checkNewCast() {
    Api.isOpen(idHolder.liveId).then((response) => {
      if (response.isOpen) {
        _prolongReceiver(response);
        this.repeat(this.checkNewCast.bind(this));
      } else {
        Api.isOpen(idHolder.communityId).then((response) => {
          if (response.isOpen) {
            goToCast(response.nextLiveId);
          }
        });
      }
    });
  }
}
