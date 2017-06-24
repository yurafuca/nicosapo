import Api from '../api/Api';
import store from 'store';
import NiconamaTabs from '../modules/NiconamaTabs'

const _listKey = 'autoEnterCommunityList';
const _notificationTitle = '自動入場（コミュニティ/チャンネル）';

// export default class AutoEnterProgram {
export default class AutoEnterCommunity {
  exec(id) {

    Api.isOpen(id).then((response) => {
      let storagedData = {};
      if (store.get(_listKey)) {
        storagedData = store.get(_listKey);
      }
      if (response.isOpen) {
        // OPENED
        const lastState = storagedData[response.requestId].state;
        if (lastState === 'offair') {
          storagedData[response.requestId].state = 'onair';

          // 自動次枠移動が有効になっている場合は無視する．
          const tabId = NiconamaTabs.getTabId(id);
          if (tabId) {
            chrome.tabs.sendMessage(Number(tabId), `isEnableChecking`, null, (response) => {
              console.log(`castId = ${id}, tabId = ${tabId}, autoRedirect = ${response}`);
              if (response) {
                const communityData = store.get('autoEnterCommunityList')[id];
                const options = {
                  body: `放送が始まりましたが，自動次枠移動が有効になっているため，自動入場をキャンセルしました．`,
                  icon: communityData.thumbnail
                };
                const duration = store.get('options.openingNotification.duration') || 6;
                const notification = new Notification(communityData.title, options);
                setTimeout((notification) => { notification.close(); }, duration * 1000);
                return;
              }
              chrome.tabs.create({ url: `http://live.nicovideo.jp/watch/${id}` }, () => {
                const options = {
                  type: 'basic',
                  title: _notificationTitle,
                  message: storagedData[id].title,
                  iconUrl: storagedData[id].thumbnail
                };
                chrome.notifications.create(id, options);
              });
            });
          }
        } else if (lastState === 'onair' || lastState === 'init') {
          storagedData[response.requestId].state = 'onair';
        }
      } else {
        // CLOSED
        storagedData[response.requestId].state = 'offair';
      }
      store.set(_listKey, storagedData);
    });
  }
}
