import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import VideoInfoUtil from './modules/VideoInfoUtil'
import UserThumbnails from "./components/UserThumbnails";
import OfficialThumbnails from "./components/OfficialThumbnails";
import Api from "./api/Api";

class Massages {
  static show(text) {
    const $message = $('<div class="message"></div>');
    $message.text(text);
    const $parent = $('#communities');
    $parent.html($message);
  }
}

class ProgressRing {
  static show() {
    $('#communities').empty();
    $('#communities').addClass('nowloading');
  }

  static hide() {
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
    }
    else if ($(this).is('#official-lives'))  {
      renderCasts('official');
    }
    else {
      renderCasts('future');
    }
  });
});

const renderCasts = (liveType) => {
  Promise.resolve()
    .then(ProgressRing.show)
    .then(Api.isLogined)
    .catch(() => {
      ProgressRing.hide();
      Massages.show('ニコニコ動画にログインしていません．ログインしてから再度試してください．');
    })
    .then(() => Api.loadCasts(liveType))
    .then(($videoInfos) => {
      if (liveType === 'user') {
        ReactDOM.render(
          <UserThumbnails programs={$videoInfos}/>,
          document.getElementById('communities')
        );
      }
      if (liveType === 'official' || liveType === 'future') {
        ReactDOM.render(
          <OfficialThumbnails programs={$videoInfos.toArray()}/>,
          document.getElementById('communities')
        );
      }
      if (VideoInfoUtil.removeReservation($videoInfos).length === 0) {
        ProgressRing.hide();
        Massages.show('放送中の番組がありません．');
        return;
      }
    })
    .then(ProgressRing.hide);
};
