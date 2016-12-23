let comuHolder = new ComuHolder();
let newArrival = new NewArrival();
let broadcastTabs = [];

class Account {
    static isLogined() {
        return isLogined();
    }
}

class Api {
    static getStatusByBroadcast(broadcastId) {
        return new Promise(function(resolve, reject) {
            Api.getStatus(broadcastId).then(function(response) {
                if (response)
                    resolve(response);
                else
                    reject();
            });
        });
    }

    static getStatusByCommunity(communityId) {
        return new Promise(function(resolve, reject) {
            Api.getStatus(communityId).then(function(response) {
                if (response)
                    resolve(response);
                else
                    reject();
            });
        });
    }

    static getStatus(param) {
        return new Promise(function(resolve, reject) {
            const endpoint = "http://watch.live.nicovideo.jp/api/getplayerstatus?v=";
            const posting = $.get(endpoint + param);

            posting.done(function(response) {
                let status = $(response).find('getplayerstatus').attr('status');
                console.info('[imanani][getStatus] response = ', response);
                resolve(response);
            });
        });
    }
}

function loadCasts(liveType) {
    return new Promise(function(resolve, reject) {
        console.info('[imanani][Broadcasts.loadAnyBroadcasts] liveType = ', liveType);
        if (liveType == 'user') {
            getSessionId().then(getSubscribe).then(normalize).then(
                function($videoInfos) {
                    // var $videoInfosNow = removeReservation($videoInfos);
                    // console.info($videoInfosNow);
                    // resolve($videoInfosNow);
                    resolve($videoInfos);
                }
            ).catch(reject);
        }
        if (liveType == 'official') {
            // return getOfficialOnair();
            getOfficialOnair().then(function(official_lives) {
                console.info(official_lives);
                resolve(official_lives);
            });
        }
        // if (liveType == 'future') {
        //     getFutureOnair().then(function(future_lives) {
        //         console.info(future_lives);
        //         resolve(future_lives);
        //     });
        // }
    });
}

$(function() {
    chrome.browserAction.setBadgeBackgroundColor({
        color: "#ff6200"
    });

    refresh();

    setInterval(refresh, 1000 * 20);

    setTimeout(function() {
        setInterval(autoEnterProgramRoutine, 1000 * 20);
    }, 1000);

    setTimeout(function() {
        setInterval(autoEnterCommunityRoutine, 1000 * 20)
    }, 1000);

    const storagedData = JSON.parse(localStorage['autoEnterCommunityList']);
    for (id in storagedData) {
      storagedData[id].state = 'null';
    }
    localStorage['autoEnterCommunityList'] = JSON.stringify(storagedData);
});

function refresh() {
    Promise.resolve()
        .then(Account.isLogined)
        .catch(function(e) {
            setBadgeText('x');
            reject();
        })
        .then(function() {
            return loadCasts('user');
        })
        .then(function(videoInfos) {
            console.info('[imanani] videoInfos = ', videoInfos);
            count(removeReservation(videoInfos)).then(setBadgeText);
            $.each(newArrival.get(videoInfos), function(index, infos) {
                if (comuHolder.isNew($(infos).find('community'))) {
                    // do nothing.
                    // (new Audio("sound/tada.mp3")).play();
                } else {
                    console.log('hoge');
                    if (enableOrNull(localStorage.getItem('options.playsound.enable'))) {
                        const soundfile = localStorage.getItem('options.soundfile') || 'ta-da.mp3';
                        const volume = localStorage.getItem('options.playsound.volume') || 1.0;
                        const audio = new Audio('sound/' + soundfile);
                        audio.volume = volume;
                        audio.play();
                    }
                    if (enableOrNull(localStorage.getItem('options.popup.enable'))) {
                        showNotification(infos);
                    }
                }
            });
            newArrival.setSource(videoInfos);
        });

    getCheckList().then(function(idList) {
        comuHolder.setSource(idList);
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
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
        storagedData[request.innerKey]['openDate'] = request.innerValue.openDate;
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
    let storagedData;

    // TODO: Fix.
    if (localStorage['autoEnterProgramList']) {
        storagedData = JSON.parse(localStorage['autoEnterProgramList']);
    } else {
        storagedData = {};
    }

    console.log("");
    console.log("");
    console.log("");

    let races = [];

    for (id in storagedData) {
        races.push(test.bind(null, id, storagedData));
    }

    console.info(races);

    for (let i = 0; i < races.length; i++) {
        races[i].call(null);
    }

}

function test(id, storagedData) {
    return new Promise(function(resolve) {
        console.info('[imanani][●autoEnterProgram] id = ', id);
        isOffAir(id).then(function(result) {
            // ONAIR
            if (result == false) {
                console.info('[imanani][○autoEnterProgram] id = ', id);
                chrome.tabs.create({
                    url: 'http://live.nicovideo.jp/watch/' + id
                }, function() {
                    let options = {
                        type: "basic",
                        title: "自動入場",
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
    let storagedData = localStorage['autoEnterCommunityList'];

    // TODO: Fix.
    if (storagedData) {
        storagedData = JSON.parse(storagedData);
    } else {
        storagedData = {};
    }

    console.debug('storagedData = ', storagedData);

    // TODO: foreach.
    for (id in storagedData) {
        isStartedBroadcast(id).then(function(result) {
            if (result.isStarted == true) {
                let lastState = storagedData[id]['state'];
                if (lastState == 'offair') {
                    chrome.tabs.create({
                      url: 'http://live.nicovideo.jp/watch/' + result.nextBroadcastId
                    });
                }
                storagedData[id]['state'] = 'onair';
            } else {
                storagedData[id]['state'] = 'offair';
            }
            localStorage['autoEnterCommunityList'] = JSON.stringify(storagedData);
        });
    }
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

chrome.notifications.onClicked.addListener(function(id) {
    chrome.tabs.create({
        url: 'http://live.nicovideo.jp/watch/' + id,
        active: true
    });
});

function count(obj) {
    return new Promise(function(resolve, reject) {
        if (obj === null || typeof obj === 'undefined') {
            reject(new Error('Object for count is invalid.'));
            return;
        }
        resolve(obj.length);
    });
}

function setBadgeText(value) {
    return new Promise(function(resolve, reject) {
        if (value == 0) {
            value = '';
        }
        chrome.browserAction.setBadgeText({
            text: String(value)
        });
        resolve();
    });
}

function removeReservation($videoInfos) {
    var infosArray = $videoInfos.get();
    var result = [];

    $(infosArray).each(function(index) {
        var currentTime = Date.now();
        var startTime = Date.parse($(infosArray[index]).find('open_time').text());
        if (currentTime > startTime) {
            result.push(infosArray[index]);
        } else {
            // Do nothing (A reservation program).
        }
    });

    return $(result);
}

function normalize(xml) {
    var promise = new Promise(function(resolve, reject) {
        var normalized = '<documents>' + xml.documentElement.innerHTML + '</documents>';
        var $videoInfos = $(normalized).find('video_info');
        resolve($videoInfos);
    });
    return promise;
}
