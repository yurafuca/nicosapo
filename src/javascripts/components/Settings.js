import React from "react";
import ReactDOM from "react-dom";
import store from "store";
import NotificationList from "../components/NotificationList";
import AutoEnterList from "../components/AutoEnterList";
import Button from "../components/Button";
import Badge from "../modules/Badge";
import ExcludeList from "./ExcludeList";

function compare(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export default class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
    this.onCHange = this.onChange.bind(this);
    this.saveSettings = this.saveSettings.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onChangeCheckBox = this.onChangeCheckBox.bind(this);
    this.reflectSettings = this.reflectSettings.bind(this);
    this.playSound = this.playSound.bind(this);
    this.clickMenu = this.clickMenu.bind(this);
    this.repossessionSettings = this.repossessionSettings.bind(this);
    this.timer = null;
  }

  getInitialState() {
    const state = {
      settings: {},
      selectedMenu: "auto",
      resultMessage: "",
      selectableList: {
        minuteList: [15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
        idleMinuteList: [3, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
        soundFiles: [{ path: "ta-da.mp3", text: "Ta-da!" }, { path: "ding.mp3", text: "Ding" }, { path: "shupopo.mp3", text: "シュポポ" }, { path: "piroron.mp3", text: "ピロロン" }, { path: "pinpon.mp3", text: "ピンポン" }, { path: "famima.mp3", text: "ファミマ" }],
        defaultTabs: [{ tab: "following", text: "フォロー中" }, { tab: "following_future", text: "予約" }, { tab: "official", text: "公式" }, { tab: "official_future", text: "未来の公式" }, { tab: "search", text: "検索" }]
      },
      "options.redirect.time": 30,
      "options.soundfile": "ta-da.mp3",
      "options.autoJump.enable": "enable",
      "options.showReserved.enable": "enable",
      "options.autoEnter.forceCancel": false,
      "options.popup.enable": "enable",
      "options.playsound.enable": "enable",
      "options.openingNotification.duration": 6,
      "options.playsound.volume": 1.0,
      // 'options.autoEnter.cancelList':       [],
      "options.autoEnter.cancel.onIdle": false,
      "options.idle.minute": 20,
      "options.hideBadge.enable": "disable",
      "options.excludeMemberOnly.enable": false,
      "options.copyUrl": false,
      "options.notification.selfIgnoreList": []
    };
    return state;
  }

  repossessionSettings() {
    const settings = {};
    store.each((value, key) => {
      settings[key] = value;
    });
    this.setState({ settings: settings });
  }

  componentDidMount() {
    // ReactDOM.render(
    //   <AutoEnterList type='community' />,
    //   document.getElementById('listgroup-community')
    // );
    // ReactDOM.render(
    //   <AutoEnterList type='program' />,
    //   document.getElementById('listgroup-program')
    // );
    this.reflectSettings();
  }

  onChange(e) {
    if (e.target.name === "options.soundfile") {
      new Audio(`../sounds/${e.target.value}`).play();
    }
    if (e.target.name === "options.hideBadge.enable") {
      Badge.refresh();
    }
    let stateItem = this.state[e.target.name];
    if (e.target.type === "checkbox") {
      stateItem = stateItem.filter(v => v != e.target.value);
      if (e.target.checked) stateItem.push(e.target.value);
    } else {
      let value = e.target.value;
      if (value === "true" || value === "false") value = JSON.parse(value);
      stateItem = value;
    }
    this.setState({ [e.target.name]: stateItem }, this.saveSettings);
  }

  onChangeCheckBox(e) {
    const selectValue = Number(e.target.value);
    let minuteList = this.state["options.toast.minuteList"];
    if (minuteList.indexOf(selectValue) >= 0) {
      minuteList = minuteList.filter(v => v != selectValue);
    } else {
      minuteList.push(selectValue);
      minuteList.sort(compare);
    }
    this.saveSettings();
  }

  playSound() {
    const soundfile = this.state["options.soundfile"];
    const volume = this.state["options.playsound.volume"];
    const audio = new Audio(`../sounds/${soundfile}`);
    audio.volume = volume;
    audio.play();
  }

  reflectSettings() {
    store.each((value, key) => {
      const state = {};
      state[key] = value;
      this.setState(state);
    });
  }

  saveSettings() {
    for (const key in this.state) {
      if (key.startsWith("options.")) {
        store.set(key, this.state[key]);
      }
    }
    this.setState({ resultMessage: "設定を保存しました" }, () => {
      setTimeout(() => {
        this.setState({ resultMessage: "" });
      }, 1000);
    });
  }

  clickMenu(e) {
    const menu = e.target.dataset.menu;
    this.setState({ selectedMenu: menu });
    if (menu == "bug-report") this.timer = setInterval(this.repossessionSettings, 500);
    else clearInterval(this.timer);
  }

  render() {
    console.log(this.state);
    return (
      <div>
        <div className="content">
          <div style={{ maxWidth: "200px", float: "left" }}>
            <div className="wrapper menu float-left">
              <h1 className="appicon">基本設定</h1>
              <div className={this.state.selectedMenu === "auto" ? "item selected" : "item"} data-menu="auto" onClick={this.clickMenu}>
                自動枠移動・自動入場
              </div>
              <div className={this.state.selectedMenu === "notification" ? "item selected" : "item"} data-menu="notification" onClick={this.clickMenu}>
                通知
              </div>
              <div className={this.state.selectedMenu === "popup" ? "item selected" : "item"} data-menu="popup" onClick={this.clickMenu}>
                ポップアップ・バッジ
              </div>
              <div className={this.state.selectedMenu === "search" ? "item selected" : "item"} data-menu="search" onClick={this.clickMenu}>
                検索
              </div>
              <div className={this.state.selectedMenu === "integrations" ? "item selected" : "item"} data-menu="integrations" onClick={this.clickMenu}>
                他のツールとの連携
              </div>
            </div>
            <div className="wrapper menu float-left">
              <h1 className="appicon">リストの管理</h1>
              <div className={this.state.selectedMenu === "specify-notification" ? "item selected" : "item"} data-menu="specify-notification" onClick={this.clickMenu}>
                通知の個別設定
              </div>
              <div className={this.state.selectedMenu === "auto-program" ? "item selected" : "item"} data-menu="auto-program" onClick={this.clickMenu}>
                自動入場リスト（番組）
              </div>
              <div className={this.state.selectedMenu === "auto-community" ? "item selected" : "item"} data-menu="auto-community" onClick={this.clickMenu}>
                自動入場リスト（CH・コミュ）
              </div>
              <div className={this.state.selectedMenu === "exclude-from-search" ? "item selected" : "item"} data-menu="exclude-from-search" onClick={this.clickMenu}>
                検索結果のミュートリスト
              </div>
            </div>
            <div className="wrapper menu float-left">
              <h1 className="appicon">その他</h1>
              <div className={this.state.selectedMenu === "bug-report" ? "item selected" : "item"} data-menu="bug-report" onClick={this.clickMenu}>
                不具合報告用に設定を取得
              </div>
              <div className={this.state.selectedMenu === "help" ? "item selected" : "item"} data-menu="help" onClick={this.clickMenu}>
                にこさぽについて
              </div>
            </div>
            <p id="console" style={{ color: "#24963e", marginTop: "10px", float: "left" }}>
              {this.state.resultMessage}
            </p>
          </div>
          {(() => {
            if (this.state.selectedMenu == "auto") {
              return (
                <div className="wrapper">
                  <h1 className="appicon">自動枠移動・自動入場</h1>
                  <div className="items">
                    <div className="item">
                      <h3>自動次枠移動の更新間隔</h3>
                      <p className="note green" style={{ marginBottom: "0.6em" }}>
                        {" "}
                        音声や動画が頻繁に停止する場合は時間を長めに設定してください{" "}
                      </p>
                      <select name="options.redirect.time" onChange={this.onChange} value={this.state["options.redirect.time"]}>
                        {this.state.selectableList.minuteList.map(d => <option value={d}>{d}秒</option>)}
                      </select>
                    </div>
                    <div className="item">
                      <h3>自動次枠移動をデフォルトで「ON」にする</h3>
                      <label>
                        <input type="radio" name="options.autoJump.enable" value={"enable"} checked={this.state["options.autoJump.enable"] == "enable"} onChange={this.onChange} /> 有効
                      </label>
                      <label>
                        <input type="radio" name="options.autoJump.enable" value={"disable"} checked={this.state["options.autoJump.enable"] == "disable"} onChange={this.onChange} /> 無効
                      </label>
                    </div>
                    <div className="item">
                      <h3>自動入場を離席状態のときに自動で無効にする</h3>

                      <label>
                        <input type="radio" name="options.autoEnter.cancel.onIdle" onChange={this.onChange} value={false} checked={!this.state["options.autoEnter.cancel.onIdle"]} /> 無効にしない（通常どおり入場）
                      </label>
                      <label>
                        <input type="radio" name="options.autoEnter.cancel.onIdle" onChange={this.onChange} value={true} checked={this.state["options.autoEnter.cancel.onIdle"]} /> 無効にする
                      </label>
                    </div>
                    <div className="item">
                      <h3>離席状態になるまでの時間</h3>
                      <select name="options.idle.minute" onChange={this.onChange} value={this.state["options.idle.minute"]}>
                        {this.state.selectableList.idleMinuteList.map(d => <option value={d}>{d}分</option>)}
                      </select>
                    </div>
                  </div>
                  <div />
                </div>
              );
            }
          })()}
          {(() => {
            if (this.state.selectedMenu == "notification") {
              return (
                <div className="wrapper">
                  <h1 className="appicon">通知</h1>
                  <div className="items">
                    <div className="item">
                      <h3>通知を放送開始時に表示する</h3>
                      <label>
                        <input type="radio" name="options.popup.enable" value={"enable"} checked={this.state["options.popup.enable"] == "enable"} onChange={this.onChange} /> 有効
                      </label>
                      <label>
                        <input type="radio" name="options.popup.enable" value={"disable"} checked={this.state["options.popup.enable"] == "disable"} onChange={this.onChange} /> 無効
                      </label>
                    </div>
                    <div className="item">
                      <h3>音を放送開始時に鳴らす</h3>
                      <label>
                        <input type="radio" name="options.playsound.enable" value={"enable"} checked={this.state["options.playsound.enable"] == "enable"} onChange={this.onChange} /> 有効
                      </label>
                      <label>
                        <input type="radio" name="options.playsound.enable" value={"disable"} checked={this.state["options.playsound.enable"] == "disable"} onChange={this.onChange} /> 無効
                      </label>
                    </div>
                    <div className="item">
                      <h3>通知の表示位置</h3>
                      <p className="note" style={{ fontSize: "13px" }}>
                        Google Chrome の仕様上変更できません．
                      </p>
                    </div>
                    <div className="item">
                      <h3>「放送開始のお知らせ」通知の表示時間</h3>
                      <input type="range" name="options.openingNotification.duration" value={this.state["options.openingNotification.duration"]} min="0" max="20" step="1" onChange={this.onChange} />
                      <span id="openingNotification.duration">{this.state["options.openingNotification.duration"]}秒</span>
                    </div>
                    <div className="item">
                      <h3>通知音</h3>
                      <p className="note green" style={{ marginBottom: "0.6em" }}>
                        選択するとサンプル音が鳴ります
                      </p>
                      <select name="options.soundfile" onChange={this.onChange} value={this.state["options.soundfile"]}>
                        {this.state.selectableList.soundFiles.map(d => <option value={d.path}>{d.text}</option>)}
                      </select>
                    </div>
                    <div className="item">
                      <h3>通知音のボリューム</h3>
                      <input type="range" name="options.playsound.volume" value={this.state["options.playsound.volume"]} min="0.0" max="1.0" step="0.1" onChange={this.onChange} />
                      <button className="soundtest" onClick={this.playSound}>
                        音量テスト
                      </button>
                    </div>
                    <div className="item">
                      <h3>配信者向けの設定: 自分が配信したときの通知を表示しない</h3>
                      <p className="note green" style={{ marginBottom: "0.6em" }}>
                        あなたが配信に使用するコミュニティのリストを「,」区切りで入力してください．<br/>
                        例: co123456, co234567, co345678
                      </p>
                      <input placeholder="コミュニティのリストを入力" style={{ width: "280px", border: "1px solid #bbb", borderRadius: "3px", padding: "3px 6px" }} value={this.state["options.notification.selfIgnoreList"]} onChange={e => {
                        const value = e.target.value;
                        const parsedValue = value
                          .replace(/[，、]/g, ',')
                          .replace(/[ 　]/g, '');
                        const ignoreList = parsedValue.split(',');
                        store.set("options.notification.selfIgnoreList", ignoreList);
                        this.setState({ "options.notification.selfIgnoreList": ignoreList });
                      }} />
                    </div>
                  </div>
                </div>
              );
            }
          })()}
          {(() => {
            if (this.state.selectedMenu == "popup") {
              return (
                <div className="wrapper">
                  <h1 className="appicon">ポップアップ・バッジ</h1>
                  <div className="items">
                    <div className="item">
                      <h3>ポップアップを開いたときに選択するタブ</h3>
                      <select name="options.defaultTab" onChange={this.onChange} value={this.state["options.defaultTab"]}>
                        {this.state.selectableList.defaultTabs.map(d => <option value={d.tab}>{d.text}</option>)}
                    </select>
                    </div>
                    <div className="item">
                      <h3>予約番組をポップアップに表示する</h3>
                      <label>
                        <input type="radio" name="options.showReserved.enable" value={"enable"} checked={this.state["options.showReserved.enable"] == "enable"} onChange={this.onChange} /> 有効
                      </label>
                      <label>
                        <input type="radio" name="options.showReserved.enable" value={"disable"} checked={this.state["options.showReserved.enable"] == "disable"} onChange={this.onChange} /> 無効
                      </label>
                    </div>
                    <div className="item">
                      <h3>放送中の番組数が 0 のとき，バッジを非表示にする</h3>
                      <label>
                        <input type="radio" name="options.hideBadge.enable" value={"enable"} checked={this.state["options.hideBadge.enable"] == "enable"} onChange={this.onChange} /> 非表示にする
                      </label>
                      <label>
                        <input type="radio" name="options.hideBadge.enable" value={"disable"} checked={this.state["options.hideBadge.enable"] == "disable"} onChange={this.onChange} /> 「0」と表示する
                      </label>
                    </div>
                  </div>
                </div>
              );
            }
          })()}
          {(() => {
            if (this.state.selectedMenu == "search") {
              return (
                <div className="wrapper">
                  <h1 className="appicon">検索</h1>
                  <div className="items">
                    <div className="item">
                      <h3>コミュニティ限定番組を検索結果からミュートする</h3>
                      <label>
                        <input type="radio" name="options.excludeMemberOnly.enable" value={true} checked={this.state["options.excludeMemberOnly.enable"] == true} onChange={this.onChange} /> 有効
                      </label>
                      <label>
                        <input type="radio" name="options.excludeMemberOnly.enable" value={false} checked={this.state["options.excludeMemberOnly.enable"] == false} onChange={this.onChange} /> 無効
                      </label>
                    </div>
                  </div>
                </div>
              );
            }
          })()}
          {(() => {
            if (this.state.selectedMenu == "integrations") {
              return (
                <div className="wrapper">
                  <h1 className="appicon">他のツールとの連携</h1>
                  <div className="items">
                    <div className="item">
                      <h3>番組を開いたときに番組の URL をクリップボードにコピーする</h3>
                      <p className="note green" style={{ marginBottom: "0.6em" }}>
                        コメントビューアのアドレスバーに URL をペーストするときに便利です
                      </p>
                      <label>
                        <input type="radio" name="options.copyUrl" value={true} checked={this.state["options.copyUrl"] == true} onChange={this.onChange} /> 有効
                      </label>
                      <label>
                        <input type="radio" name="options.copyUrl" value={false} checked={this.state["options.copyUrl"] == false} onChange={this.onChange} /> 無効
                      </label>
                    </div>
                  </div>
                </div>
              );
            }
          })()}
          {(() => {
            if (this.state.selectedMenu == "specify-notification") {
              return (
                <div className="wrapper">
                  <h1 className="appicon">通知の個別設定</h1>
                  <div id="listgroup-community">
                    <NotificationList />
                  </div>
                </div>
              );
            }
          })()}
          {(() => {
            if (this.state.selectedMenu == "auto-program") {
              return (
                <div className="wrapper">
                  <h1 className="appicon">自動入場が有効になっている番組</h1>
                  <div id="listgroup-program">
                    <AutoEnterList type="program" />
                  </div>
                </div>
              );
            }
          })()}
          {(() => {
            if (this.state.selectedMenu == "auto-community") {
              return (
                <div className="wrapper">
                  <h1 className="appicon">自動入場が有効になっているCH・コミュ</h1>
                  <div id="listgroup-community">
                    <AutoEnterList type="community" />
                  </div>
                </div>
              );
            }
          })()}
          {(() => {
            if (this.state.selectedMenu == "exclude-from-search") {
              return (
                <div className="wrapper">
                  <h1 className="appicon">検索結果のミュートリスト</h1>
                  <div id="listgroup-community">
                    <ExcludeList />
                  </div>
                </div>
              );
            }
          })()}
          {(() => {
            if (this.state.selectedMenu == "bug-report") {
              return (
                <div className="wrapper">
                  <h1 className="appicon">不具合報告用に設定を取得</h1>
                  <div>
                    <p
                      style={{
                        marginBottom: "2px",
                        fontSize: "12px",
                        marginTop: "10px"
                      }}
                    >
                      不具合報告をしたとき，作者から現在の設定を貼るように指示があった場合は，下記を貼り付けてください．
                    </p>
                    <div
                      style={{
                        border: "solid 1px #D8D8D8",
                        backgroundColor: "#f6f8fa",
                        padding: "10px",
                        marginTop: "20px",
                        fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
                        wordWrap: "break-word"
                      }}
                    >
                      BEGIN &gt;&gt;&gt;
                      {Object.keys(this.state.settings).map(key => (
                        <p key={key}>
                          <span>
                            {key}: {JSON.stringify(this.state.settings[key])}
                          </span>
                        </p>
                      ))}
                      &gt;&gt;&gt; END
                    </div>
                  </div>
                </div>
              );
            }
          })()}
          {(() => {
            if (this.state.selectedMenu == "help") {
              return (
                <div className="wrapper">
                  <h1 className="appicon">にこさぽについて</h1>
                  <div id="appinfo" style={{ textAlign: "center", margin: "20px auto" }}>
                    <div id="logo">
                      <a target="_blank" href="https://goo.gl/UWX5H2">
                        <img src="../images/nicosapo_2x.png" style={{ width: "360px", height: "128px" }}/>
                      </a>
                    </div>
                    <p>ニコニコ生放送の視聴をサポートする Google Chrome Extension</p>
                    <p>バージョン: {chrome.runtime.getManifest().version}</p>

                  </div>
                  <h1 className="appicon">作者</h1>
                  <p className="note gray margin-top-10">Twitter</p>
                  <p>
                    <a href="https://twitter.com/yurafuca" target="_blank">@yurafuca</a>
                  </p>
                  <p className="note gray margin-top-15" target="_blank">リポジトリ</p>
                  <p>
                    <a href="https://github.com/yurafuca/nicosapo/" target="_blank">yurafuca/nicosapo</a>
                  </p>
                </div>
              );
            }
          })()}
          {(() => {
            if (this.state.selectedMenu == "auto") {
              return (
                <div className="wrapper" style={{ marginTop: "20px" }}>
                  <h1 className="appicon">作者に寄付する</h1>
                  <div className="items">
                    <span className="campa">休日や業務の終了後に個人でにこさぽを開発しています．もしにこさぽを気に入ったらカンパしていただけるととても励みになります．</span>
                    <ul>
                      <li>
                        <a target="_blank" href="https://amzn.asia/3CJmj5o">
                          Amazon ほしいものリスト - ほしい本
                        </a>
                      </li>
                      <li>
                        <a target="_blank" href="https://amzn.asia/hqChgj3">
                          Amazon ほしいものリスト - ほしい雑貨
                        </a>
                      </li>
                      <li>
                        <a target="_blank" href="https://www.amazon.co.jp/dp/B004N3APGO/">
                          Amazon ギフト券
                        </a>
                      </li>
                      <li>
                        <span className="force-body-color">Kyash 残高を送る</span>
                        <img className="kyash-qr" src="../images/kyash_qr.jpg" />
                      </li>
                    </ul>
                  </div>
                </div>
              );
            }
          })()}
        </div>
      </div>
    );
  }
}
