import IdHolder from "../modules/IdHolder";
import Api from "../api/Api";

chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  console.log(_isEnableChecking);
  if (request == `isEnableChecking`) {
    sendResponse(_isEnableChecking);
  }
});

const idHolder = new IdHolder();
const goToCast = liveId => {
  const baseUrl = "http://live.nicovideo.jp/watch/";
  const liveUrl = baseUrl + liveId;
  window.location.href = liveUrl;
  // window.location.replace(liveUrl);
};
let _prolongReceiver = null;
let _isEnableChecking = true;

export default class NewCastChecker {
  constructor() {
    chrome.runtime.sendMessage({
        purpose: "getFromLocalStorage",
        key: "options.autoJump.enable"
      },
      response => {
        if (response == "enable" || response == null) {
          _isEnableChecking = true;
        } else {
          _isEnableChecking = false;
        }
      }
    );
  }

  run() {
    this.repeat(this.checkNewCast.bind(this));
  }

  setProlongReceiver(func) {
    _prolongReceiver = func;
  }

  setMode(isEnable) {
    _isEnableChecking = isEnable;
  }

  repeat(repeatFunc) {
    chrome.runtime.sendMessage({
        purpose: "getFromLocalStorage",
        key: "options.redirect.time"
      },
      response => {
        const intervalTime = response || 30;
        setTimeout(repeatFunc, intervalTime * 1000);
      }
    );
  }

  checkNewCast() {
    // Ignore when id is not properly parsed.
    // TODO: Show notification to users.
    if (idHolder.liveId == null || idHolder.communityId == null) {
      return
    }
    Api.isOpen(idHolder.liveId).then(response => {
      if (response.isOpen) {
        if (_prolongReceiver) {
          _prolongReceiver(response);
        }
      } else {
        if (_isEnableChecking) {
          Api.isOpen(idHolder.communityId).then(response => {
            if (response.isOpen) {
              goToCast(response.nextLiveId);
            }
          });
        }
      }
      this.repeat(this.checkNewCast.bind(this));
    });
  }
}