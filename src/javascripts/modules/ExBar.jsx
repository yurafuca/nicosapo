import $ from 'jquery'
import React from 'react';
import Blink from 'react-blink';
import Api from "../api/Api";
import Time from "../common/Time";
import Clock from "../common/Clock";
import IdHolder from "../modules/IdHolder";

const _clock = new Clock(new Date());

const _getEndDate = (statusResponse) => {
  const end = _getEndTime(statusResponse);
  const endDate = new Date(end.millisec);
  return endDate;
}

const _getEndTime = (statusResponse) => {
  const $endTime = $(statusResponse).find('stream end_time');
  const end = {
    second: Number($endTime.text()),
    millisec: Number($endTime.text()) * 1000,
  };
  return end;
}

export default class ExBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hour:   _clock.getHour(),
      minute: _clock.getMinute(),
      second: _clock.getSecond(),
      isOpen: true,
      doBlink: false,
      endText: '年/月/日（曜）時刻',
      updateText: 'あああ',
    };
    this.build();
    setInterval(() => { this.tick() }, 1000);
  }

  componentWillReceiveProps(nextProps) {
    const end = _getEndTime(nextProps.castInfos.statusResponse);
    const nextEndUnixTime = new Date(end.millisec).getTime();
    if (nextEndUnixTime !== this.state.endUnixTime) {
      this.state.endUnixTime = nextEndUnixTime;
      this.reset(nextProps.castInfos.statusResponse);
      this.setState({ doBlink: true }, () => {
        setTimeout( () => {
          this.setState({ doBlink: false })
        }, 5 * 1000);
      });
    }
  }

  build() {
    this.setParams(false, null);
  }

  reset(statusResponse) {
    this.setParams(true, statusResponse);
  }

  setParams(isReset = false, statusResponse) {
    (isReset
      ? Promise.resolve(statusResponse)
      : Api.getStatus((new IdHolder()).liveId))
    .then((response) => {
      this.setEndText(response);
      this.setRemainTime(response);
    })
  }

  setEndText(statusResponse) {
    const end = _getEndTime(statusResponse);
    const endDate = new Date(end.millisec);
    const endText = Time.toJpnString(endDate);
    this.setState({ endText: endText });
  }

  setRemainTime(statusResponse) {
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
    let updateText;
    if (this.state.doBlink) {
      updateText = <Blink>{this.state.updateText}</Blink>
    } else {
      updateText = '延長されていません';
    }
    return(
      <div id="extended-bar">
        <div className="time end-time">{(this.state.isOpen ? this.state.endText : '放送が終了しました')}</div>
        <div className="message">{updateText}</div>
        <div className="time rest-time">{(this.state.hour > 0 ? `${hour}：${minute}：${second}` : `${minute}：${second}`)}</div>
      </div>
    )
  }
}
