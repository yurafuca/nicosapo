import Napi from '../api/Api';

const _listKey = 'autoEnterCommunityList';
const _notificationTitle = '自動入場（コミュニティ/チャンネル）';

export default class AutoEnterProgram {
  exec(id) {
    Napi.isOpen(id).then((response) => {
      let storagedData = {};
      if (localStorage.getItem(_listKey)) {
        storagedData = JSON.parse(localStorage.getItem(_listKey));
      }
      if (response.isOpen) {
        // OPEN
        const lastState = storagedData[response.requestId].state;
        if (lastState !== 'offair') {
          return; // Do nothing.
        }
        chrome.tabs.create({ url: `http://live.nicovideo.jp/watch/${id}` }, () => {
          const options = {
            type: 'basic',
            title: _notificationTitle,
            message: storagedData[id].title,
            iconUrl: storagedData[id].thumbnail
          };
          chrome.notifications.create(id, options);
          console.info('id = ', response.requestId);
          storagedData[response.requestId].state = 'onair';
        });
      } else {
        // CLOSE
        console.info('id = ', response.requestId);
        storagedData[response.requestId].state = 'offair';
      }
    });
  }
}
