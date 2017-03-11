import Sound from '../modules/Sound'
import WebNotification from '../modules/WebNotification'

import store from 'store'

export default class Alert {
  static fire($info) {
    if (store.get('options.playsound.enable') == 'enable') {
      Alert._ding();
    }
    if (store.get('options.popup.enable') == 'enable') {
      Alert._popup($info);
    }
  }

  static _ding() {
    const sound = new Sound();
    sound.play();
  }

  static _popup($videoInfos) {
    const notification = new WebNotification();
    notification.show($videoInfos);
  }
}
