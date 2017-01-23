import $ from 'jquery'
import NewArrival from "./modules/NewArrival";
import ComuHolder from "./modules/CommunityHolder";
import Napi from "./api/Api";

let comuHolder = new ComuHolder();
let newArrival = new NewArrival();
let broadcastTabs = [];

$(function () {

  Napi.getSubscribe_2();

  chrome.browserAction.setBadgeBackgroundColor({
    color: "#ff6200"
  });

  refresh();

  setInterval(refresh, 1000 * 30);

  setTimeout(function () {
    setInterval(function () {
      Promise.resolve()
        .then(autoEnterProgramRoutine)
        .then(autoEnterCommunityRoutine);
    }, 1000 * 30);
  }, 1000 * 5);


  const storagedData = JSON.parse(localStorage['autoEnterCommunityList']);
  for (let id in storagedData) {
    storagedData[id].state = 'init';
  }
  localStorage['autoEnterCommunityList'] = JSON.stringify(storagedData);
});

function refresh() {
  Promise.resolve()
    .then(Napi.isLogined)
    .catch(function (e) {
      setBadgeText('x');
      reject();
    })
    .then(function () {
      return Napi.loadCasts('user');
    })
    .then(function (videoInfos) {
      console.info('[imanani] videoInfos = ', videoInfos);
      count(removeReservation(videoInfos)).then(setBadgeText);
      $.each(newArrival.get(videoInfos), function (index, infos) {
        if (comuHolder.isNew(infos)) {
          // Do nothing.
        } else {
          if (enableOrNull(localStorage.getItem('options.playsound.enable'))) {
            const soundfile = localStorage.getItem('options.soundfile') || 'ta-da.mp3';
            const volume = localStorage.getItem('options.playsound.volume') || 1.0;
            const audio = new Audio('sounds/' + soundfile);
            audio.volume = volume;
            audio.play();
          }
          if (enableOrNull(localStorage.getItem('options.popup.enable'))) {
            const communityId = 'co' + $(infos).find('community id').text();
            const liveId = $(infos).find('video id').text();
            if (!isExistsInAutoLists(communityId, liveId)) {
              showNotification(infos);
            }
          }
        }
      });
      newArrival.setSource(videoInfos);
    });

  Napi.getCheckList().then(function (idList) {
    comuHolder.setSource(idList);
  });
}

function isExistsInAutoLists(communityId, liveId) {
  let autoEnterCommunityList = localStorage['autoEnterCommunityList'];
  let autoEnterProgramList = localStorage['autoEnterProgramList'];

  if (autoEnterCommunityList) {
    autoEnterCommunityList = JSON.parse(autoEnterCommunityList);
  } else {
    autoEnterCommunityList = {};
  }

  if (autoEnterProgramList) {
    autoEnterProgramList = JSON.parse(autoEnterProgramList);
  } else {
    autoEnterProgramList = {};
  }

  for (let id in autoEnterCommunityList) {
    console.info(id);
    if (id === communityId) {
      console.info(true);
      return true;
    }
  }

  for (let id in autoEnterProgramList) {
    console.info(id);
    if (id === liveId) {
      console.info(true);
      return true;
    }
  }

  console.info(false);

  return false;

}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // getFromLocalStorage
  if (request.purpose == 'getFromLocalStorage') {
    sendResponse(localStorage[request.key]);
    return;
  }

  // saveToLocalstorage
  if (request.purpose == 'saveToLocalStorage') {
    localStorage[request.key] = request.value;
    return;
  }

  // removeFromLocalStorage
  if (request.purpose == 'removeFromLocalStorage') {
    localStorage.removeItem(request.key);
    return;
  }

  // getFromNestedLocalStorage
  if (request.purpose == 'getFromNestedLocalStorage') {
    let storagedData;
    if (localStorage[request.key])
      storagedData = JSON.parse(localStorage[request.key]);
    else
      storagedData = {};
    sendResponse(storagedData);
  }

  // saveToNestedLocalStorage
  // localStorage->{id->{state, test, ...}, id->{state, test, ...}}
  if (request.purpose == 'saveToNestedLocalStorage') {
    let storagedData;

    if (localStorage[request.key]) {
      storagedData = JSON.parse(localStorage[request.key]);
    } else {
      storagedData = {};
    }

    storagedData[request.innerKey] = {};
    storagedData[request.innerKey]['state'] = request.innerValue.state;
    storagedData[request.innerKey]['thumbnail'] = request.innerValue.thumbnail;
    storagedData[request.innerKey]['title'] = request.innerValue.title;

    if (request.innerValue.openDate) {
      storagedData[request.innerKey]['openDate'] = request.innerValue.openDate;
    }

    if (request.innerValue.owner) {
      storagedData[request.innerKey]['owner'] = request.innerValue.owner;
    }

    localStorage[request.key] = JSON.stringify(storagedData);
    return;
  }

  // removeFromNestedLocalStorage
  if (request.purpose == 'removeFromNestedLocalStorage') {
    let storagedData = JSON.parse(localStorage[request.key]);
    console.info('[imanani] Delete storagedData[innerKey] ', storagedData[request.innerKey]);
    delete storagedData[request.innerKey];
    localStorage[request.key] = JSON.stringify(storagedData);
    return;
  }
});

