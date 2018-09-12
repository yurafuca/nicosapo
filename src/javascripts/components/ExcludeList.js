import React from "react";
import Time from "../common/Time";
import BroadcastItem from "./BroadcastItem";
import AutoEnterEmpty from "../components/AutoEnterEmpty";
import Api from "../api/Api";
import store from "store";

export default class ExcludeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { itemParams: [] };
    this.setParams();
    this.onClick = this.onClick.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
  }

  setParams() {
    chrome.runtime.sendMessage(
      {
        purpose: "getFromLocalStorage",
        key: "search.item.exclude"
      },
      response => {
        const distributorIdList = response.map(item => item.id);
        Api.fetchCommunityStatistics(distributorIdList)
          .then(communities => {
            const itemParams = [];
            communities.forEach(community => {
              const id = community.global_id[0];
              const thumbnail = community.thumbnail[0];
              const name = community.name[0];
              const communityInResponse = response.find(item => item.id === id);
              const itemParam = [];
              itemParam.id = id;
              itemParam.url = `http://com.nicovideo.jp/community/${id}`;
              itemParam.onClick = this.onClick;
              itemParam.thumbnail = thumbnail;
              itemParam.title = name;
              itemParam.description = id;
              itemParam.keyword = communityInResponse.keyword;
              itemParam.type = "exclude";
              itemParams.push(itemParam);
            });
            this.setState({ itemParams: itemParams });
          });
      }
    );
  }

  onClick(id) {
    this.deleteItem(id);
  }

  deleteItem(id) {
    chrome.runtime.sendMessage(
      {
        purpose: "getFromLocalStorage",
        key: "search.item.exclude"
      },
      response => {
        const removed = response.filter(item => item.id !== id);
        chrome.runtime.sendMessage(
          {
            purpose: "saveToLocalStorage",
            key: "search.item.exclude",
            value: removed
          });
        this.setParams();
      }
    );
  }

  render() {
    let items = this.state.itemParams.map(itemParam => (
      <BroadcastItem
        id={itemParam.id}
        type={itemParam.type}
        onClick={itemParam.onClick}
        thumbnail={itemParam.thumbnail}
        url={itemParam.url}
        title={itemParam.title}
        description={itemParam.description}
        openDate={itemParam.openDate}
        keyword={itemParam.keyword}
        messageForEmpty={"この番組は終了しました"}
      />
    ));
    if (this.state.itemParams.length === 0) {
      items = <AutoEnterEmpty />;
    }
    return <div>{items}</div>;
  }
}
