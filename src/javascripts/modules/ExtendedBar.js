import $ from 'jquery'
import Api from "../api/Api";
import Time from "../common/Time";
import TimeCounter from "../common/TimeCounter";
import IdHolder from "../modules/IdHolder";

let timeCounter;
const idHolder = new IdHolder();
const $template = $(`
    <div id="extended-bar">
        <div class="time end-time"></div>
        <div class="message">延長されていません</div>
        <div class="time rest-time"></div>
    </div>
`);

function put(idName) {
  $(idName).after($template);
}

function setUp() {
  Api.getStatus(idHolder.liveId).then((response) => {
    const currentTime = Date.now();
    const currentDate = new Date(currentTime);
    // new Date() は引数にミリ秒を要求するので 1000 倍するために末尾に '000' を付加する．
    const endTime = Number(`${$(response).find('stream end_time').text()}000`);
    const endDate = new Date(endTime);
    const endTimeJpn = Time.toJpnString(endDate.getTime());
    const restTime_Hour = Time.hourDistance(currentDate, endDate);
    let restTime_Minute = Time.minuteSurplusDistance(currentDate, endDate);
    let restTime_Second = Time.secondSurplusDistance(currentDate, endDate);
    if (Number(restTime_Hour) > 0) {
      restTime_Minute = `0${restTime_Minute}`.slice(-2);
    }
    restTime_Second = `0${restTime_Second}`.slice(-2);
    /**
     * Initialize ExtendedBar's timer.
     */
    timeCounter.setHour(restTime_Hour);
    timeCounter.setMinute(restTime_Minute);
    timeCounter.setSecond(restTime_Second);

    $('#extended-bar .end-time').text(`${endTimeJpn}`);
    if (Number(restTime_Hour) > 0) {
      $('#extended-bar .rest-time').text(`${restTime_Hour}：${restTime_Minute}：${restTime_Second}`);
    } else {
      $('#extended-bar .rest-time').text(`${restTime_Minute}：${restTime_Second}`);
    }
  });
}

function tick() {
  const $restTime = $('#extended-bar .rest-time');
  if ($restTime.text() == '放送が終了しました') { // TODO: Too Ugly.
    return;
  }
  const hour = timeCounter.getHour();
  let minute = timeCounter.getMinute();
  let second = timeCounter.getSecond();

  if (Number(hour) > 0) {
    minute = `0${minute}`.slice(-2);
  }
  second = `0${second}`.slice(-2);

  if (Number(hour) > 0) {
    $restTime.text(`${hour}：${minute}：${second}`);
  } else {
    $restTime.text(`${minute}：${second}`);
  }
  timeCounter.subSecond(1);
}

export default class ExtendedBar {
  constructor() {
    timeCounter = new TimeCounter(new Date());
  }

  build(idName) {
    put(idName);
    setUp();
    setInterval(() => { tick() }, 1000);
  }

  reset(response) {
    const currentTime = Date.now();
    const currentDate = new Date(currentTime);

    // new Date() は引数にミリ秒を要求するので 1000 倍するために末尾に '000' を付加する．
    const endTime = Number(`${$(response).find('stream end_time').text()}000`);
    const endDate = new Date(endTime)

    const endTimeJpn = Time.toJpnString(endDate.getTime());
    const endTimeJpnLast = $('#extended-bar .end-time').text();

    const restTime_Hour = Time.hourDistance(currentDate, endDate);
    let restTime_Minute = Time.minuteSurplusDistance(currentDate, endDate);
    let restTime_Second = Time.secondSurplusDistance(currentDate, endDate);

    if (Number(restTime_Hour) > 0) {
      restTime_Minute = `0${restTime_Minute}`.slice(-2);
    }
    restTime_Second = `0${restTime_Second}`.slice(-2);

    // 終了時刻が更新された場合はタイマーを更新
    if (endTimeJpnLast !== endTimeJpn) {
      timeCounter.setHour(restTime_Hour);
      timeCounter.setMinute(restTime_Minute);
      timeCounter.setSecond(restTime_Second);

      $('#extended-bar .end-time').text(`${endTimeJpn}`);
      if (Number(restTime_Hour) > 0) {
        $('#extended-bar .rest-time').text(`${restTime_Hour}：${restTime_Minute}：${restTime_Second}`);
      } else {
        $('#extended-bar .rest-time').text(`${restTime_Minute}：${restTime_Second}`);
      }

      // 点滅処理 (奇数回繰り返してメッセージを残す)
      for (let i = 0; i < 9; i++) {
        let message = '';
        if (i % 2 === 0) {
          message = `終了時刻が ${endTimeJpn} へ更新されました`;
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

  getRemainSec() {
    return timeCounter.getRemainSec();
  }
}
