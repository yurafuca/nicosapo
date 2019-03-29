import $ from "jquery";
import React from "react";
// import Blink from 'react-blink';
import Blink from "../components/Blink";
import Api from "../api/Api";
import Common from "../common/Common";
import Time from "../common/Time";
import Clock from "../common/Clock";
import IdHolder from "../modules/IdHolder";
import { API_GET_STATUS } from '../chrome/runtime.onMessage';

const _clock = new Clock(new Date());
const _defaultUpdateText = "延長されていません";

export default class ExBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hour: _clock.getHour(),
      minute: _clock.getMinute(),
      second: _clock.getSecond(),
      isOpen: true,
      doBlink: false,
      endText: "yy/mm/dd（date) {h}:{m}:{s}",
      updateText: _defaultUpdateText
    };
    this.build();
    setInterval(() => {
      this.tick();
    }, 1000);
  }

  componentWillReceiveProps(nextProps) {
    const endDate = new Date(nextProps.response.endTimeMilliSecond);
    const endText = Time.toJpnString(endDate);
    if (endText !== this.state.endText) {
      const time = new Date().getTime();
      this.setState({ updateText: `番組の延長を ${Time.toJpnString(time)} に検知しました` });
      this.reset(nextProps.response);
      this.startBlink();
      Common.sleep(6400).then(() => {
        this.stopBlink();
      });
    }
  }

  build() {
    chrome.runtime.sendMessage({
      purpose: API_GET_STATUS,
      programId: new IdHolder().liveId
    }, response => {
      this.setParams(response)
    });
  }

  reset(statusResponse) {
    console.info("reset");
    this.setParams(statusResponse);
  }

  setParams(statusResponse) {
    console.info("update clock");
    this.setEndText(statusResponse);
    this.setRemainTime(statusResponse);
  }

  setEndText(statusResponse) {
    const endDate = new Date(statusResponse.endTimeMilliSecond);
    const endText = Time.toJpnString(endDate);
    this.setState({ endText: endText });
  }

  setRemainTime(statusResponse) {
    console.info("remain");
    const endDate = new Date(statusResponse.endTimeMilliSecond);
    const nowDate = new Date(Date.now());
    const remainHour = Time.hourDistance(nowDate, endDate);
    const remainMin = Time.minuteSurplusDistance(nowDate, endDate);
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
    const player = document.querySelector('div[class^="___player-section___"]');
    const playerWidth = player.offsetWidth;
    const width = `${playerWidth}px`;

    return (
      <div>
        <div id="extended-bar" style={{ width: width }}>
          <div className="icon-end-time" />
          <div className="time end-time">
            {this.state.isOpen ? this.state.endText : "放送が終了しました"}
          </div>
          <div className="icon-message" />
          <div className="message">
            {this.state.doBlink ? (
              <Blink>
                <span style={{ color: "#FFEE66" }}>
                  {this.state.updateText}
                </span>
              </Blink>
            ) : (
              this.state.updateText
            )}
          </div>
          <div className="icon-rest-time" />
          <div className="time rest-time">
            {this.state.hour > 0
              ? `${this.state.hour}：${this.state.minute}：${this.state.second}`
              : `${this.state.minute}：${this.state.second}`}
          </div>
        </div>
      </div>
    );
  }
}
