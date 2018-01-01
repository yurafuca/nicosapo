import React from "react";
import store from "store";
import Api from "../api/Api";
import UserThumbnails from "../components/UserThumbnails";
import OfficialThumbnails from "../components/OfficialThumbnails";
import SearchContent from "../components/SearchContent";

export default class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: "user"
    };
    this.toggleTab = this.toggleTab.bind(this);

    Api.isLogined()
      .then(() => {
        this.setState({ isLogined: true });
      })
      .catch(() => {
        // this.setState({ isLogined: false, loading: false });
      });
  }

  componentDidMount() {
    if (store.get("options.showReserved.enable") == "enable") {
      this.setState({ showReserve: false });
    } else {
      this.setState({ showReserve: true });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const selectedTab = {
      prev: this.state.selectedTab,
      next: nextState.selectedTab
    };
    return true;
  }

  toggleTab(e) {
    if (e.target.id === this.state.selectedTab) {
      return;
    }
    switch (e.target.id) {
      case "user":
        this.setState({ selectedTab: "user", videoInfoList: [] });
        break;
      case "official":
        this.setState({ selectedTab: "official", videoInfoList: [] });
        break;
      case "future":
        this.setState({ selectedTab: "future", videoInfoList: [] });
        break;
      case "search":
        this.setState({
          selectedTab: "search",
          videoInfoList: [],
          loading: false
        });
        break;
      default:
        this.setState({ selectedTab: "user" });
        break;
    }
  }

  render() {
    return (
      <div id="wrapper">
        <div id="menu">
          <div className="avator" />
          <span className="username">放送中の番組</span>
          <a className="menu-button" href="options.html" target="_blank">
            <span className="octicon mega-octicon octicon-tools" />
            <span className="title">設定</span>
          </a>
          <a
            className="menu-button"
            href="http://live.nicovideo.jp/my"
            target="_blank"
          >
            <span className="octicon mega-octicon octicon-radio-tower" />
            <span className="title">マイページ</span>
          </a>
        </div>
        <div id="tab-container">
          <div
            id="user"
            className={
              this.state.selectedTab === "user"
                ? `tab selected`
                : `tab non-selected`
            }
            onClick={this.toggleTab}
          >
            フォロー中
          </div>
          <div
            id="official"
            className={
              this.state.selectedTab === "official"
                ? `tab selected`
                : `tab non-selected`
            }
            onClick={this.toggleTab}
          >
            公式
          </div>
          <div
            id="future"
            className={
              this.state.selectedTab === "future"
                ? `tab selected`
                : `tab non-selected`
            }
            onClick={this.toggleTab}
          >
            未来の公式
          </div>
          <div
            id="search"
            className={
              this.state.selectedTab === "search"
                ? `tab selected`
                : `tab non-selected`
            }
            onClick={this.toggleTab}
          >
            検索
          </div>
        </div>
        <div
          id="communities"
          className={this.state.loading ? "nowloading" : ""}
        >
          {(() => {
            if (this.state.noCast) {
              return (
                <div className="message">
                  {" "}
                  {this.state.showReserve
                    ? "放送中/予約中の番組がありません．"
                    : "放送中の番組がありません．"}{" "}
                </div>
              );
            }
            if (this.state.selectedTab === "user") {
              if (this.state.isLogined === false) {
                return (
                  <div className="message">
                    ニコニコ動画にログインしていません．ログインしてから再度お試しください．
                  </div>
                );
              }
              return <UserThumbnails />;
            }
            if (
              this.state.selectedTab === "official" ||
              this.state.selectedTab === "future"
            ) {
              return <OfficialThumbnails genre={this.state.selectedTab} />;
            }
            if (this.state.selectedTab === "search") {
              return <SearchContent />;
            }
          })()}
        </div>
      </div>
    );
  }
}
