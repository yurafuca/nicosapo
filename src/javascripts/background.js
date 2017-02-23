import $ from 'jquery';
import store from 'store';
import NewArrival from "./modules/NewArrival";
import CommunityHolder from "./modules/CommunityHolder";
import Api from "./api/Api";
import AutoEnterRunner from './autoEnter/AutoEnterRunner'
import './chrome/runtime.onMessage';

const communityHolder = new CommunityHolder();
const newArrival = new NewArrival();
const INTERVAL = 60 * 1000;

$(document).ready(() => {
  chrome.browserAction.setBadgeBackgroundColor({ color: '#ff6200' });
  refreshBadgeAndDB();
  setInterval(refreshBadgeAndDB, INTERVAL);
  setTimeout(() => {
    setInterval(() => {
      Promise.resolve()
        .then((new AutoEnterRunner()).run('live'))
        .then((new AutoEnterRunner()).run('community'));
    }, INTERVAL);
  }, 1000 * 5);
  initAutoEnterCommunityList();
});

const initAutoEnterCommunityList = () => {
  const list = store.get('autoEnterCommunityList');
  for (const id in list) {
    list[id].state = 'init';
  }
  store.set('autoEnterCommunityList', list);
};

const refreshBadgeAndDB = () => {
  Promise.resolve()
    .then(Api.isLogined)
    .catch(() => { setBadgeText('x'); })
    .then(() => Api.loadCasts('user'))
    .then(($videoInfos) => {
      setBadgeText(removeReservation($videoInfos).length);
      $.each(newArrival.get($videoInfos), (index, $infos) => {
        if (communityHolder.isNew($infos)) {
          /**
           * Do nothing.
           * Reason: $infos is a followed community by a user as NEWLY.
           */
        } else {
          const communityId = `co${$infos.find('community id').text()}`; // co[0-9]+
          const liveId      = $infos.find('video id').text(); // lv[0-9]+
          if (existsInAutoLists(communityId, liveId)) {
            /**
             * Do nothing.
             * Reason: A new broadCast will be show in a notification later.
             */
          } else {
            if (store.get('options.playsound.enable') == 'enable') {
              playSound();
            }
            if (store.get('options.popup.enable') == 'enable') {
              showNotification($infos);
            }
          }
        }
      });
      newArrival.setSource($videoInfos);
    });

  Api.getCheckList().then((idList) => {
    communityHolder.setSource(idList); // Get a list of following communities.
  });
}

const playSound = () => {
  const soundFile = store.get('options.soundfile') || 'ta-da.mp3';
  const volume    = store.get('options.playsound.volume') || 1.0;
  const audio     = new Audio(`sounds/${soundFile}`);
  audio.volume    = volume;
  audio.play();
}

const existsInAutoLists = (communityId, liveId) => {
  const communityList = store.get('autoEnterCommunityList');
  const programList   = store.get('autoEnterProgramList');
  for (const id in communityList) {
    if (id === communityId) {
      return true;
    }
  }
  for (const id in programList) {
    if (id === liveId) {
      return true;
    }
  }
  return false;
}

const showNotification = (newInfos) => {
  const duration = store.get('options.openingNotification.duration') || 6;
  const id = $(newInfos).first().find('video id').text();
  const options = {
    body: $(newInfos).first().find('video title').text(),
    icon: $(newInfos).first().find('community thumbnail').text(),
    tag: id
  };
  const notification = new Notification('放送開始のお知らせ', options);
  setTimeout(notification.close.bind(notification), duration * 1000);
  notification.onclick = () => {
    chrome.tabs.create({
      url: `http://live.nicovideo.jp/watch/${notification.tag}`,
      active: true
    });
  };
}

const setBadgeText = (value) => {
  new Promise((resolve) => {
    if (value == 0) {
      value = '';
    }
    chrome.browserAction.setBadgeText({
      text: String(value)
    });
    resolve();
  });
};

const removeReservation = ($videoInfos) => {
  const result = [];
  $.each($videoInfos, (index, $item) => {
    const is_reserved = $item.find('video is_reserved').text();
    if (is_reserved == 'false') {
      result.push($item);
    }
  });
  return $(result);
};
