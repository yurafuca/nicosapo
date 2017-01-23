import $ from 'jquery'
import Page from '../page/Page';
import AutoRedirectButton from "../buttons/AutoRedirectButton";
import Common from "../common/Common";
import Time from "../common/Time";
import IdHolder from "../modules/IdHolder";

const idHolder = new IdHolder();
const autoRedirectButton = new AutoRedirectButton();

export default class StandByPage extends Page {
  run() {
    putButton();
    setUpButton();
  }

  putButton() {
    $('.infobox').prepend(autoRedirectButton.getDom());
  }

  setUpButton() {
    chrome.runtime.sendMessage({
        purpose: 'getFromLocalStorage',
        key: 'options.autoJump.enable'
      },
      function (response) {
        if (Common.enabledOrNull(response)) {
          autoRedirectButton.toggleOn();
        } else {
          autoRedirectButton.toggleOff();
        }
      }
    );
  }
}
