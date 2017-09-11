import $ from 'jquery'
import IdHolder from '../modules/IdHolder'
import Page from '../page/Page'

export default class CastPage extends Page {
  constructor() {
    super();
    this.communityId = (new IdHolder()).communityId;

    this._getScrollOption((response) => {
      if (response == 'enable' || response == null) {
        this._getTabStatus((response) => {
          if (response == null || response.castId != this.communityId) {
            this._setTabStatus(this.communityId, response ? response.scrollTop : 0);
          } else {
            setTimeout(this._scroll(response.scrollTop), 3 * 1000);
          }
        });
      }
    });

    window.addEventListener('scroll', (e) => {
      this._setTabStatus(this.communityId, document.body.scrollTop);
    });
  }

  _getScrollOption(callback) {
    const option = {
      purpose: 'getFromLocalStorage',
      key: 'options.autoScroll.enable'
    };
    chrome.runtime.sendMessage(option, (response) => {
      callback(response);
    });
  }

  _getTabStatus(callback) {
    const option = { purpose: `NiconamaTabs.get`};
    chrome.runtime.sendMessage(option, (response) => {
      callback(response);
    });
  }

  _setTabStatus(communityId, scrollTop) {
    const option = {
      purpose: 'NiconamaTabs.add',
      id: communityId,
      scrollTop: scrollTop
    }
    chrome.runtime.sendMessage(option);
  }

  _scroll(scrollTop) {
    $('html,body').animate({ scrollTop: scrollTop }, 200, 'swing');
  }
}
