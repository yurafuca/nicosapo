import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

const optionNames = {
  reloadTimes:  'options.redirect.time',
  toastTimes:   'options.toast.minuteList',
  autoJump:     'options.autoJump.enable',
  showReserved: 'options.showReserved.enable',
  showPopup:    'options.popup.enable',
  playSound:    'options.playsound.enable',
  soundFiles:   'options.openingNotification.duration',
  reloadTimes:  'options.soundfile',
  reloadTimes:  'options.playsound.volume'
};

export default class Settings extends React.Component {
  getInitialState() {
    return {
      reloadTimes:  [15, 20, 25, 30, 25, 40, 50, 60, 70, 80, 90, 100, 110, 120],
      reloadTime:   50,
      toastTimes:   [1, 2, 3, 4, 5],
      toastTime:    [1, 3, 5],
      soundFiles    [
        {path: 'ta-da.mp3',   text: 'Ta-da!'},
        {path: 'ding.mp3',    text: 'Ding'},
        {path: 'shupopo.mp3', text: 'シュポポ'},
        {path: 'piroron.mp3', text: 'ピロロン'},
        {path: 'pinpon.mp3',  text: 'ピンポン'},
        {path: 'famima.mp3',  text: 'ファミマ'},
      ],
      soundFile     'ta-da.mp3',
      autoJump:     true
      showReserved: true,
      showPopup:    true,
      playSound:    true,
      popupTime:    6,
      soundVolume:  100
  }

  onChangeRadioButton(e) {
    const name = names[e.target.name];
    const state = {};
    state[name].checked = e.target.checked;
    this.setState(state)
  }

  onChangeSelectBox(e) {
    const name = names[e.target.name];
    const state = {};
    state[name] = e.target.value;
    this.setState(state)
  }

  onChangeSlideBar(e) {
    const name = names[e.target.name];
    const state = {};
    state[name] = e.target.value;
    this.setState(state)
  }

  // TODO:
  onChangeCheckBox(e) {
    const name = names[e.target.name];
    const state = {};
    state[name].checked = e.target.checked;
    this.setState(state)
  }

  // TODO: onClick
  render() {
    return (
      <div className="header appicon">にこさぽ 設定</div>
      <div className="content">
        <div className="wrapper">
          <h1 className="appicon">基本設定</h1>
          <div className="items">
            <div>
              <h3>自動次枠移動の更新間隔</h3>
              <select id="options.redirect.time">
                {this.state.reloadTimes.map((d) =>
                  <option
                    name="options.redirect.time"
                    value={d}
                    onChange={this.onChangeSelectBox.bind(this)}>
                    {d}秒
                  </option>
                )}
              </select>
              <p className='note red'>
                音声や動画が頻繁に停止する場合は時間を長めに設定してください
              </p>
            </div>
            <div>
              <h3>残り時間が少なくなったとき，プレイヤー左上に通知を表示する</h3>
              {this.state.toastTimes.map((d) =>
                <input
                  type="checkbox"
                  name="options.toast.minuteList"
                  value={d}
                  checked={d.checked}
                  onChange={this.onChangeCheckBox.bind(this)}>
                    {d}分前
                </input>
              )}
            </div>
            <div>
              <h3>自動次枠移動をデフォルトで「ON」にする</h3>
              <input
                type="radio"
                name="options.autoJump.enable"
                value={true}
                checked={this.state.autoJump}
                onChange={this.onChangeRadioButton.bind(this)}> 有効
              <input
                type="radio"
                name="options.autoJump.enable"
                value={false}
                checked={!this.state.autoJump}
                onChange={this.onChangeRadioButton.bind(this)}> 無効
            </div>
            <div>
              <h3>予約番組をポップアップに表示する</h3>
              <input
                type="radio"
                name="options.showReserved.enable"
                value={true}
                checked={this.state.showReserved}
                onChange={this.onChangeRadioButton.bind(this)}> 有効
              <input
                type="radio"
                name="options.showReserved.enable"
                value={false}
                checked={!this.state.showReserved}
                onChange={this.onChangeRadioButton.bind(this)}> 無効
            </div>
            <div>
              <h3>通知を放送開始時に表示する</h3>
              <input
                type="radio"
                name="options.popup.enable"
                value={true}
                checked={this.state.popup}
                onChange={this.onChangeRadioButton.bind(this)}> 有効
              <input
                type="radio"
                name="options.popup.enable"
                value={false}
                checked={!this.state.popup}
                onChange={this.onChangeRadioButton.bind(this)}> 無効
            </div>
            <div>
              <h3>音を放送開始時に鳴らす</h3>
              <input
                type="radio"
                name="options.playsound.enable"
                value={true}
                checked={this.state.playSound}
                onChange={this.onChangeRadioButton.bind(this)}> 有効
              <input
                type="radio"
                name="options.playsound.enable"
                value={false}
                checked={!this.state.playSound}
                onChange={this.onChangeRadioButton.bind(this)}> 無効
            </div>
            <div>
              <h3>通知の表示位置</h3>
              <p style="color:#767676">Google Chrome の仕様上変更できません．</p>
            </div>
            <div>
              <h3>「放送開始のお知らせ」通知の表示時間</h3>
              <input
                type="range"
                name="options.openingNotification.duration"
                value={this.state.popupTime}
                min="0"
                max="20"
                step="1"
                onChange={this.onChangeSlideBar.bind(this)} />
              <span id="openingNotification.duration">
                {this.state.popupTime}秒
              </span>
            </div>
            <div>
              <h3>通知音</h3>
              <select
                id="options.soundfile">
                {this.state.soundFiles.map((d) =>
                  <option
                    name="options.soundfile"
                    value={d.path}
                    selected={d.path === soundFile}
                    onChange={this.onChangeSelectBox.bind(this)}>
                    {d.text}
                  </option>
                )}
              </select>
              <p className='note'>選択するとサンプル音が鳴ります</p>
            </div>
            <div>
              <h3>通知音のボリューム</h3>
              <input
                type="range"
                name="options.playsound.volume"
                value="1.0"
                min="0.0"
                max="1.0"
                step="0.1"
                onChange={this.onChangeSlideBar.bind(this)} />
              <button className="soundtest">音量テスト</button>
            </div>
            </div>
            <div id="buttons">
              <input
                id="saveAll"
                type="submit"
                value="設定を保存する" />
              <p id="console"
                style="color: #228b22;">
              </p>
            </div>
            </div>
            <div className="wrapper">
              <h1 className="appicon">自動入場が有効になっている番組</h1>
              <div id="listgroup-program">
              </div>
            </div>
            <div className="wrapper">
              <h1 className="appicon">自動入場が有効になっているコミュニティ/チャンネル</h1>
              <div id="listgroup-community">
              </div>
            </div>
            <div className="wrapper">
              <h1 className="appicon">作者にカンパする</h1>
              <div className="items">
                <span className="campa">
                  にこさぽの開発を応援してくださる方はよろしくお願いします．今後の開発の励みになります．😇
                </span>
                  <p>
                    <a
                      target="_blank"
                      href="http://amzn.asia/hqChgj3">
                      Amazon ほしいものリスト - ほしい雑貨
                    </a>
                  </p>
                  <p>
                    <a
                      target="_blank"
                      href="http://amzn.asia/8BFBccC">
                      Amazon ほしいものリスト - ほしい本
                    </a>
                  </p>
                </div>
            </div>
          </div>
        </div>
    )
  }
}
