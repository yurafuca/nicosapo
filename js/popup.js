const bg = chrome.extension.getBackgroundPage();

$(function()
{
	loadBroadcasts('user');
});

$(function()
{
    $(document).on('click','.tab.non-selected',function() {
        $('.tab').removeClass('selected non-selected');
        $('.tab').not(this).addClass('non-selected');
        $(this).addClass('selected');

        if ($(this).is('#user-lives')) {
        	loadBroadcasts('user');
        } else {
        	loadBroadcasts('official');
        }
    });
});

function loadBroadcasts(liveType)
{
	Promise.resolve()
		.then(Loading.start)
		.then(isLogined)
			.catch(function(e) {
				Loading.done();
				showErrorMessage();
				reject();
			})
		.then(function() {
			if (liveType == 'user') {
				Promise.resolve().then(function()
				{
					return bg.loadUserCasts();
				})
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
			}
			if (liveType == 'official') {
				Promise.resolve().then(function()
				{
					return bg.loadOfficialCasts();
				})
				.then(function(official_casts) {
					console.info(official_casts);
						$.each(official_casts, function(index, cast) {
							let title     = $(cast).find('.video_title').text();
							const id        = 'lv' + $(cast).find('.video_id').text();
							const commu_id  = $(cast).find('.video_text a').attr('href');
							const regexp    = /http\:\/\/ch.nicovideo.jp\/channel\/(.+)/;
							const resultarr = regexp.exec(commu_id);
							let thumbnail   = undefined;

							if (resultarr != null)
								thumbnail = 'http://icon.nimg.jp/channel/' + resultarr[1] + '.jpg';
							else 
								thumbnail = $(cast).find('.info a img').attr('src');

							var $community = $(`
								<div class="community">
									<a href="" target="_blank">
										<span class="thumbnail"></span>
									</a>
								</div>
							`);

							$('.thumbnail', $community).css('background-image', 'url(' + thumbnail + ')');
							$('a', $community).attr('href', "http://live.nicovideo.jp/watch/" + id);

							const charPerLine = 16;
							$community.data('powertip', wordWrap(title, charPerLine));

							// TODO: Fix.
							const hasManyCasts = official_casts.length > 30;
							const isTopRow = index < 5;
							let offset = (hasManyCasts && !isTopRow) ? -219 : 10;
							const smartPlacement = index < 5 ? false : true;

							// TODO: Fix.
							const manualPositions = ['se', 's', 's', 's', 'sw'];
							const placement = (index < 5) ? manualPositions[index] : 'n';
							console.log(offset);

							// TODO: Fix.
							$.fn.powerTip.smartPlacementLists.n = ['n', 's', 'ne', 'nw', 'e', 'w', 'n'];

							// TODO: Fix.
							$community.powerTip({
								smartPlacement: smartPlacement,
								placement: placement,
								fadeInTime: 30,
								fadeOutTime: 30,
								closeDelay: 0,
								intentPollInterval: 0,
								offset: offset
							});

							// console.info($community);
							$('#communities').append($community);
							if (index == official_casts.length - 1) {
								Loading.done();
							}
						});
					});
			}
		});

}

function show($doms)
{	
	console.info($doms);
	return new Promise(function(resolve, reject) {
		var length = $doms.length;
		$doms.each(function(index) {
			append($('#communities'), $(this));
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

function append($dom, $videoInfo)
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

	const charPerLine = 16;
	$community.data('powertip', wordWrap(title, charPerLine));
	
	$.fn.powerTip.smartPlacementLists.n = ['n', 's', 'ne', 'nw', 'e', 'w', 'n'];
	$community.powerTip({
		smartPlacement: true,
		fadeInTime: 30,
		fadeOutTime: 30,
		closeDelay: 0,
		intentPollInterval: 0
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
		$('#communities').empty();
		$('#communities').addClass('nowloading');
	}

	static done() {
		$('#communities').removeClass('nowloading');
	}
}