import $ from 'jquery'
import Page from '../page/Page';
import AutoEnterProgramButton from "../buttons/AutoEnterProgramButton";
import IdHolder from "../modules/IdHolder";

const idHolder = new IdHolder();
const autoEnterProgramButton = new AutoEnterProgramButton();

export default class GatePage extends Page {
  putButton() {
    $('.gate_title').prepend(autoEnterProgramButton.getDom());
  }

  setUpButton() {
    chrome.runtime.sendMessage({
        purpose: 'getFromNestedLocalStorage',
        key: 'autoEnterProgramList'
      },
      (response) => {
        if (response[idHolder.liveId]) {
          autoEnterProgramButton.toggleOn();
        } else {
          autoEnterProgramButton.toggleOff();
        }
      }
    );
  }
}
