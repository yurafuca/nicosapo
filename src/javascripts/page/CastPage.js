import React from 'react';
import ReactDOM from 'react-dom';
import Api from "../api/Api";
import ExBar from "../modules/ExBar";
import IdHolder from "../modules/IdHolder";

let isEnabledAutoRedirect = false;
const idHolder = new IdHolder();

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
}
