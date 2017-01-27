import $ from 'jquery';
import 'jquery-powertip';
import Common from "./common/Common";
import Api from "./api/Api";

class Massages {
  static show(type) {
    const messages = {
      NOT_LOGINED: 'ニコニコ動画にログインしていません．ログインしてから再度試してください．',
      ITEM_IS_ZERO: '放送中の番組がありません．'
    };
    const $message = $('<div class="message"></div>');
    $message.text(messages[type]);
    const $parent = $('#communities');
    $parent.html($message);
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

$(document).ready(() => {
  renderCasts('user');
});

$(document).ready(() => {
  $(document).on('click', '.tab.non-selected', function() {
    $('.tab').removeClass('selected non-selected');
    $('.tab').not(this).addClass('non-selected');
    $(this).addClass('selected');
    if ($(this).is('#user-lives')) {
      renderCasts('user');
    } else {
      renderCasts('official');
    }
  });
});

const renderCasts = (liveType) => {
  Promise.resolve()
    .then(Loading.start)
    .then(Api.isLogined)
    .catch(() => {
      Loading.done();
      Massages.show('NOT_LOGINED');
      // reject();
    })
    .then(() => Api.loadCasts(liveType))
    .then(($videoInfos) => showAsThumbnailDoms($videoInfos, liveType))
    .then(Loading.done);

}

const showAsThumbnailDoms = ($videoInfos, liveType) => {
  return new Promise((resolve) => {
    const length = $videoInfos.length;
    const isEnableShowReservedProgram = localStorage.getItem('options.showReserved.enable');
    $.each($videoInfos, (index, $info) => {
      if (!Common.enabledOrNull(isEnableShowReservedProgram) && isReserved($info)) {
        // Do nothing.
      } else {
        const thumbnailDom = createThumbnailDom($info, liveType, length, index);
        $('#communities').append(thumbnailDom);
      }
      if (index == length - 1) {
        if ($('#communities').children().length == 0) {
          Massages.show('ITEM_IS_ZERO');
        }
      }
    });
    resolve();
  });
}

const isReserved = ($info) => {
  const is_reserved = $($info).find('video is_reserved').text();
  return is_reserved == 'true';
}

/**
 * @param programs ユーザー放送の場合は videoInfo，公式放送の場合は official_casts
 * @param programType 'user' または 'official'
 * @param numOfPrograms 'official' の場合のみ必要
 * @param currentIndex 'official' の場合のみ必要
 */
const createThumbnailDom = (program, programType, numOfPrograms, currentIndex) => {
  let thumbnailAsProp, thumbnailUrl, title, url, id;
  const $community = $(`
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
    thumbnailUrl = program.find('community thumbnail').text();
    thumbnailAsProp = `url('${thumbnailUrl}')`;
    title = program.find('video title').text();
    id = program.find('video id').text();
    url = `http://live.nicovideo.jp/watch/${id}`;
  }

  else if (programType == 'official') {
    const communityId = $(program).find('.video_text a').attr('href');
    const regexp = /http\:\/\/ch.nicovideo.jp\/channel\/(.+)/;
    const resultarr = regexp.exec(communityId);
    let thumbnailTmp = undefined;

    if (resultarr != null) {
      thumbnailTmp = `http://icon.nimg.jp/channel/${resultarr[1]}.jpg`;
    } else {
      thumbnailTmp = $(program).find('.info a img').attr('src');
    }

    thumbnailUrl = thumbnailTmp
    thumbnailAsProp = `url('${thumbnailUrl}')`;
    title = $(program).find('.video_title').text();
    id = `lv${$(program).find('.video_id').text()}`;
    url = `http://live.nicovideo.jp/watch/${id}`;
  }

  $community.find('.thumbnail').css('background-image', thumbnailAsProp);
  $community.find('a').attr('href', url);

  const charPerLine = 16;
  const wrappedTitle = Common.wordWrap(title, charPerLine);
  let tooltipText = wrappedTitle;

  if (isReserved(program) == true) {
    $community.find('.side-corner-tag').removeClass('disabled');
    $community.find('.side-corner-tag').addClass('enabled');

    const startTimeInfo = `<span style="color:#adff2f">
      ${program.find('video open_time_jpstr').text()}
    </span><br>`;
    tooltipText = startTimeInfo + tooltipText;

    const startDayJpn = program.find('video open_time_jpstr').text().match(/\d+\/(\d+)/)[1]; // Month/Day(Date) ...
    const startDateJpn = program.find('video open_time_jpstr').text().match(/\d+\/\d+\((.)\)/)[1];

    $community.find('.reserved-message').text(`${startDayJpn}(${startDateJpn})`);
  } else {
    $community.find('.side-corner-tag').removeClass('side-corner-tag');
    $community.find('p').remove();
  }

  setPowerTip($community, tooltipText, numOfPrograms, currentIndex, programType);

  return $community;
}

const setPowerTip = ($dom, tooltipText, numOfPrograms, currentIndex, programType) => {
  $.fn.powerTip.smartPlacementLists.n = ['n', 's', 'ne', 'nw', 'e', 'w', 'n'];
  $dom.data('powertip', tooltipText);
  $dom.powerTip({
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
    const theOffset = (hasManyCasts && !isTopRow) ? -219 : 10;
    const theSmartPlacement = currentIndex < 5 ? false : true;

    // TODO: Fix.
    const manualPositions = ['se', 's', 's', 's', 'sw'];
    const thePlacement = (currentIndex < 5) ? manualPositions[currentIndex] : 'n';

    // TODO: Fix.
    $.fn.powerTip.smartPlacementLists.n = ['n', 's', 'ne', 'nw', 'e', 'w', 'n'];

    // TODO: Fix.
    $dom.powerTip({
      smartPlacement: theSmartPlacement,
      placement: thePlacement,
      fadeInTime: 30,
      fadeOutTime: 30,
      closeDelay: 0,
      intentPollInterval: 0,
      offset: theOffset
    });
  }
}
