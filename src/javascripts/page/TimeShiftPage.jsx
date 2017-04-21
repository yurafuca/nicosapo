import $ from 'jquery'
import CastPage from '../page/CastPage'

export default class TimeShiftPage extends CastPage {
  putButton() {
    // TimeShiftPage dosen't need auto-buttons.
    const $noSupport = $(`<span></span>`);
    $noSupport.text(`/* タイムシフトでは各種ボタンと情報バーが無効になります */`);
    $('.meta').append($noSupport);
  }

  buildExBar() {
    // TimeShiftPage dosen't need an exbar.
  }
}
