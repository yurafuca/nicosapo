import $ from 'jquery'
import CastPage from '../page/CastPage';
import AutoRedirectButton from "../buttons/AutoRedirectButton";
import AutoEnterCommunityButton from "../buttons/AutoEnterCommunityButton";
import Common from "../common/Common";
import IdHolder from "../modules/IdHolder";

const idHolder = new IdHolder();
const autoRedirectButton = new AutoRedirectButton();
const autoEnterCommunityButton = new AutoEnterCommunityButton();

export default class ModernCastPage extends CastPage {

  putButton() {
    $('.program-detail div').last().append(autoRedirectButton.getDom());
    $('.program-detail div').last().append(autoEnterCommunityButton.getDom());
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
    super.putExtendedBar('#bourbon-block');
  }

  setUpExtendedBar() {
    super.setUpExtendedBar();
    $('#extended-bar').css('width', '1024px');
  }
}
