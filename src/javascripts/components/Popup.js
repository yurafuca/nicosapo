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
      selectedTab: "user",
      programs: []
    };
    this.toggleTab = this.toggleTab.bind(this);

    Api.loadCasts("user")
      .then(programs => {
        this.setState({ programs: programs });
      })
      .catch(() => {
        // this.setState({ isLogined: false, loading: false });
      });
  }

  // componentDidMount() {
  //   if (store.get("options.showReserved.enable") == "enable") {
  //     this.setState({ showReserve: false });
  //   } else {
  //     this.setState({ showReserve: true });
  //   }
  // }

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
    Api.loadCasts(e.target.id)
      .then(programs => {
        this.setState({ programs: programs });
      })
      .catch(() => {
        // this.setState({ isLogined: false, loading: false });
      });
  }

  render() {
    const menu = (
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
    );

    const tabs = [
      { name: "user", text: "フォロー中" },
      { name: "official", text: "公式" },
      { name: "future", text: "未来の公式" },
      { name: "search", text: "検索" }
    ].map(tab => {
      return (
        <div
          key={tab.name}
          id={tab.name}
          className={
            this.state.selectedTab === tab.name
              ? `tab selected`
              : `tab non-selected`
          }
          onClick={this.toggleTab}
        >
          {tab.text}
        </div>
      );
    });

    let content;
    if (this.state.selectedTab === "user") {
      if (this.state.isLogined === false) {
        content = (
          <div className="message">
            ニコニコ動画にログインしていません．ログインしてから再度お試しください．
          </div>
        );
      } else {
        content = <UserThumbnails programs={this.state.programs} />;
      }
    } else if (
      this.state.selectedTab === "official" ||
      this.state.selectedTab === "future"
    ) {
      content = <OfficialThumbnails genre={this.state.selectedTab} />;
    } else if (this.state.selectedTab === "search") {
      content = <SearchContent />;
    }

    return (
      <div id="wrapper">
        {menu}
        <div id="tab-container">{tabs}</div>
        <div id="communities">
          {/* <div
            style={{ height: "200px", width: "200px" }}
            className="nowloading"
          /> */}
          {/* <video autoPlay loop className="loading">
            <source src="/images/loading.mp4" />
          </video> */}
          {content}
        </div>
      </div>
    );
  }
}