function enableOrNull(value) {
  return (value === 'enable') || value == null;
}


function autoEnterProgramRoutine() {
  return new Promise(function (resolve, reject) {
    console.info('autoEnterProgramRoutine');

    let storagedData = localStorage['autoEnterProgramList'];

    if (storagedData) {
      storagedData = JSON.parse(storagedData);
    } else {
      storagedData = {};
    }

    let tasks = [];

    for (let id in storagedData) {
      tasks.push(test.bind(null, id, storagedData));
    }

    console.info(tasks);

    const length = tasks.length;

    if (tasks.length === 0) {
      resolve();
    }

    for (let i = 0; i < tasks.length; i++) {
      setTimeout(function () {
        tasks[i].call(null);
        console.info('i = ', i);
        console.info('length = ', length);
        if (i === length - 1) {
          console.info('resolve');
          setTimeout(resolve, 3000);
        }
      }.bind(null, i, length), i * 3000); // 連続アクセスを避ける
    }
  });
}

function test(id, storagedData) {
  return new Promise(function (resolve) {
    console.info('[imanani][●autoEnterProgram] id = ', id);
    Napi.isOffAir(id).then(function (response) {
      // ONAIR
      if (response.isOffAir == false) {
        console.info('[imanani][○autoEnterProgram] id = ', id);
        chrome.tabs.create({
          url: 'http://live.nicovideo.jp/watch/' + id
        }, function () {
          let options = {
            type: "basic",
            title: "自動入場（番組）",
            message: storagedData[id]['title'],
            iconUrl: storagedData[id]['thumbnail']
          };
          chrome.notifications.create(id, options);
          // Remove.
          console.info('[imanani] Delete storagedData[' + id + '] ', storagedData[id]);
          delete storagedData[id];
          localStorage['autoEnterProgramList'] = JSON.stringify(storagedData);
          resolve();
        });
      }
      resolve();
    });
  });
}

function autoEnterCommunityRoutine() {
  return new Promise(function (resolve, reject) {
    console.info('autoEnterCommunityRoutine');

    let storagedData = localStorage['autoEnterCommunityList'];

    if (storagedData) {
      storagedData = JSON.parse(storagedData);
    } else {
      storagedData = {};
    }

    console.debug('storagedData = ', storagedData);

    let tasks = [];

    for (let id in storagedData) {
      tasks.push(checkAndOpenFreshCast.bind(null, id, storagedData));
    }

    const length = tasks.length;

    if (tasks.length === 0) {
      resolve();
    }

    for (let i = 0; i < tasks.length; i++) {
      setTimeout(function () {
        tasks[i].call(null);
        console.info('i = ', i);
        console.info('length = ', length);
        if (i === length - 1) {
          console.info('resolve');
          resolve();
        }
      }.bind(null, i, length), i * 2000); // 連続アクセスを避ける
    }
  });
}

function checkAndOpenFreshCast(id, storagedData) {
  Napi.isStartedBroadcast(id).then(function (result) {
    if (result.isStarted == true) {
      let lastState = storagedData[result.communityId]['state'];
      if (lastState == 'offair') {
        chrome.tabs.create({
          url: 'http://live.nicovideo.jp/watch/' + result.nextBroadcastId
        });
        let options = {
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
    localStorage['autoEnterCommunityList'] = JSON.stringify(storagedData);
  });
}

function showNotification(newInfos) {
  let options = {
    type: "basic",
    title: "放送開始のお知らせ",
    message: $(newInfos).first().find('video title').text(),
    iconUrl: $(newInfos).first().find('community thumbnail').text()
  };
  console.log(newInfos);
  let id = $(newInfos).first().find('video id').text();
  chrome.notifications.create(id, options);
}

chrome.notifications.onClicked.addListener(function (id) {
  chrome.tabs.create({
    url: 'http://live.nicovideo.jp/watch/' + id,
    active: true
  });
});

function count(obj) {
  return new Promise(function (resolve, reject) {
    if (obj === null || typeof obj === 'undefined') {
      reject(new Error('Object for count is invalid.'));
      return;
    }
    resolve(obj.length);
  });
}

function setBadgeText(value) {
  return new Promise(function (resolve, reject) {
    if (value == 0) {
      value = '';
    }
    chrome.browserAction.setBadgeText({
      text: String(value)
    });
    resolve();
  });
}

function removeReservation(videoInfos) {
  var result = [];

  console.info(videoInfos);

  $.each($(videoInfos), function (index, item) {
    const is_reserved = $(item).find('video is_reserved').text();
    if (is_reserved == 'false') {
      result.push(item);
    }
  });

  console.info(result);
  return $(result);
}
