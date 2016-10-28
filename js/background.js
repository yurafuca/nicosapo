let comuHolder = new ComuHolder();
let newArrival = new NewArrival();
let broadcastTabs = [];

$(function()
{
	chrome.browserAction.setBadgeBackgroundColor({color: "#ff6200"});

	scanAllTabs();

	refresh();
	autoRedirect();
	
	setInterval(refresh, 1000 * 10);
	setInterval(autoRedirect, 1000 * 10);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  console.log("background: received");

  // requestChromeTab
  if (request.purpose == 'requestChromeTab') {
  	 console.log('purpose: requestChromeTab');
  		chrome.tabs.query({url: request.url}, function(tabs) {
  			console.info(tabs);
  			chrome.tabs.sendMessage(
  				tabs[0].id,
  				{
  					purpose: 'sendChromeTab',
  					tab: tabs[0]
  				}
  			);
  		});
    	return;
    }

    // sendInformationOfBroadcastTab
    if (request.purpose == 'sendInformationOfBroadcastTab') {
    	const broadcastTab = new BroadcastTab(
    		request.tabId,
    		request.communityId,
    		request.broadcastId
    	);
    	broadcastTabs.push(broadcastTab);
    	return;
    }

    // saveToLocalstorage
    if (request.purpose == 'saveToLocalstorage') {
    	sessionStorage[request.key] = request.value;
    	return;
    }

    // removeFromLocalStorage
    if (request.purpose == 'removeFromLocalStorage') {
    	sessionStorage.removeItem(request.key);
    	return;
    }
});

chrome.tabs.onRemoved.addListener(function(tabId, info) {
	console.log('tabid: ' + tabId);
    $.each(broadcastTabs, function(index, broadcastTab) {
    	if (broadcastTabs[index].getTabId() == tabId) {
    		broadcastTabs.splice(index, 1); // Delete broadcastTabs[index];
    	}
    });
});

function scanAllTabs()
{
	chrome.tabs.query({}, function(tabs) {
		$.each(tabs, function(item, tab) {
			const re = /http:\/\/live\.nicovideo\.jp\/watch\/lv([0-9]+)/;

			if (tab.url.match(re)) { // 放送用ページである
				console.log(tab.id);
				chrome.tabs.sendMessage(tab.id,
					{
						purpose: 'requestInformationOfBroadcastTab',
						tab: tab
					}
				);
			}
		});
	});
}

function autoRedirect()
{
	// if (options.autoRedirect == 'disable') {
	// 	return;
	// }
	console.log("BroadcastTabs: ");
	console.info(broadcastTabs);

	$.each(broadcastTabs, function(index, broadcastTab) {
		console.info(broadcastTab);
		if (broadcastTab.isEnabledAutoRedirect()) {
			console.log(broadcastTab.getCommunityId() + ' is enabled auto redirect.');
			broadcastTab.isEnded().then(function(isEnded) {
				console.info(isEnded);
				if (isEnded) {
					console.log("---------------" + broadcastTab.getBroadcastId() + "---------------");
					let communityId = broadcastTab.getCommunityId();
					getOnairBroadcastInformations(communityId)
						.then(function(informations) {
							console.log(informations);
							if (informations == null) {
								// Failed to get a new broadcast url.
								return;
							}

							let broadcastId = $(informations).find('stream id').text();

							broadcastTab.redirectBroadcastPage(broadcastId);
							broadcastTab.setBroadcastId(broadcastId);
						});
				}
			});
		} else {
			console.log(broadcastTab.getCommunityId() + ' is disabled auto redirect.');
		}
	});
}

function refresh()
{
	Promise.resolve()
		.then(isLogined)
			.catch(function(e) {
				setBadgeText('x');
				reject();
			})
		.then(loadLiveStreams)
		.then(function(videoInfos) {
			count(videoInfos).then(setBadgeText);
			$.each(newArrival.get(videoInfos), function(index, infos) {
				if (comuHolder.isNew($(infos).find('community'))) {
					// do nothing.
					// (new Audio("sound/tada.mp3")).play();
				} else {
					console.log('hoge');
					if (enableOrNull(localStorage.getItem('options.playsound.enable'))) {
						const soundfile = localStorage.getItem('options.soundfile') || 'ta-da.mp3';
						(new Audio('sound/' + soundfile)).play();
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

function enableOrNull(value) {
	return (value === 'enable') || value == null;
}

function showNotification(newInfos)
{
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

function loadLiveStreams()
{
	return new Promise(function(resolve, reject) {
		getSessionId().then(getSubscribe).then(normalize).then(
			function($videoInfos) {
				var $videoInfosNow = removeReservation($videoInfos);
				console.info($videoInfosNow);
				resolve($videoInfosNow);
			}
		).catch(reject);
	});
}

function count(obj)
{
	return new Promise(function(resolve, reject) {
		if (obj === null || typeof obj === 'undefined') {
			reject(new Error('Object for count is invalid.'));
			return;
		}
		resolve(obj.length);
	});
}

function setBadgeText(value)
{
	return new Promise(function(resolve, reject) {
		if (value == 0) {
			value = '';
		}
		chrome.browserAction.setBadgeText({text: String(value)});
		resolve();
	});
}

function compareDate(first, second)
{
	var parsedFirst		= Date.parse(first);
	var parsedSecond	= Date.parse(second);

	if (first == 'now') {
		parsedFirst = Date.now();
	}
	if (second == 'now') {
		parsedSecond = Date.now();
	}

	if (parsedFirst == parsedSecond) {
		return 0;
	}
	if (parsedFirst > parsedSecond) {
		return 1;
	}
	if (parsedFirst < parsedSecond) {
		return -1;
	}

	throw new Error("Couldn't compare date correctly");
}

function removeReservation($videoInfos)
{
	var arrayInfos = $videoInfos.get();

	$(arrayInfos).each(function(index) {
		var nowTime		= Date.now();
		var startTime	= $(this).find('open_time').text();
		if (compareDate('now', startTime) > 0) {
			// do nothing.
		} else {
			delete arrayInfos[index];
			// JavaScript dosen't adjust .length value when we delete array item(s).
			arrayInfos.length--;
		}
	});

	var $videoInfosNow = $(arrayInfos);

	return $videoInfosNow;
}

function normalize(xml)
{
	var promise = new Promise(function(resolve, reject) {
		var normalized	= '<documents>' + xml.documentElement.innerHTML + '</documents>';
		var $videoInfos = $(normalized).find('video_info');
		resolve($videoInfos);
	});
	return promise;
}


function showStreamInfo($videoInfo)
{
	var name		= $videoInfo.find('community name').text();
	var title		= $videoInfo.find('video title').text();
	var startTime	= $videoInfo.find('video start_time').text();

	console.log(name);
	console.log(title);
	console.log(startTime);
}
