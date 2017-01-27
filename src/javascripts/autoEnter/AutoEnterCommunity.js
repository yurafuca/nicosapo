import Api from '../api/Api';

const _listKey = 'autoEnterCommunityList';
const _notificationTitle = '自動入場（コミュニティ/チャンネル）';

export default class AutoEnterProgram {
  exec(id) {
    Api.isOpen(id).then((response) => {
      let storagedData = {};
      if (localStorage.getItem(_listKey)) {
        storagedData = JSON.parse(localStorage.getItem(_listKey));
      }
      if (response.isOpen) {
        // OPENED
        const lastState = storagedData[response.requestId].state;
        if (lastState === 'offair') {
          storagedData[response.requestId].state = 'onair';
          chrome.tabs.create({ url: `http://live.nicovideo.jp/watch/${id}` }, () => {
            const options = {
              type: 'basic',
              title: _notificationTitle,
              message: storagedData[id].title,
              iconUrl: storagedData[id].thumbnail
            };
            chrome.notifications.create(id, options);
          });
        } else if (lastState === 'onair' || lastState === 'init') {
          storagedData[response.requestId].state = 'onair';
        }
      } else {
        // CLOSED
        storagedData[response.requestId].state = 'offair';
      }
      console.info('id = ', response.requestId);
      localStorage.setItem(_listKey, JSON.stringify(storagedData));
    });
  }
}
