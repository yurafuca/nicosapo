import IdHolder from "../modules/IdHolder";
import Api from "../api/Api";
import { API_GET_PROGRAM_STATUS, API_GET_LATEST_PROGRAM } from '../chrome/runtime.onMessage';

chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  console.log(_isEnableChecking);
  if (request == `isEnableChecking`) {
    sendResponse(_isEnableChecking);
  }
});

const idHolder = new IdHolder();
const goToCast = liveId => {
  const baseUrl = "https://live.nicovideo.jp/watch/";
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

    chrome.runtime.sendMessage({ purpose: API_GET_PROGRAM_STATUS, programId: idHolder.liveId }, response => {
      // 番組が終了していない。
      if (response.status === "onAir") {
        if (_prolongReceiver) {
          _prolongReceiver(response);
        }
      }

      // 番組が終了した。
      if (response.status === "end" && _isEnableChecking) {
        // 放送中の番組・または予約中の番組を取得する。
        chrome.runtime.sendMessage({ purpose: API_GET_LATEST_PROGRAM, communityId: idHolder.communityId }, response => {
          if (response.programId == null) {
            return;
          }
          chrome.runtime.sendMessage({ purpose: API_GET_PROGRAM_STATUS, programId: response.programId }, response => {
            // 番組が放送中である。
            if (response.status === "onAir") {
              goToCast(response.programId);
            }
          });
        });
      }
    });

    this.repeat(this.checkNewCast.bind(this));
  }
}