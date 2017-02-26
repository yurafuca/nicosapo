import $ from 'jquery'
import React from 'react';
import ReactDOM from 'react-dom';
import Api from "../api/Api";
import Common from "../common/Common";
import ExBar from "../modules/ExBar";
import Storage from "../modules/Storage";
import IdHolder from "../modules/IdHolder";

let isEnabledAutoRedirect = false;
const idHolder = new IdHolder();
const secList = [5 * 60, 4 * 60, 3 * 60, 2 * 60, 1 * 60];

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

export default class CastPage extends React.Component {
  constructor() {
    super();
    this.state = {
      castInfos: {
        isExtended: false,
        statusResponse: null
      }
    };
    this.checkNewCast = this.checkNewCast.bind(this);
    this.appointment(this.checkNewCast);
  }

  buildExBar(idName) {
    console.info('build');
    const beforeChild = document.getElementById(idName);
    const child = document.createElement('div');
    child.id = 'nicosapo_exbar';
    insertAfter(child, beforeChild);
    ReactDOM.render(<ExBar castInfos={this.state.castInfos}/>, child);
  }

  recieveNotify(isToggledOn) {
    isEnabledAutoRedirect = isToggledOn;
  }

  appointment(appointedFunc) {
    chrome.runtime.sendMessage({
        purpose: 'getFromLocalStorage',
        key: 'options.redirect.time'
      }, (response) => {
        const intervalTime = response || 50;
        setTimeout(appointedFunc, intervalTime * 1000);
    });
  }

  checkNewCast() {
    if (isEnabledAutoRedirect) {
      Api.isOpen(idHolder.liveId).then((response) => {
        if (response.isOpen) {
          const castInfos = {
            isExtended: true,
            statusResponse: response
          }
          this.setState({ castInfos: castInfos });
        } else {
          Api.isOpen(idHolder.communityId)
          .then((response) => {
            if (response.isOpen) {
              this.goToCast(response.nextLiveId);
            }
          });
        }
      });
    }
    this.appointment(this.checkNewCast);
  }

  goToCast(liveId) {
    const baseUrl = 'http://live.nicovideo.jp/watch/';
    const liveUrl = baseUrl + liveId;
    window.location.replace(liveUrl);
  }

  renderToast() {
    const remainSec = extendedBar.getRemainSec();
    if (!secList.includes(remainSec)) {
      return;
    }
    const minute = remainSec / 60;
    Storage.getItem('options.toast.minuteList').then((minuteList) => {
      if (minuteList == null) {
        minuteList = [1,3,5];
      }
      if (!minuteList.includes(minute)) {
        return
      }
      this.showToast(`残り${minute}分です`);
      Common.sleep(3000).then(() => {
        this.hideToast();
      });
    });
  }

  showToast(text) {
    const $toast = $(`
      <div id="nicosapo-toast">
        <div id="nicosapo-toast-icon"></div>
        <div id="nicosapo-toast-text">${text}</div>
      </div>
    `);
    $('#flvplayer_container').append($toast);
    $('#nicosapo-toast').addClass("animated fadeInUp");
  }

  hideToast() {
    $('#nicosapo-toast').addClass("animated fadeOutDown");
    Common.sleep(1000).then(() => {
      $('#nicosapo-toast').remove();
    });
  }
}
