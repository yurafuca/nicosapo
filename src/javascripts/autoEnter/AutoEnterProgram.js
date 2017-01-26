import Napi from '../api/Api';

const _listKey = 'autoEnterProgramList';
const _notificationTitle = '自動入場（番組）';

export default class AutoEnterProgram {
  exec(id) {
    Napi.isOpen(id).then((response) => {
      if (response.isOpen) {
        let storagedData = {};
        if (localStorage.getItem(_listKey)) {
          storagedData = JSON.parse(localStorage.getItem(_listKey));
        }
        chrome.tabs.create({ url: `http://live.nicovideo.jp/watch/${id}` }, () => {
          const options = {
            type: 'basic',
            title: _notificationTitle,
            message: storagedData[id].title,
            iconUrl: storagedData[id].thumbnail
          };
          chrome.notifications.create(id, options);
          console.info(`[nicosapo] Delete storagedData[${id}] `, storagedData[id]);
          delete storagedData[id];
          localStorage.setItem(_listKey, JSON.stringify(storagedData));
        });
      }
    });
  }
}
