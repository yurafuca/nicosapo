import $ from 'jquery'
import Page from '../page/Page';
import Common from "../common/Common";
import ExtendedBar from "../modules/ExtendedBar";
import Storage from "../modules/Storage";

const extendedBar = new ExtendedBar();
const secList = [
  31 * 60,
  5 * 60,
  4 * 60,
  3 * 60,
  2 * 60,
  1 * 60
];

export default class CastPage extends Page {
  putExtendedBar(query) {
    extendedBar.put(query);
  }

  setUpExtendedBar() {
    extendedBar.setUp();
  }

  updateExtendedBar(response) {
    extendedBar.update(response);
  }

  invalidateExtendedBar() {
    extendedBar.invalidate();
  }

  countExtendedBar() {
    extendedBar.countDown();
    this.renderToast();
  }

  renderToast() {
    const remainSec = extendedBar.getRemainSec();
    if (!secList.includes(remainSec)) {
      return;
    }
    const minute = remainSec / 60;
    Storage.getItem('options.toast.minList').then((minList) => {
      console.info(minList);
      if (!minList.includes(minute)) {
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
