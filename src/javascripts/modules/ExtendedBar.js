import $ from 'jquery'
import Api from "../api/Api";
import Time from "../common/Time";
import Clock from "../common/Clock";
import IdHolder from "../modules/IdHolder";

const clock = new Clock(new Date());
const finMessage = '放送が終了しました';
const idHolder = new IdHolder();
const $template = $(`
    <div id="extended-bar">
        <div class="time end-time"></div>
        <div class="message">延長されていません</div>
        <div class="time rest-time"></div>
    </div>
`);

const put = (idName) => {
  $(idName).after($template);
}

const set = (isReset, statusResponse) => {
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
    clock.setHour(remainingTimes.hour);
    clock.setMinute(remainingTimes.min);
    clock.setSecond(remainingTimes.sec);

    if (Number(remainingTimes.hour) > 0) {
      $('#extended-bar .rest-time').text(`${remainingTimes.hour}：${remainingTimes.min}：${remainingTimes.sec}`);
    } else {
      $('#extended-bar .rest-time').text(`${remainingTimes.min}：${remainingTimes.sec}`);
    }
    $('#extended-bar .end-time').text(`${endTimes.jpstr}`);
  })
}

const invalidate = () => {
  $('#extended-bar .end-time').text(finMessage);
  $('#extended-bar .rest-time').text(finMessage);
}

const setUp = () => {
  set();
}

const tick = () => {
  if (clock.getRemainSec() === 0) {
    invalidate();
    return;
  }

  const $restTime = $('#extended-bar .rest-time');
  const hour = clock.getHour();

  if (Number(hour) > 0) {
    const minute = `0${clock.getMinute()}`.slice(-2);
    const second = `0${clock.getSecond()}`.slice(-2);
    $restTime.text(`${hour}：${minute}：${second}`);
  } else {
    const minute = `${clock.getMinute()}`.slice(-2);
    const second = `0${clock.getSecond()}`.slice(-2);
    $restTime.text(`${minute}：${second}`);
  }

  clock.subSecond(1);
}

export default class ExtendedBar {
  build(idName) {
    put(idName);
    setUp();
    setInterval(() => { tick() }, 1000);
  }

  reset(statusResponse) {
    set(true, statusResponse);
  }

  getRemainSec() {
    return clock.getRemainSec();
  }
}
