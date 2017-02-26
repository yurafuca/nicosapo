import $ from 'jquery'
import React from 'react';
// import Blink from 'react-blink';
import Blink from '../components/Blink';
import Api from "../api/Api";
import Common from '../common/Common'
import Time from "../common/Time";
import Clock from "../common/Clock";
import IdHolder from "../modules/IdHolder";

const _clock = new Clock(new Date());
const _defaultUpdateText = '延長されていません';

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
      endText: 'yy/mm/dd（date) {h}:{m}:{s}',
      updateText: _defaultUpdateText
    };
    this.build();
    setInterval(() => { this.tick() }, 1000);
  }

  componentWillReceiveProps(nextProps) {
    const endDate = _getEndDate(nextProps.response);
    const endText = Time.toJpnString(endDate)
    if (endText !== this.state.endText) {
      this.reset(nextProps.response);
      this.setState({ updateText: `放送が ${endText} へ更新されました` });
      this.startBlink();
      Common.sleep(6400).then(() => {
        this.stopBlink();
      });
    }
  }

  build() {
    this.setParams(false, null);
  }

  reset(statusResponse) {
    console.info('reset');
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
    console.info('remain');
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

  tick() {
    if (_clock.getRemainSec() === 0) {
      this.setState({ second: 0 });
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

  startBlink() {
    this.setState({ doBlink: true });
  }

  stopBlink() {
    this.setState({ doBlink: false });
  }

  render() {
    return(
      <div id="extended-bar">
        <div className="time end-time">
          {
            (this.state.isOpen) ?
            (this.state.endText) :
            ('放送が終了しました')
          }
        </div>
        <div className="message">
          {
             (this.state.doBlink) ?
             (<Blink><span style={{color: '#FFEE66'}}>{this.state.updateText}</span></Blink>) :
             (this.state.updateText)
           }
         </div>
        <div className="time rest-time">
          {
            (this.state.hour > 0) ?
            (`${this.state.hour}：${this.state.minute}：${this.state.second}`) :
            (`${this.state.minute}：${this.state.second}`)
          }
        </div>
      </div>
    )
  }
}
