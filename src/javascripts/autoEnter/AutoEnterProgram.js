import Api from "../api/Api";
import store from "store";

const _listKey = "autoEnterProgramList";
const _notificationTitle = "自動入場（番組）";

// タブで開く
// localStorage から消す

export default class AutoEnterProgram {
  exec(id) {
    Api.isOpen(id).then(response => {
      if (response.isOpen) {
        chrome.tabs.create(
          { url: `https://live.nicovideo.jp/watch/${response.nextLiveId}` },
          () => {
            let storagedData = {};
            if (store.get(_listKey)) {
              storagedData = store.get(_listKey);
            }
            const options = {
              type: "basic",
              title: _notificationTitle,
              message: storagedData[id].title,
              iconUrl: storagedData[id].thumbnail
            };
            chrome.notifications.create(id, options);
            console.info(
              `[nicosapo] Delete storagedData[${id}] `,
              storagedData[id]
            );
            delete storagedData[id];
            store.set(_listKey, storagedData);
          }
        );
      }
    });
  }
}
