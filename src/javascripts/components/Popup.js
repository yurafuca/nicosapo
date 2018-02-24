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
      loading: true,
      selectedTab: "user",
      programs: []
    };
    this.toggleTab = this.toggleTab.bind(this);

    Api.loadCasts("user")
      .then(programs => {
        this.setState({
          programs: programs,
          loading: false,
          loadedTab: "user"
        });
      })
      .catch(() => {
        this.setState({
          isLogined: false,
          loading: false,
          loadedTab: "user"
        });
      });
  }

  toggleTab(e) {
    if (e.target.id === this.state.selectedTab) {
      return;
    }
    const loadedTab = e.target.id;
    this.setState({
      programs: [],
      loading: true,
      loadedTab: loadedTab
    });
    switch (e.target.id) {
      case "user":
        this.setState({ selectedTab: "user" });
        break;
      case "official":
        this.setState({ selectedTab: "official" });
        break;
      case "future":
        this.setState({ selectedTab: "future" });
        break;
      case "search":
        this.setState({ selectedTab: "search" });
        break;
      default:
        this.setState({ selectedTab: "user" });
        break;
    }
    Api.loadCasts(e.target.id)
      .then(programs => {
        console.log(loadedTab);
        this.setState({
          programs: programs,
          loading: false,
          loadedTab: loadedTab
        });
      })
      .catch(() => {
        // this.setState({ isLogined: false, loading: false });
      });
  }

  getMenu() {
    return (
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
  }

  getTabs() {
    const { selectedTab, isLogined } = this.state;

    return (
      <div>
        <div
          key="user"
          id="user"
          className={
            selectedTab === "user" ? `tab selected` : `tab non-selected`
          }
          onClick={this.toggleTab}
        >
          フォロー中
        </div>
        <div
          key="official"
          id="official"
          className={
            selectedTab === "official" ? `tab selected` : `tab non-selected`
          }
          onClick={this.toggleTab}
        >
          公式
        </div>
        <div
          key="future"
          id="future"
          className={
            selectedTab === "future" ? `tab selected` : `tab non-selected`
          }
          onClick={this.toggleTab}
        >
          未来の公式
        </div>
        <div
          key="search"
          id="search"
          className={
            selectedTab === "search" ? `tab selected` : `tab non-selected`
          }
          onClick={this.toggleTab}
        >
          番組
        </div>
      </div>
    );
  }

  getContent() {
    const { selectedTab, isLogined, loading, programs, loadedTab } = this.state;

    if (isLogined === false && selectedTab === "user") {
      return (
        <div className="message">
          ニコニコ動画にログインしていません．ログインしてから再度お試しください．
        </div>
      );
    }

    switch (selectedTab) {
      case "user": {
        return <UserThumbnails loading={loading} programs={programs} />;
        break;
      }
      case "official":
      case "future": {
        return <OfficialThumbnails loading={loading} programs={programs} />;
        break;
      }
      case "search": {
        return <SearchContent />;
        break;
      }
    }
  }

  render() {
    const menu = this.getMenu();
    const tabs = this.getTabs();
    const content = this.getContent();

    return (
      <div id="wrapper">
        {menu}
        <div id="tab-container">{tabs}</div>
        <div id="communities">{content}</div>
      </div>
    );
  }
}
