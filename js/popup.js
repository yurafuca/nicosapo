const bg = chrome.extension.getBackgroundPage();

class Massages
{
	static show(type)
	{
		const messages = {
			NOT_LOGINED: 'ニコニコ動画にログインしていません．ログインしてから再度試してください．',
			ITEM_IS_ZERO: '放送中の番組がありません．'
		};

		const message = $('<div class="message"></div>');
			  message.text(messages[type]);

		const communities = $('#communities');
			  communities.html(message);
	}
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
				Massages.show('NOT_LOGINED');
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
								Massages.show('ITEM_IS_ZERO');
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
								<div class="community-hover-wrapper">
									<div class="side-corner-tag enabled">
										<div class="community">
											<a href="" target="_blank">
												<span class="thumbnail"></span>
											</a>
										</div>
										<p><span class="reserved-message">予約枠</span></p>
									</div>
								</div>
							`);

							$community.find('.side-corner-tag').removeClass('side-corner-tag');
							$community.find('p').remove();

							$('.thumbnail', $community).css('background-image', 'url(' + thumbnail + ')');
							$('a', $community).attr('href', "http://live.nicovideo.jp/watch/" + id);

							const charPerLine = 16;
							$community.data('powertip', wordWrap(title, charPerLine));

							// TODO: Fix.
							const hasManyCasts = official_casts.length > 35;
							const isTopRow = index < 5;
							const offset = (hasManyCasts && !isTopRow) ? -219 : 10;
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
			append($(this));
			if (index == length - 1) {
				resolve();
			}
		});
	});
}

function append($videoInfo)
{
	var thumbnail	= $videoInfo.find('community thumbnail').text();
	var title		= $videoInfo.find('video title').text();
	var id			= $videoInfo.find('video id').text();

	var startTime   = Date.parse($videoInfo.find('open_time').text());
	var isReserved  = (Date.now() < startTime);

	var community = $(`
		<div class="community-hover-wrapper">
			<div class="side-corner-tag enabled">
				<div class="community">
					<a href="" target="_blank">
						<span class="thumbnail"></span>
					</a>
				</div>
				<p><span class="reserved-message">予約枠</span></p>
			</div>
		</div>
	`);

	const thumbnailProp = 'url(' + thumbnail + ')';
	const livePageUrl   = 'http://live.nicovideo.jp/watch/' + id;

	community.find('.thumbnail').css('background-image', thumbnailProp);
	community.find('a').attr('href', livePageUrl);

	const charPerLine   = 16;
	const wrappedTitle  = wordWrap(title, charPerLine);
	let   tooltipText   = wrappedTitle;

	if (isReserved == true) {
		const startTimeInfo = '<span style="color:#adff2f">' + $videoInfo.find('open_time').text() + ' に開始 ' + '</span><br>';
		        tooltipText = startTimeInfo + tooltipText;
		community.find('.side-corner-tag').removeClass('disabled');
		community.find('.side-corner-tag').addClass('enabled');
		const startDate = new Date(startTime).getDate();
		const startDay  = Time.toJpnDay(startTime);
		community.find('.reserved-message').text(startDate + '(' + startDay + ')');
	} else {
		community.find('.side-corner-tag').removeClass('side-corner-tag');
		community.find('p').remove();
	}

	console.log(tooltipText);
	
	community.data('powertip', tooltipText);
	
	$.fn.powerTip.smartPlacementLists.n = ['n', 's', 'ne', 'nw', 'e', 'w', 'n'];

	community.powerTip({
		smartPlacement: true,
		fadeInTime: 30,
		fadeOutTime: 30,
		closeDelay: 0,
		intentPollInterval: 0
	});

	$('#communities').append(community);
}

function wordWrap(text, length)
{
    reg = new RegExp("(.{" + parseInt(length) + "})", "g");
    return text.replace(/[\r|\r\n|\n]/g, "").replace(reg, "$1" + "<br>");
}

class Time
{
    static toJpnString(milisec)
    {
        const date = new Date(milisec);
        const days = {
            0: '日',
            1: '月',
            2: '火',
            3: '水',
            4: '木',
            5: '金',
            6: '土'
        };
        return [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
        ].join( '/' ) + ' '
        + '(' + days[date.getDay()] + ') '
        + date.toLocaleTimeString();
    }

    static toJpnDay(milisec)
    {
    	const days = {
            0: '日',
            1: '月',
            2: '火',
            3: '水',
            4: '木',
            5: '金',
            6: '土'
        };

        return days[new Date(milisec).getDay()];
    }
}
