import $ from 'jquery'
import NewArrival from "./modules/NewArrival";
import CommunityHolder from "./modules/CommunityHolder";
import Napi from "./api/Api";
import Common from "./common/Common";

const communityHolder = new CommunityHolder();
const newArrival = new NewArrival();

const INTERVAL_TIME = {
  CHECK_NEW_CASTS: 30,
  AUTO_ENTER: 30,
  MERGIN: 3
};

const BADGE_COLOR = '#ff6200';

$(document).ready(() => {
  chrome.browserAction.setBadgeBackgroundColor({ color: BADGE_COLOR });
  refreshBadgeAndDB();
  setInterval(refreshBadgeAndDB, 1000 * INTERVAL_TIME.CHECK_NEW_CASTS);
  setTimeout(() => {
    setInterval(() => {
      Promise.resolve()
        .then(autoEnterProgramRoutine)
        .then(autoEnterCommunityRoutine);
    }, 1000 * INTERVAL_TIME.AUTO_ENTER);
  }, 1000 * 5);
  initAutoEnterCommunityList();
});

const initAutoEnterCommunityList = () => {
  const storagedData = JSON.parse(localStorage.getItem('autoEnterCommunityList'));
  for (const id in storagedData) {
    storagedData[id].state = 'init';
  }
  localStorage.setItem('autoEnterCommunityList', JSON.stringify(storagedData));
};

const refreshBadgeAndDB = () => {
  Promise.resolve()
    .then(Napi.isLogined)
    .catch(() => { setBadgeText('x'); })
    .then(() => Napi.loadCasts('user'))
    .then(($videoInfos) => {
      setBadgeText(removeReservation($videoInfos).length);
      $.each(newArrival.get($videoInfos), (index, $infos) => {
        if (communityHolder.isNew($infos)) {
          // $infos is a followed community by a user as NEWLY.
          // Do nothing.
        } else {
          if (Common.enabledOrNull(localStorage.getItem('options.playsound.enable'))) {
            const soundFile = localStorage.getItem('options.soundfile') || 'ta-da.mp3';
            const volume    = localStorage.getItem('options.playsound.volume') || 1.0;
            const audio     = new Audio(`sounds/${soundFile}`);
            audio.volume    = volume;
            audio.play();
          }
          if (Common.enabledOrNull(localStorage.getItem('options.popup.enable'))) {
            const communityId = `co${$infos.find('community id').text()}`;
            const liveId = $infos.find('video id').text();
            if (!existsInAutoLists(communityId, liveId)) {
              showNotification($infos);
            }
          }
        }
      });
      newArrival.setSource($videoInfos);
    });
  // Get a list of following communities.
  Napi.getCheckList().then((idList) => {
    communityHolder.setSource(idList);
  });
}

const existsInAutoLists = (communityId, liveId) => {
  let autoEnterCommunityList = {};
  let autoEnterProgramList = {};
  if (localStorage.getItem('autoEnterCommunityList')) {
    autoEnterCommunityList = JSON.parse(localStorage.getItem('autoEnterCommunityList'));
  }
  if (localStorage.getItem('autoEnterProgramList')) {
    autoEnterProgramList = JSON.parse(localStorage.getItem('autoEnterProgramList'));
  }
  for (const id in autoEnterCommunityList) {
    if (id === communityId) {
      return true;
    }
  }
  for (const id in autoEnterProgramList) {
    if (id === liveId) {
      return true;
    }
  }
  return false;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // getFromLocalStorage
  if (request.purpose == 'getFromLocalStorage') {
    sendResponse(localStorage.getItem(request.key));
    return;
  }

  // saveToLocalstorage
  if (request.purpose == 'saveToLocalStorage') {
    localStorage.setItem(request.key, request.value);
    return;
  }

  // removeFromLocalStorage
  if (request.purpose == 'removeFromLocalStorage') {
    localStorage.removeItem(request.key);
    return;
  }

  // getFromNestedLocalStorage
  if (request.purpose == 'getFromNestedLocalStorage') {
    let storagedData = {};
    if (localStorage.getItem(request.key)) {
      storagedData = JSON.parse(localStorage.getItem(request.key));
    }
    sendResponse(storagedData);
  }

  // saveToNestedLocalStorage
  // localStorage->{id->{state, test, ...}, id->{state, test, ...}}
  if (request.purpose == 'saveToNestedLocalStorage') {
    let storagedData = {};
    if (localStorage.getItem(request.key)) {
      storagedData = JSON.parse(localStorage.getItem(request.key));
    }
    storagedData[request.innerKey] = {};
    storagedData[request.innerKey].state = request.innerValue.state;
    storagedData[request.innerKey].thumbnail = request.innerValue.thumbnail;
    storagedData[request.innerKey].title = request.innerValue.title;
    if (request.innerValue.openDate) {
      storagedData[request.innerKey].openDate = request.innerValue.openDate;
    }
    if (request.innerValue.owner) {
      storagedData[request.innerKey].owner = request.innerValue.owner;
    }
    localStorage.setItem(request.key, JSON.stringify(storagedData));
    return;
  }

  // removeFromNestedLocalStorage
  if (request.purpose == 'removeFromNestedLocalStorage') {
    let storagedData = {};
    if (localStorage.getItem(request.key)) {
      storagedData = JSON.parse(localStorage.getItem(request.key));
    }
    console.info('[nicosapo] Delete storagedData[innerKey] ', storagedData[request.innerKey]);
    delete storagedData[request.innerKey];
    localStorage.setItem(request.key, JSON.stringify(storagedData));
    return;
  }
});

