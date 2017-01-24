import $ from 'jquery'
import Page from '../page/Page';
import ExtendedBar from "../modules/ExtendedBar";

const extendedBar = new ExtendedBar();

export default class OfficialCastPage extends Page {
  putButton() {
    const $noSupport = $(`<span></span>`);
    $noSupport.text(`/* 公式番組では自動枠移動，コミュニティへの自動入場に対応していません */`);
    $('.meta').append($noSupport);
  }

  setUpButton() {
    // Do nothing.
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
