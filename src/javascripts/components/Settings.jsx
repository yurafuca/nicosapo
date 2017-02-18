import React from 'react';
import ReactDOM from 'react-dom';
// import Time from '../common/Time';
// import AutoEnterList from '../components/AutoEnterList';

const names = {
  'options.redirect.time': 'reloadTimes',
  'options.toast.minuteList': 'toastTimes',
  'options.autoJump.enable': 'autoJump',
  'options.showReserved.enable': 'showReserved',
  'options.popup.enable': 'showPopup',
  'options.playsound.enable': 'playSound',
  'options.openingNotification.duration': 'popupTime',
  'options.soundfile': 'soundFile',
  'options.playsound.volume': 'soundVolume'
};

// ReactDOM.render(
//   <AutoEnterList type='community' />,
//   document.getElementById('listgroup-community')
// );
//
// ReactDOM.render(
//   <AutoEnterList type='program' />,
//   document.getElementById('listgroup-program')
// );



// $(document).on('click', '#saveAll', () => {
//   saveAllSettings();
//   $('#console').text(`設定を保存しました．`);
//   setTimeout(() => { $('#console').text(''); }, 1000);
// });
//
// $("#options-soundfile").change(() => {
//   $("#options-soundfile option:selected").each(() => {
//     new Audio(`../sounds/${$(this).val()}`).play();
//   });
// });
//
// $(document).on('click', '.soundtest', () => {
//   const soundfile = $('#options-soundfile :selected').val();
//   const volume    = $("input[name=options-playsound-volume]").val();
//   const audio     = new Audio(`../sounds/${soundfile}`);
//   audio.volume    = volume;
//   audio.play();
// });
//
// const selector = "input[name=options-openingNotification-duration]";
// $(selector).on("input", () => {
//   $("#openingNotification-duration").text($(selector).val());
// });
//
// const saveAllSettings = () => {
//   const settings = getAllSettings();
//   for (const key in settings) {
//     localStorage.setItem(key, settings[key]);
//   }
// }

export default class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
    this.onChangeRadioButton = this.onChangeRadioButton.bind(this);
    this.onChangeSelectBox = this.onChangeSelectBox.bind(this);
    this.onChangeSlideBar = this.onChangeSlideBar.bind(this);
    this.onChangeCheckBox = this.onChangeCheckBox.bind(this);
  }

  componentDidMount() {
  }

  getInitialState() {
    return ({
      reloadTimes:  [15, 20, 25, 30, 25, 40, 50, 60, 70, 80, 90, 100, 110, 120],
      reloadTime:   50,
      toastTimes:   [1, 2, 3, 4, 5],
      toastTime:    [1, 3, 5],
      soundFiles:   [
        {path: 'ta-da.mp3',   text: 'Ta-da!'},
        {path: 'ding.mp3',    text: 'Ding'},
        {path: 'shupopo.mp3', text: 'シュポポ'},
        {path: 'piroron.mp3', text: 'ピロロン'},
        {path: 'pinpon.mp3',  text: 'ピンポン'},
        {path: 'famima.mp3',  text: 'ファミマ'},
      ],
      soundFile:    'ta-da.mp3',
      autoJump:     'true',
      showReserved: 'true',
      showPopup:    'true',
      playSound:    'true',
      popupTime:    '6',
      soundVolume:  '1.0'
    });
  }

  onChangeRadioButton(e) {
    console.info(e);
    const name = names[e.target.name];
    const state = {};
    state[name] = e.target.value;
    console.info(state);
    this.setState(state, () => {
      console.info(this.state);
    });
  }

  onChangeSelectBox(e) {
    const name = names[e.target.name];
    const state = {};
    state[name] = e.target.value;
    console.info(state);
    this.setState(state, () => {
      console.info(this.state);
    });
  }

  onChangeSlideBar(e) {
    console.info(e);
    const name = names[e.target.name];
    const state = {};
    state[name] = e.target.value;
    console.info(state);
    this.setState(state, () => {
      console.info(this.state);
    });
  }

  // TODO:
  onChangeCheckBox(e) {
    console.info(e);
    const name = names[e.target.name];
    const state = {};
    state[name] = e.target.checked;
    console.info(state);
    this.setState(state, () => {
      console.info(this.state);
    });
  }

  // TODO: onClick
  render() {
    return (
      <div>
        <div className="header appicon">にこさぽ 設定</div>
        <div className="content">
          <div className="wrapper">
            <h1 className="appicon">基本設定</h1>
            <div className="items">

              <div>
                <h3>自動次枠移動をデフォルトで「ON」にする</h3>
                <input type="radio" name="options.autoJump.enable" value={true} checked={this.state.autoJump == 'true'} onChange={this.onChangeRadioButton} /> 有効
                <input type="radio" name="options.autoJump.enable" value={false} checked={this.state.autoJump == 'false'} onChange={this.onChangeRadioButton} /> 無効
              </div>
              <div>
                <h3>予約番組をポップアップに表示する</h3>
                <input type="radio" name="options.showReserved.enable" value={true} checked={this.state.showReserved == 'true'} onChange={this.onChangeRadioButton} /> 有効
                <input type="radio" name="options.showReserved.enable" value={false} checked={this.state.showReserved == 'false'} onChange={this.onChangeRadioButton} /> 無効
              </div>
              <div>
                <h3>通知を放送開始時に表示する</h3>
                <input type="radio" name="options.popup.enable" value={true} checked={this.state.showPopup == 'true'} onChange={this.onChangeRadioButton} /> 有効
                <input type="radio" name="options.popup.enable" value={false} checked={this.state.showPopup == 'false'} onChange={this.onChangeRadioButton} /> 無効
              </div>
              <div>
                <h3>音を放送開始時に鳴らす</h3>
                <input type="radio" name="options.playsound.enable" value={true} checked={this.state.playSound == 'true'} onChange={this.onChangeRadioButton} /> 有効
                <input type="radio" name="options.playsound.enable" value={false} checked={this.state.playSound == 'false'} onChange={this.onChangeRadioButton} /> 無効
              </div>
              <div>
                <h3>通知の表示位置</h3>
                <p style={{color:'#767676'}}>Google Chrome の仕様上変更できません．</p>
              </div>
              <div>
                <h3>「放送開始のお知らせ」通知の表示時間</h3>
                <input type="range" name="options.openingNotification.duration" value={this.state.popupTime} min="0" max="20" step="1" onChange={this.onChangeSlideBar} />
                <span id="openingNotification.duration">{this.state.popupTime}秒</span>
              </div>



              <div>
                <h3>通知音のボリューム</h3>
                <input type="range" name="options.playsound.volume" value={this.state.soundVolume} min="0.0" max="1.0" step="0.1" onChange={this.onChangeSlideBar} />
                <button className="soundtest">音量テスト</button>
              </div>
              <div id="buttons">
                <input id="saveAll" type="submit" value="設定を保存する" />
                <p id="console" style={{color: '#228b22'}}>
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
                <span className="campa">にこさぽの開発を応援してくださる方はよろしくお願いします．今後の開発の励みになります．😇</span>
                  <p> <a target="_blank" href="http://amzn.asia/hqChgj3">Amazon ほしいものリスト - ほしい雑貨</a></p>
                  <p> <a target="_blank" href="http://amzn.asia/8BFBccC">Amazon ほしいものリスト - ほしい本</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
