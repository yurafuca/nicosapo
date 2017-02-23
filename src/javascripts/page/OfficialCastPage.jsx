import $ from 'jquery'
import CastPage from '../page/CastPage';

export default class OfficialCastPage extends CastPage {
  putButton() {
    const $noSupport = $(`<span></span>`);
    $noSupport.text(`/* 公式番組では自動枠移動，コミュニティへの自動入場に対応していません */`);
    $('.meta').append($noSupport);
  }

  setUpButton() {
    // Do nothing.
  }

  putExtendedBar() {
    super.putExtendedBar('#watch_player_top_box');
  }
}
