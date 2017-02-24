import $ from 'jquery'
import Api from "../api/Api";
import Time from "../common/Time";
import TimeCounter from "../common/TimeCounter";
import IdHolder from "../modules/IdHolder";

let timeCounter;
const finMessage = '放送が終了しました';
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

function set(isReset, statusResponse) {
  (isReset
    ? Promise.resolve(statusResponse)
    : Api.getStatus(idHolder.liveId))
  .then((response) => {
    const endTimes = {
      sec: '',
      millisec: '',
      jpstr: ''
    };
    endTimes.sec = Number($(response).find('stream end_time').text());
    endTimes.millisec = Number(`${endTimes.sec}000`); // new Date() requires millisecond.
    const dates = {
      now: '',
      end: ''
    };
    dates.now = new Date(Date.now());
    dates.end = new Date(endTimes.millisec);
    endTimes.jpstr = Time.toJpnString(dates.end.getTime());
    const remainingTimes = {
      hour: '',
      min: '',
      sec: ''
    };
    remainingTimes.hour = Time.hourDistance(dates.now, dates.end);
    remainingTimes.min = Time.minuteSurplusDistance(dates.now, dates.end);
    remainingTimes.sec = Time.secondSurplusDistance(dates.now, dates.end);
    if (Number(remainingTimes.hour) > 0) {
      remainingTimes.min = `0${remainingTimes.min}`.slice(-2);
    }
    remainingTimes.sec = `0${remainingTimes.sec}`.slice(-2);
    timeCounter.setHour(remainingTimes.hour);
    timeCounter.setMinute(remainingTimes.min);
    timeCounter.setSecond(remainingTimes.sec);

    if (Number(remainingTimes.hour) > 0) {
      $('#extended-bar .rest-time').text(`${remainingTimes.hour}：${remainingTimes.min}：${remainingTimes.sec}`);
    } else {
      $('#extended-bar .rest-time').text(`${remainingTimes.min}：${remainingTimes.sec}`);
    }
    $('#extended-bar .end-time').text(`${endTimes.jpstr}`);
  })
}

function setUp() {
  set();
}

function tick() {
  const $restTime = $('#extended-bar .rest-time');
  if (timeCounter.getRemainSec() === 0) {
    console.info('call invalidate');
    ExtendedBar.invalidate();
    return;
  }
  const hour = timeCounter.getHour();
  let   minute = `0${timeCounter.getMinute()}`.slice(-2);
  const second = `0${timeCounter.getSecond()}`.slice(-2);

  if (Number(hour) > 0) {
    minute = `0${timeCounter.getMinute()}`.slice(-2);
  }

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

  reset(statusResponse) {
    set(true, statusResponse);
  }

  invalidate() {
    console.info('invalidate');
    $('#extended-bar .end-time').text(finMessage);
    $('#extended-bar .rest-time').text(finMessage);
  }

  getRemainSec() {
    return timeCounter.getRemainSec();
  }
}
