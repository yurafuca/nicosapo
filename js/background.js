const arrivalMan = new ArrivalMan();

$(function()
{
	chrome.browserAction.setBadgeBackgroundColor({
		color: "#ff6200"
	});

	refresh();
	setInterval(refresh, 1000 * 20);
});

function refresh()
{
	loadLiveStreams()
	.catch(function(e) {
		setBadgeText('x');
	})
	.then(function(videoInfos) {
		setBadgeText(count(videoInfos));
		let newArrivals = arrivalMan.getArrivals(videoInfos);
		console.log(newArrivals);

		let thumbnail = $(newArrivals).first().find('community thumbnail').text();
		let options = {
		  type: "basic",
		  title: "ニコ生ウォッチャー",
		  message: $(newArrivals).first().find('video title').text(),
		  iconUrl: thumbnail
		};
		chrome.notifications.create(options);
		// below function must be exe finally.
		arrivalMan.setSource(videoInfos);
	});
}

function loadLiveStreams()
{
	return new Promise(function(resolve, reject) {
		getSessionId().then(getSubscribe).then(normalize).then(
			function($videoInfos) {
				var $videoInfosNow = removeReservation($videoInfos);
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