import React from 'react';
import ReactDOM from 'react-dom';
import store from 'store';
import AutoEnterList from '../components/AutoEnterList';

function compare(a, b) {
  if( a < b ) return -1;
  if( a > b ) return 1;
  return 0;
}

export default class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state            = this.getInitialState();
    this.onCHange         = this.onChange.bind(this);
    this.saveSettings     = this.saveSettings.bind(this);
    this.onChange         = this.onChange.bind(this);
    this.onChangeCheckBox = this.onChangeCheckBox.bind(this);
    this.reflectSettings  = this.reflectSettings.bind(this);
    this.playSound        = this.playSound.bind(this);
  }

  getInitialState() {
    const settings = this.getDefaultSettings();
    const selectableList = {
      minuteList: [15, 20, 25, 30, 25, 40, 50, 60, 70, 80, 90, 100, 110, 120],
      toastTimes: [1, 2, 3, 4, 5],
      soundFiles: [
        {path: 'ta-da.mp3',   text: 'Ta-da!'},
        {path: 'ding.mp3',    text: 'Ding'},
        {path: 'shupopo.mp3', text: 'シュポポ'},
        {path: 'piroron.mp3', text: 'ピロロン'},
        {path: 'pinpon.mp3',  text: 'ピンポン'},
        {path: 'famima.mp3',  text: 'ファミマ'},
      ]
    };
    Object.assign(settings, {'selectableList': selectableList});
    return settings;
  }

  componentDidMount() {
    ReactDOM.render(
      <AutoEnterList type='community' />,
      document.getElementById('listgroup-community')
    );

    ReactDOM.render(
      <AutoEnterList type='program' />,
      document.getElementById('listgroup-program')
    );
    this.reflectSettings();
  }

  getDefaultSettings() {
    return ({
      'options.redirect.time':                50,
      'options.toast.minuteList':             [1, 3, 5],
      'options.soundfile':                    'ta-da.mp3',
      'options.autoJump.enable':              'enable',
      'options.showReserved.enable':          'enable',
      'options.popup.enable':                 'enable',
      'options.playsound.enable':             'enable',
      'options.openingNotification.duration':  6,
      'options.playsound.volume':              1.0
    })
  }

  onChange(e) {
    if (e.target.name === 'options.soundfile') {
      new Audio(`../sounds/${e.target.value}`).play();
    }
    const state = {};
    state[e.target.name] = e.target.value;
    // this.setState(state, () => { console.info(this.state); });
  }

  onChangeCheckBox(e) {
    const selectValue = Number(e.target.value);
    let minuteList = this.state['options.toast.minuteList'];
    if (minuteList.indexOf(selectValue) >= 0) {
      minuteList = minuteList.filter((v) => v != selectValue);
    } else {
      minuteList.push(selectValue);
      minuteList.sort(compare);
    }
  }

  playSound() {
      const soundfile = this.state['options.soundfile'];
      const volume    = this.state['options.playsound.volume'];
      const audio     = new Audio(`../sounds/${soundfile}`);
      audio.volume    = volume;
      audio.play();
  }

  reflectSettings() {
    for (const key in store.getAll()) {
      const state = {};
      state[key] = store.get(key);;
      this.setState(state);
    }
  }

  saveSettings() {
    for (const key in this.state) {
      if (key.startsWith('options.')) {
        store.set(key, this.state[key]);
      }
    }
  }

  render() {
    return (
      <div>
        <div className="header appicon">にこさぽ 設定</div>
        <div className="content">
          <div className="wrapper">
            <h1 className="appicon">基本設定</h1>
            <div className="items">


              <div>
                <h3>自動次枠移動の更新間隔</h3>
                <select  name="options.redirect.time"  onChange={this.onChange} value={this.state['options.redirect.time']}>
                  {this.state.selectableList.minuteList.map((d) =>
                    <option value={d}>
                      {d}秒
                    </option>
                  )}
                </select>
                <p className='note red'> 音声や動画が頻繁に停止する場合は時間を長めに設定してください </p>
              </div>



              <div>
                <h3>残り時間が少なくなったとき，プレイヤー左上に通知を表示する</h3>
                {
                  this.state.selectableList.toastTimes.map((d) =>
                    <label>
                      <input type="checkbox" name="options.toast.minuteList" value={d} checked={((this.state['options.toast.minuteList'].indexOf(d) >= 0) ? true : false)} onChange={this.onChangeCheckBox} />
                        {d}分前
                    </label>
                  )
                }
              </div>



              <div>
                <h3>自動次枠移動をデフォルトで「ON」にする</h3>
                <input type="radio" name="options.autoJump.enable" value={'enable'} checked={this.state['options.autoJump.enable'] == 'enable'} onChange={this.onChange} /> 有効
                <input type="radio" name="options.autoJump.enable" value={'disable'} checked={this.state['options.autoJump.enable'] == 'disable'} onChange={this.onChange} /> 無効
              </div>
              <div>
                <h3>予約番組をポップアップに表示する</h3>
                <input type="radio" name="options.showReserved.enable" value={'enable'} checked={this.state['options.showReserved.enable'] == 'enable'} onChange={this.onChange} /> 有効
                <input type="radio" name="options.showReserved.enable" value={'disable'} checked={this.state['options.showReserved.enable'] == 'disable'} onChange={this.onChange} /> 無効
              </div>
              <div>
                <h3>通知を放送開始時に表示する</h3>
                <input type="radio" name="options.popup.enable" value={'enable'} checked={this.state['options.popup.enable'] == 'enable'} onChange={this.onChange} /> 有効
                <input type="radio" name="options.popup.enable" value={'disable'} checked={this.state['options.popup.enable'] == 'disable'} onChange={this.onChange} /> 無効
              </div>
              <div>
                <h3>音を放送開始時に鳴らす</h3>
                <input type="radio" name="options.playsound.enable" value={'enable'} checked={this.state['options.playsound.enable'] == 'enable'} onChange={this.onChange} /> 有効
                <input type="radio" name="options.playsound.enable" value={'disable'} checked={this.state['options.playsound.enable'] == 'disable'} onChange={this.onChange} /> 無効
              </div>
              <div>
                <h3>通知の表示位置</h3>
                <p style={{color:'#767676'}}>Google Chrome の仕様上変更できません．</p>
              </div>
              <div>
                <h3>「放送開始のお知らせ」通知の表示時間</h3>
                <input type="range" name="options.openingNotification.duration" value={this.state['options.openingNotification.duration']} min="0" max="20" step="1" onChange={this.onChange} />
                <span id="openingNotification.duration">{this.state['options.openingNotification.duration']}秒</span>
              </div>

              <div>
                <h3>通知音</h3>
                <select name="options.soundfile" onChange={this.onChange} value={this.state['options.soundfile']}>
                  {this.state.selectableList.soundFiles.map((d) =>
                    <option value={d.path}>{d.text}</option>
                  )}
                </select>
                <p className='note'>選択するとサンプル音が鳴ります</p>
              </div>

              <div>
                <h3>通知音のボリューム</h3>
                <input type="range" name="options.playsound.volume" value={this.state['options.playsound.volume']} min="0.0" max="1.0" step="0.1" onChange={this.onChange} />
                <button className="soundtest" onClick={this.playSound}>音量テスト</button>
              </div>
              <div id="buttons">
                <input id="saveAll" type="submit" value="設定を保存する" onClick={this.saveSettings}/>
                <p id="console" style={{color: '#228b22'}}>
                </p>
              </div>
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
    )
  }
}
