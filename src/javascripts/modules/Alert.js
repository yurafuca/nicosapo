import Sound from "../modules/Sound";
import WebNotification from "../modules/WebNotification";

import store from "store";

export default class Alert {
  static fire($info) {
    const play = store.get("options.playsound.enable");
    if (play == "enable" || play == null) {
      Alert._ding();
    }
    const popup = store.get("options.popup.enable");
    if (popup == "enable" || popup == null) {
      Alert._popup($info);
    }
  }

  static _ding() {
    const sound = new Sound();
    sound.play();
  }

  static _popup($videoInfos) {
    const notification = new WebNotification();
    console.log("alert!");
    console.log($videoInfos);
    notification.show($videoInfos);
  }
}