const autoEnterProgramRoutine = () => {
  new Promise((resolve) => {
    let storagedData = {};
    if (localStorage.getItem('autoEnterProgramList')) {
      storagedData = JSON.parse(localStorage.getItem('autoEnterProgramList'));
    }
    const tasks = [];
    for (const id in storagedData) {
      tasks.push(test.bind(null, id, storagedData));
    }
    const length = tasks.length;
    if (tasks.length === 0) {
      resolve();
    }
    for (let i = 0; i < tasks.length; i++) {
      (() => {
        setTimeout(() => {
          tasks[i].call(null);
          console.info('(i, length) = ', i, length);
          if (i === length - 1) {
            setTimeout(resolve, 1000 * INTERVAL_TIME.MERGIN);
          }
        }, i * 1000 * INTERVAL_TIME.MERGIN); // 連続アクセスを防ぐ
      })(i, length);
    }
  });
};

const test = (id, storagedData) => {
  new Promise((resolve) => {
    Napi.isOffAir(id).then((response) => {
      // ONAIR
      if (response.isOffAir == false) {
        chrome.tabs.create({
          url: `http://live.nicovideo.jp/watch/${id}`
        }, () => {
          const options = {
            type: "basic",
            title: "自動入場（番組）",
            message: storagedData[id]['title'],
            iconUrl: storagedData[id]['thumbnail']
          };
          chrome.notifications.create(id, options);
          // Remove.
          console.info(`[nicosapo] Delete storagedData[${id}] `, storagedData[id]);
          delete storagedData[id];
          localStorage.setItem('autoEnterProgramList', JSON.stringify(storagedData));
          resolve();
        });
      }
      resolve();
    });
  });
};

const autoEnterCommunityRoutine = () => {
  new Promise((resolve) => {
    let storagedData = {};
    if (localStorage.getItem('autoEnterCommunityList')) {
      storagedData = JSON.parse(localStorage.getItem('autoEnterCommunityList'));
    }
    const tasks = [];
    for (const id in storagedData) {
      tasks.push(checkAndOpenFreshCast.bind(null, id, storagedData));
    }
    const length = tasks.length;
    if (tasks.length === 0) {
      resolve();
    }
    for (let i = 0; i < tasks.length; i++) {
      (() => {
        setTimeout(() => {
          tasks[i].call(null);
          console.info('(i, length) = ', i, length);
          if (i === length - 1) {
            resolve();
          }
        }, i * 1000 * INTERVAL_TIME.MERGIN); // 連続アクセスを防ぐ
      })(i, length);
    }
  });
};

const checkAndOpenFreshCast = (id, storagedData) => {
  Napi.isStartedBroadcast(id).then((result) => {
    if (result.isStarted == true) {
      const lastState = storagedData[result.communityId]['state'];
      if (lastState == 'offair') {
        chrome.tabs.create({
          url: `http://live.nicovideo.jp/watch/${result.nextBroadcastId}`
        });
        const options = {
          type: "basic",
          title: "自動入場（コミュニティ）",
          message: storagedData[result.communityId]['title'],
          iconUrl: storagedData[result.communityId]['thumbnail'],
        };
        chrome.notifications.create(id, options);
      }
      console.info('id = ', result.communityId);
      storagedData[result.communityId]['state'] = 'onair';
    } else {
      console.info('id = ', result.communityId);
      storagedData[result.communityId]['state'] = 'offair';
    }
    console.info('id = ', result.communityId);
    localStorage.setItem('autoEnterCommunityList', JSON.stringify(storagedData));
  });
};

const showNotification = (newInfos) => {
  const options = {
    type: "basic",
    title: "放送開始のお知らせ",
    message: $(newInfos).first().find('video title').text(),
    iconUrl: $(newInfos).first().find('community thumbnail').text()
  };
  const id = $(newInfos).first().find('video id').text();
  chrome.notifications.create(id, options);
}

chrome.notifications.onClicked.addListener((id) => {
  chrome.tabs.create({
    url: `http://live.nicovideo.jp/watch/${id}`,
    active: true
  });
});

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
  console.info($videoInfos);
  $.each($videoInfos, (index, $item) => {
    const is_reserved = $item.find('video is_reserved').text();
    if (is_reserved == 'false') {
      result.push($item);
    }
  });
  console.info(result);
  return $(result);
};
