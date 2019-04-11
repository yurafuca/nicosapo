import $ from "jquery";
import IdHolder from "../modules/IdHolder";
import Page from "../page/Page";
import MetaData from '../modules/MetaData';
import { ON_LEAVE, ON_VISIT } from '../chrome/runtime.onMessage';
import { CommunityBuilder, ProgramBuilder } from '../modules/ManageableBuilder';

export default class CastPage extends Page {
  constructor() {
    super();

    //
    const metaData = MetaData.get();

    if (metaData.pageType === "ERROR_PAGE") {
      return;
    }

    const option = {
      purpose: ON_VISIT,
      metaData: metaData
    };
    chrome.runtime.sendMessage(option);

    //
    window.addEventListener('beforeunload', (event) => {
      const option = {
        purpose: ON_LEAVE,
        metaData: metaData
      };
      chrome.runtime.sendMessage(option);
    });

    this.communityId = new IdHolder().communityId;

    this._getScrollOption(response => {
      if (response == "enable" || response == null) {
        this._getTabStatus(response => {
          if (response == null || response.castId != this.communityId) {
            this._setTabStatus(
              this.communityId,
              response ? response.scrollTop : 0
            );
          } else {
            setTimeout(this._scroll.bind(this, response.scrollTop), 5 * 1000);
          }
        });
      }
    });

    window.addEventListener("scroll", e => {
      this._setTabStatus(this.communityId, document.scrollingElement.scrollTop);
    });

    document.querySelector("[class^='___program-information-main-area___']").insertAdjacentHTML("afterbegin", "<div id='nicosapo-buttons'></div>")

  }

  _getScrollOption(callback) {
    const option = {
      purpose: "getFromLocalStorage",
      key: "options.autoScroll.enable"
    };
    chrome.runtime.sendMessage(option, response => {
      callback(response);
    });
  }

  _getTabStatus(callback) {
    const option = { purpose: `NiconamaTabs.get` };
    chrome.runtime.sendMessage(option, response => {
      callback(response);
    });
  }

  _setTabStatus(communityId, scrollTop) {
    const option = {
      purpose: "NiconamaTabs.add",
      id: communityId,
      scrollTop: scrollTop
    };
    chrome.runtime.sendMessage(option);
  }

  _scroll(scrollTop) {
    $("html,body").animate({ scrollTop: scrollTop }, 200, "swing");
  }
}
