const bg = chrome.extension.getBackgroundPage();

class Massages {
    static show(type) {
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

class Loading {
    static start() {
        $('#communities').empty();
        $('#communities').addClass('nowloading');
    }

    static done() {
        $('#communities').removeClass('nowloading');
    }
}

$(function() {
    loadBroadcasts('user');
});

$(function() {
    $(document).on('click', '.tab.non-selected', function() {
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

function loadBroadcasts(liveType) {
    Promise.resolve()
        .then(Loading.start)
        .then(isLogined)
        .catch(function(e) {
            Loading.done();
            Massages.show('NOT_LOGINED');
            reject();
        })
        .then(function() {
            return bg.loadCasts(liveType);
        })
        .then(function(programs) {
            return show(programs, liveType);
        })
        .then(Loading.done);

}

function show(programs, liveType) {
    console.info(programs);
    return new Promise(function(resolve, reject) {
        const length = programs.length;
        const isEnableShowReservedProgram = localStorage.getItem('options.showReserved.enable');
        $.each(programs, function(index, item) {
            if (!enableOrNull(isEnableShowReservedProgram) && isReserved(item)) {
                // Do nothing.
            } else {
							const program = createOneProgram($(item), liveType, programs.length, index);
							$('#communities').append(program);
						}
						if (index == length - 1) {
							if ($('#communities').children().length == 0) {
								Massages.show('ITEM_IS_ZERO');
							};
						}
        });
        resolve();
    });
}

function isReserved(program) {
    const startTime = Date.parse($(program).find('open_time').text());
    return Date.now() < startTime;
}

/**
 * @param programs ユーザー放送の場合は videoInfo，公式放送の場合は official_casts
 * @param programType 'user' または 'official'
 * @param numOfPrograms 'official' の場合のみ必要
 * @param currentIndex 'official' の場合のみ必要
 */
function createOneProgram(program, programType, numOfPrograms, currentIndex) {
    const attributes = {
        thumbnailAsProp: null,
        thumbnailUrl: null,
        title: null,
        url: null,
        id: null
    };

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

    if (programType == 'user') {
        attributes.thumbnailUrl = program.find('community thumbnail').text();
        attributes.thumbnailAsProp = 'url(' + attributes.thumbnailUrl + ')';
        attributes.title = program.find('video title').text();
        attributes.id = program.find('video id').text();
        attributes.url = 'http://live.nicovideo.jp/watch/' + attributes.id;
    }

    if (programType == 'official') {
        const communityId = $(program).find('.video_text a').attr('href');
        const regexp = /http\:\/\/ch.nicovideo.jp\/channel\/(.+)/;
        const resultarr = regexp.exec(communityId);
        let thumbnailTmp = undefined;

        if (resultarr != null) {
            thumbnailTmp = 'http://icon.nimg.jp/channel/' + resultarr[1] + '.jpg';
        } else {
            thumbnailTmp = $(program).find('.info a img').attr('src');
        }

        attributes.thumbnailUrl = thumbnailTmp
        attributes.thumbnailAsProp = 'url(' + attributes.thumbnailUrl + ')';
        attributes.title = $(program).find('.video_title').text();
        attributes.id = 'lv' + $(program).find('.video_id').text();
        attributes.url = 'http://live.nicovideo.jp/watch/' + attributes.id;
    }

    community.find('.thumbnail').css('background-image', attributes.thumbnailAsProp);
    community.find('a').attr('href', attributes.url);

    const charPerLine = 16;
    const wrappedTitle = wordWrap(attributes.title, charPerLine);
    let tooltipText = wrappedTitle;

    if (isReserved(program) == true) {
        community.find('.side-corner-tag').removeClass('disabled');
        community.find('.side-corner-tag').addClass('enabled');

        const startTimeInfo = '<span style="color:#adff2f">' + program.find('open_time').text() + ' に開場 ' + '</span><br>';
        tooltipText = startTimeInfo + tooltipText;

        const startTime = Date.parse(program.find('open_time').text());
        const startDate = new Date(startTime).getDate();
        const startDay = Time.toJpnDay(startTime);

        community.find('.reserved-message').text(startDate + '(' + startDay + ')');
    } else {
        community.find('.side-corner-tag').removeClass('side-corner-tag');
        community.find('p').remove();
    }

    community.data('powertip', tooltipText);

    $.fn.powerTip.smartPlacementLists.n = ['n', 's', 'ne', 'nw', 'e', 'w', 'n'];

    community.powerTip({
        smartPlacement: true,
        fadeInTime: 30,
        fadeOutTime: 30,
        closeDelay: 0,
        intentPollInterval: 0
    });

    if (programType == 'official') {
        // TODO: Fix.
        const hasManyCasts = numOfPrograms > 35;
        const isTopRow = currentIndex < 5;
        const offset = (hasManyCasts && !isTopRow) ? -219 : 10;
        const smartPlacement = currentIndex < 5 ? false : true;

        // TODO: Fix.
        const manualPositions = ['se', 's', 's', 's', 'sw'];
        const placement = (currentIndex < 5) ? manualPositions[currentIndex] : 'n';
        console.log(offset);

        // TODO: Fix.
        $.fn.powerTip.smartPlacementLists.n = ['n', 's', 'ne', 'nw', 'e', 'w', 'n'];

        // TODO: Fix.
        community.powerTip({
            smartPlacement: smartPlacement,
            placement: placement,
            fadeInTime: 30,
            fadeOutTime: 30,
            closeDelay: 0,
            intentPollInterval: 0,
            offset: offset
        });
    }

    return community;
}

function wordWrap(text, length) {
    reg = new RegExp("(.{" + parseInt(length) + "})", "g");
    return text.replace(/[\r|\r\n|\n]/g, "").replace(reg, "$1" + "<br>");
}

function enableOrNull(value) {
    return (value === 'enable') || value == null;
}
