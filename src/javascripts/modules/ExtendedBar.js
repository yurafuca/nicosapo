import $ from 'jquery'
import Api from "../api/Api";
import Time from "../common/Time";
import TimeCounter from "../common/TimeCounter";
import IdHolder from "../modules/IdHolder";

const idHolder = new IdHolder();

const $extendedBarDom = $(`
    <div id="extended-bar">
        <div class="time end-time"></div>
        <div class="message">延長されていません</div>
        <div class="time rest-time"></div>
    </div>
`);

let timeCounter;

export default class ExtendedBar {

  constructor() {
    timeCounter = new TimeCounter(new Date());
  }

  put(idStr) {
    $(idStr).after($extendedBarDom);
  }

  setUp() {
    Api.getStatus(idHolder.liveId).then((response) => {
      // Extended Bar.
      const currentTime = Date.now();
      const currentDate = new Date(currentTime);

      // new Date() は引数にミリ秒を要求するので 1000 倍するために末尾に '000' を付加する．
      const endTime = Number(`${$(response).find('stream end_time').text()}000`);
      const endDate = new Date(endTime);

      const endTimeJpn = Time.toJpnString(endDate.getTime());

      const restTime_Minute = Time.minuteDistance(currentDate, endDate);
      let restTime_Second = Time.minuteDistanceOfSec(currentDate, endDate);
      restTime_Second = `0${restTime_Second}`.slice(-2);

      // タイマーを初期化
      timeCounter.setHour(0);
      timeCounter.setMinute(restTime_Minute);
      timeCounter.setSecond(restTime_Second);

      $('#extended-bar .end-time').text(`${endTimeJpn}`);
      $('#extended-bar .rest-time').text(`${restTime_Minute}：${restTime_Second}`);
    });
  }

  countDown() {
    const $restTime = $('#extended-bar .rest-time');
    if ($restTime.text() == '放送が終了しました') { // TODO: Too Ugly.
      return;
    }
    const minute = timeCounter.getMinute();
    let second = timeCounter.getSecond();
    second = `0${second}`.slice(-2);
    $restTime.text(`${minute}：${second}`);
    timeCounter.subSecond(1);
  }

  update(response) {
    const currentTime = Date.now();
    const currentDate = new Date(currentTime);

    // new Date() は引数にミリ秒を要求するので 1000 倍するために末尾に '000' を付加する．
    const endTime = Number(`${$(response).find('stream end_time').text()}000`);
    const endDate = new Date(endTime)

    const endTimeJpn = Time.toJpnString(endDate.getTime());
    const endTimeJpnLast = $('#extended-bar .end-time').text();

    const restTime_Minute = Time.minuteDistance(currentDate, endDate);
    let restTime_Second = Time.minuteDistanceOfSec(currentDate, endDate);
    restTime_Second = `0${restTime_Second}`.slice(-2);

    // 終了時刻が更新された場合はタイマーを更新
    if (endTimeJpnLast !== endTimeJpn) {
      timeCounter.setHour(0); // TODO:
      timeCounter.setMinute(restTime_Minute);
      timeCounter.setSecond(restTime_Second);

      $('#extended-bar .end-time').text(`${endTimeJpn}`);
      $('#extended-bar .rest-time').text(`${restTime_Minute}：${restTime_Second}`);

      // 点滅処理 (奇数回繰り返してメッセージを残す)
      for (let i = 0; i < 9; i++) {
        let message = '';
        if (i % 2 === 0) {
          message = `${endTimeJpn} に放送が延長されました`;
        } else {
          message = ``;
        }
        setTimeout(() => {
          $('#extended-bar .message').text(message);
        }, i * 500);
      }
    }
  }

  invalidate() {
    $('#extended-bar .end-time').text(`放送が終了しました`);
    $('#extended-bar .rest-time').text(`放送が終了しました`);
  }
}
