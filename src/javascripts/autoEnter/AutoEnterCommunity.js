import Api from '../api/Api';
import store from 'store';
import NiconamaTabs from '../modules/NiconamaTabs'

const _listKey = 'autoEnterCommunityList';
const _notificationTitle = '自動入場（コミュニティ/チャンネル）';

const _move = (storagedData, id) => {
  console.log('move');
  chrome.tabs.create({ url: `http://live.nicovideo.jp/watch/${id}` }, () => {
    const options = {
      type: 'basic',
      title: _notificationTitle,
      message: storagedData[id].title,
      iconUrl: storagedData[id].thumbnail
    };
    chrome.notifications.create(id, options);
  });
}

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
          store.set(_listKey, storagedData);
          // 自動次枠移動が有効になっている場合は無視する．
          const tabId = NiconamaTabs.getTabId(id);
          if (tabId) {
            chrome.tabs.sendMessage(Number(tabId), `isEnableChecking`, null, (response) => {
              console.log(`castId = ${id}, tabId = ${tabId}, autoRedirect = ${response}`);
              if (response) {
                console.log('ignore');
                const communityData = store.get('autoEnterCommunityList')[id];
                const options = {
                  body: `自動入場をキャンセルしました．この放送を開いている自動次枠移動が ON のタブがあります．`,
                  icon: communityData.thumbnail
                };
                const notification = new Notification(communityData.title, options);
                notification.onclick = () => {
                  chrome.tabs.update(Number(tabId), { active: true });
                };
                store.set(_listKey, storagedData);
              } else {
                _move(storagedData, id);
              }
            });
          } else {
            _move(storagedData, id);
          }
        } else if (lastState === 'onair' || lastState === 'init') {
          storagedData[response.requestId].state = 'onair';
          store.set(_listKey, storagedData);
        }
      } else {
        // CLOSED
        storagedData[response.requestId].state = 'offair';
        store.set(_listKey, storagedData);
      }
      store.set(_listKey, storagedData);
    });
  }
}
