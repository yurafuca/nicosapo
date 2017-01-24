import $ from 'jquery';
import Page from '../page/Page';
import AutoRedirectButton from "../buttons/AutoRedirectButton";
import AutoEnterCommunityButton from "../buttons/AutoEnterCommunityButton";
import Common from "../common/Common";
import IdHolder from "../modules/IdHolder";
import ExtendedBar from "../modules/ExtendedBar";

const idHolder = new IdHolder();
const autoRedirectButton = new AutoRedirectButton();
const autoEnterCommunityButton = new AutoEnterCommunityButton();
const extendedBar = new ExtendedBar();

export default class NormalCastPage extends Page {
  putButton() {
    $('.meta').append(autoRedirectButton.getDom());
    $('.meta').append(autoEnterCommunityButton.getDom());
  }

  setUpButton() {
    chrome.runtime.sendMessage({
        purpose: 'getFromLocalStorage',
        key: 'options.autoJump.enable'
      },
      (response) => {
        if (Common.enabledOrNull(response)) {
          autoRedirectButton.toggleOn();
        } else {
          autoRedirectButton.toggleOff();
        }
      }
    );
    chrome.runtime.sendMessage({
        purpose: 'getFromNestedLocalStorage',
        key: 'autoEnterCommunityList'
      },
      (response) => {
        if (response[idHolder.communityId]) {
          autoEnterCommunityButton.toggleOn();
        } else {
          autoEnterCommunityButton.toggleOff();
        }
      }
    );
  }

  putExtendedBar() {
    extendedBar.put('#watch_player_top_box');
  }

  setUpExtendedBar() {
    extendedBar.setUp();
  }

  countExtendedBar() {
    extendedBar.countDown();
  }

  updateExtendedBar(response) {
    extendedBar.update(response);
  }

  invalidateExtendedBar() {
    extendedBar.invalidate();
  }
}
