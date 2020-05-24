import React from "react";
import scrollMonitor from "scrollMonitor";
import Api from "../api/Api";
import Common from "../common/Common";
import AutoEnterEmpty from "../components/AutoEnterEmpty";
import NotificationItem from "../components/NotificationItem";
import Button from "../components/Button";

export default class NotificationList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      communities: [],
      excluded: {},
      loading: false,
      currentCursor: null,
      loadComplete: false
    };
    this.toggle = this.toggle.bind(this);
    this.excludeAll = this.excludeAll.bind(this);
    this.includeAll = this.includeAll.bind(this);
    this.saveAll = this.saveAll.bind(this);
    this.saveAllTemporarily = this.saveAllTemporarily.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.loadAll = this.loadAll.bind(this);

    this.cloneExcludedDistributors().then(() => {
      this.setParams();
    });
  }

  cloneExcludedDistributors() {
    return new Promise(resolve => {
      const request = { purpose: `get`, key: `excludedDistributors` };
      chrome.runtime.sendMessage(request, communities => {
        this.setState({ excluded: communities || {} }, resolve);
      });
    });
  }

  resetWatcher() {
    if (this.watcher) this.watcher.destroy();
    this.watcher = scrollMonitor.create(document.getElementById(`spinner`));
    this.watcher.enterViewport(() => {
      if (this.state.loadComplete) return;
      this.setState({ loading: true }, () => {
        this.loadMore().then(() => {
          this.setState({ loading: false });
        });
      });
    });
  }

  setParams(cursor = null) {
    return new Promise(resolve => {
      Api.getFollowingCommunities(cursor).then(result => {
        const cursor = result.cursor;
        const communities = result.items;

        if (communities.length == 0) {
          this.setState({ loadComplete: true });
          resolve();
          return;
        }
        communities.forEach(community => {
          community.isExcluded = this.state.excluded.hasOwnProperty(
            community.id
          );
          this.state.communities.push(community);
        });
        this.setState({ communities: this.state.communities }, () => {
          this.resetWatcher();
          this.setState({ currentCursor: cursor }, resolve);
        });
      });
    });
  }

  toggle(e) {
    const id = e.currentTarget.getAttribute("data-id");
    const index = this.state.communities.findIndex(e => e.id == id);
    const community = this.state.communities[index];
    community.isExcluded = !community.isExcluded;
    this.setState(
      { communities: this.state.communities },
      this.saveAllTemporarily
    );
  }

  excludeAll() {
    this.loadAll().then(() => {
      const communities = this.state.communities;
      communities.forEach(e => (e.isExcluded = true));
      this.setState({ communities: communities }, this.saveAllTemporarily);
    });
  }

  includeAll() {
    this.loadAll().then(() => {
      const communities = this.state.communities;
      communities.forEach(e => (e.isExcluded = false));
      this.setState({ communities: communities }, this.saveAllTemporarily);
    });
  }

  saveAllTemporarily() {
    const communities = this.state.excluded;
    this.state.communities.forEach(community => {
      const id = community.id;
      if (!community.isExcluded) {
        if (communities[id] != null) delete communities[id];
      } else {
        if (communities[id] == null) communities[id] = community;
      }
    });
  }

  saveAll() {
    const communities = Object.assign({}, this.state.excluded);
    chrome.runtime.sendMessage(
      { purpose: `save`, key: `excludedDistributors`, value: communities },
      () => {
        this.setState({ message: `設定を保存しました．` }, () => {
          setTimeout(() => this.setState({ message: null }), 1000);
        });
      }
    );
  }

  loadMore() {
    return new Promise(resolve => {
      // 負荷対策
      Common.sleep(500).then(() => {
        this.setParams(this.state.currentCursor).then(resolve);
      });
    });
  }

  loadAll() {
    return new Promise(resolve => {
      if (this.state.loadComplete) {
        resolve();
        return;
      }
      this.setState({ loading: true }, () => {
        const loadRoutine = () => {
          if (!this.state.loadComplete) {
            this.loadMore().then(loadRoutine);
          } else {
            this.setState({ loading: false });
            resolve();
          }
        };
        loadRoutine();
      });
    });
  }

  render() {
    let items = this.state.communities.map(community => (
      <NotificationItem
        name={`switcher-lg-` + community.id}
        key={community.id}
        id={community.id}
        type={community.type}
        onChange={this.toggle}
        thumbnail={community.thumbnail}
        url={community.url}
        title={community.title}
        description={community.description}
        isExcluded={community.isExcluded}
      />
    ));
    if (this.state.communities.length === 0) {
      items = <AutoEnterEmpty />;
    } else {
      const message = this.state.loadComplete
        ? "すべてのコミュニティを読み込みました．"
        : "";
      const classes = `spinner ` + (this.state.loading ? `loading` : `standby`);
      const spinner = (
        <div>
          <div id="spinner" className={this.state.loadComplete ? "" : "spinner"}>
          <div className="dot-wrapper wrapper1">
            <div className="dot"></div>
          </div>
          <div className="dot-wrapper wrapper2">
            <div className="dot"></div>
          </div>
          <div className="dot-wrapper wrapper3">
            <div className="dot"></div>
          </div>
          <div className="dot-wrapper wrapper4">
            <div className="dot"></div>
          </div>
        </div>
        {message}
      </div>
      );
      items.push(spinner);
    }
    const status = this.state.loading ? (
      <div>
        <span>
          コミュニティを読み込んでいます．しばらくお待ちください...（{
            this.state.currentCursor
          }
        </span>
      </div>
    ) : (
      ""
    );
    return (
      <div>
        <div>
          <p
            style={{
              marginBottom: "2px",
              fontSize: "12px",
              marginTop: "10px",
              color: `#767676`
            }}
          >
            通知を表示するコミュニティを個別に設定します．「基本設定 >
            自動枠移動・自動入場 > 通知を放送開始時に表示する」
            の設定が優先されます．チャンネルの個別設定には対応していません．
          </p>
        </div>
        <div style={{ marginTop: "15px", marginBottom: "10px" }}>
          <Button
            id="save"
            onClick={this.saveAll}
            isPrimary={true}
            style={{ marginLeft: "10px" }}
            text="設定を保存する"
          />
          <Button
            id="exclude-all"
            onClick={this.excludeAll}
            isPrimary={false}
            style={{ marginLeft: "15px", float: "right" }}
            octicon="diff-removed"
            text="すべて無効にする"
          />
          <Button
            id="include-all"
            onClick={this.includeAll}
            isPrimary={false}
            style={{ marginLeft: "15px", float: "right" }}
            octicon="diff-modified"
            text="すべて有効にする"
          />
        </div>
        <div style={{ color: `#24963e` }}>{this.state.message}</div>
        {status}
        {items}
      </div>
    );
  }
}
