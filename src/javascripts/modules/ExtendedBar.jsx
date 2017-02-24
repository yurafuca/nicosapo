import $ from 'jquery'
import React from 'react';
import Api from "../api/Api";
import Time from "../common/Time";
import Clock from "../common/Clock";
import IdHolder from "../modules/IdHolder";

const _clock = new Clock(new Date());

// TODO: reactDOM.render()の第二引数を append 仕様にする．

export default class ExtendedBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hour:   _clock.getHour(),
      minute: _clock.getMinute(),
      second: _clock.getSecond(),
      isOpen: true,
      endText: '年/月/日（曜）時刻',
      isExtended: false,
      updateText: '延長されていません',
    };
    build();
    setInterval(() => { this.tick() }, 1000);
  }

  reset(statusResponse) {
    setParams(true, statusResponse);
  }

  getRemainSec() {
    return _clock.getRemainSec();
  }

  tick() {
    if (_clock.getRemainSec() === 0) {
      this.setState({ isOpen: false });
      return;
    }

    const hour = _clock.getHour();
    let minute;
    let second;

    if (Number(hour) > 0) {
      minute = `0${_clock.getMinute()}`.slice(-2);
      second = `0${_clock.getSecond()}`.slice(-2);
    } else {
      minute = `${_clock.getMinute()}`.slice(-2);
      second = `0${_clock.getSecond()}`.slice(-2);
    }

    this.setState({ hour: hour });
    this.setState({ minute: minute });
    this.setState({ second: second });

    _clock.subSecond(1);
  }

  render() {
    const hour   = this.state.hour;
    const minute = this.state.minute;
    const second = this.state.second;
    return(
      <div id="extended-bar">
        <div class="time end-time">{(this.state.isOpen ? this.state.endText : '放送が終了しました')}</div>
        <div class="message">{(this.state.isExtended ? this.state.updateText : '延長されていません')}</div>
        <div class="time rest-time">{(this.state.hour > 0 ? `${hour}：${minute}：${second}` : `${minute}：${second}`)}</div>
      </div>
    )
  }
}

const build = () => {
  setParams(false, null);
}

const setParams = (isReset = false, statusResponse) => {
  (isReset
    ? Promise.resolve(statusResponse)
    : Api.getStatus((new IdHolder()).liveId))
  .then((response) => {
    _setEndText(response);
    _setRemainTime(response);
  })
}

const _setEndText = (statusResponse) => {
  const end = _getEndTime(statusResponse);
  const endDate = new Date(end.millisec);
  const endText = Time.toJpnString(endDate);
  this.setState({ endText: endText });
};

const _getEndTime = (statusResponse) => {
  const $endTime = $(statusResponse).find('stream end_time');
  const end = {
    second: Number($endTime.text()),
    millisec: Number($endTime.text()) * 1000,
  };
  return end;
}

const _setRemainTime = (statusResponse) => {
  const endDate = _getEndDate(statusResponse);
  const nowDate = new Date(Date.now());
  const remainHour = Time.hourDistance(nowDate, endDate);
  const remainMin  = Time.minuteSurplusDistance(nowDate, endDate);
  const remaninSec = Time.secondSurplusDistance(nowDate, endDate);
  _clock.setHour(remainHour);
  _clock.setMinute(remainMin);
  _clock.setSecond(remaninSec);
  this.setState({ hour: remainHour });
  this.setState({ minute: remainMin });
  this.setState({ second: remaninSec });
};

const _getEndDate = (statusResponse) => {
  const end = _getEndTime(statusResponse);
  const endDate = new Date(end.millisec);
  return endDate();
}
