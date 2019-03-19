import Api from "../api/Api";
import store from "store";
import NiconamaTabs from "../modules/NiconamaTabs";

const _listKey = "autoEnterCommunityList";
const _notificationTitle = "自動入場（コミュニティ/チャンネル）";

const _move = (storagedData, id) => {
  console.log("move");
  chrome.tabs.create({ url: `https://live.nicovideo.jp/watch/${id}` }, () => {
    const options = {
      type: "basic",
      title: _notificationTitle,
      message: storagedData[id].title,
      iconUrl: storagedData[id].thumbnail
    };
    chrome.notifications.create(id, options);
  });
};

// export default class AutoEnterProgram {
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

// タブで開く//
// キャンセルした場合は通知だけ
// 状態を更新

export  class AutoEnterCommunity {
  exec(id) {
    Api.isOpen(id).then(response => {
      const storagedData = store.get(_listKey) || {};
      if (response.isOpen) {
        const lastState = storagedData[response.requestId].state;
        storagedData[response.requestId].state = "onair";
        store.set(_listKey, storagedData);
        if (lastState === "offair") {
          // 自動次枠移動が有効になっている場合は無視する．
          const tabId = NiconamaTabs.getTabId(id);
          if (tabId) {
            chrome.tabs.sendMessage(
              Number(tabId),
              `isEnableChecking`,
              null,
              response => {
                console.log(
                  `castId = ${id}, tabId = ${tabId}, autoRedirect = ${response}`
                );
                if (response) {
                  const communityData = store.get("autoEnterCommunityList")[id];
                  const options = {
                    body: `自動入場をキャンセルしました．この放送を開いている自動次枠移動が ON のタブがあります．`,
                    icon: communityData.thumbnail
                  };
                  const notification = new Notification(
                    communityData.title,
                    options
                  );
                  notification.onclick = () => {
                    chrome.tabs.update(Number(tabId), { active: true });
                  };
                  store.set(_listKey, storagedData);
                } else {
                  _move(storagedData, id);
                }
              }
            );
          } else {
            storagedData[response.requestId].state = "onair";
            store.set(_listKey, storagedData);
            _move(storagedData, id);
          }
        }
      } else {
        // CLOSED
        storagedData[response.requestId].state = "offair";
        store.set(_listKey, storagedData);
      }
      store.set(_listKey, storagedData);
    });
  }
}
