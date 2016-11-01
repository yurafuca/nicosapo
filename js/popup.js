const bg = chrome.extension.getBackgroundPage();

$(function()
{
	Promise.resolve()
		.then(Loading.start)
		.then(isLogined)
			.catch(function(e) {
				Loading.done();
				showErrorMessage();
				reject();
			})
		.then(bg.loadLiveStreams)
		.then(function($videoInfos) {
			return new Promise(function(resolve, reject) {
				if ($videoInfos.length === 0) {
					Loading.done();
					showZeroMessage();
					reject();
				}
				resolve($videoInfos);
			});
		})
		.then(show)
		.then(Loading.done);
});

function show($doms)
{	
	console.info($doms);
	return new Promise(function(resolve, reject) {
		var length = $doms.length;
		$doms.each(function(index) {
			append($('#communities'), $(this), index);
			resolve();
			if (index == length - 1) {
				resolve();
			}
		});
	});
}

function showErrorMessage()
{
	var $message = $('<div class="message"></div>');
	$message.text('ニコニコ動画にログインしていません．ログインしてから再度試してください．');

	$('#communities').html($message);
}

function showZeroMessage()
{
	var $message = $('<div class="message"></div>');
	$message.text('放送中の番組がありません．');

	$('#communities').html($message);
}

function append($dom, $videoInfo, positionNumber)
{
	var thumbnail	= $videoInfo.find('community thumbnail').text();
	var title		= $videoInfo.find('video title').text();
	var id			= $videoInfo.find('video id').text();

	var $community = $(`
		<div class="community">
			<a href="" target="_blank">
				<span class="thumbnail"></span>
			</a>
		</div>
	`);

	$('.thumbnail', $community).css('background-image', 'url(' + thumbnail + ')');
	$('a', $community).attr('href', "http://live.nicovideo.jp/watch/" + id);

	let hasManyChar = title.length > 16;
	let isTopRaw    = positionNumber < 5;
	let isCenter    = positionNumber % 5 == 2;
	let isBothEnds  = positionNumber % 5 == 0 || positionNumber % 5 == 4;
	let offset      = 10;
	let charPerLine = 16;

	if (hasManyChar && isTopRaw && !isBothEnds) {
		if (isCenter)
			offset = -3;
		else
			charPerLine = 15;
	}

	$community.data('powertip', wordWrap(title, charPerLine));
	
	$.fn.powerTip.smartPlacementLists.n = ['n', 's', 'ne', 'nw', 'e', 'w', 'n'];
	$community.powerTip({
		smartPlacement: true,
		fadeInTime: 30,
		fadeOutTime: 30,
		closeDelay: 0,
		intentPollInterval: 0,
		offset: offset
	});

	$dom.append($community);
}

function wordWrap(text, length)
{
    reg = new RegExp("(.{" + parseInt(length) + "})", "g");
    return text.replace(/[\r|\r\n|\n]/g, "").replace(reg, "$1" + "<br>");
}

class Loading
{
	static start() {
		$('#communities').addClass('nowloading');
	}

	static done() {
		$('#communities').removeClass('nowloading');
	}
}