import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Common from "./common/Common";
import UserThumbnails from "./components/UserThumbnails";
import OfficialThumbnails from "./components/OfficialThumbnails";
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
    .then(($videoInfos) => {
      if (liveType === 'user') {
        ReactDOM.render(
          <UserThumbnails programs={$videoInfos}/>,
          document.getElementById('communities')
        );
      }
      if (liveType === 'official') {
        ReactDOM.render(
          <OfficialThumbnails programs={$videoInfos.toArray()}/>,
          document.getElementById('communities')
        );
      }
    })
    .then(Loading.done);
};
