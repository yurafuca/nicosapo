import $ from 'jquery'
import Page from '../page/Page';
import AutoRedirectButton from "../buttons/AutoRedirectButton";
import Common from "../common/Common";
const autoRedirectButton = new AutoRedirectButton();

export default class StandByPage extends Page {
  putButton() {
    $('.infobox').prepend(autoRedirectButton.getDom());
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
  }
}
