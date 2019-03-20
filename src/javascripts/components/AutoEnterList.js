import React from "react";
import Time from "../common/Time";
import BroadcastItem from "./BroadcastItem";
import AutoEnterEmpty from "../components/AutoEnterEmpty";

export default class AutoEnterList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { itemParams: [] };
    this.setParams();
    this.onClick = this.onClick.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
  }

  setParams() {
    const keyList = {
      community: "autoEnterCommunityList",
      program: "autoEnterProgramList"
    };
    chrome.runtime.sendMessage(
      {
        purpose: "getFromNestedLocalStorage",
        key: keyList[this.props.type]
      },
      response => {
        const itemParams = [];
        const keys = Object.keys(response);
        keys.forEach((id, index) => {
          const itemParam = {};
          let description;
          if (this.props.type === "community") {
            description = response[id]["owner"];
          } else {
            description = `開場時刻: ${Time.toJpnString(
              Date.parse(response[id]["openDate"])
            )}`;
          }
          itemParam.id = id;
          itemParam.type = this.props.type;
          itemParam.onClick = this.onClick;
          itemParam.thumbnail = response[id]["thumbnail"];
          itemParam.title = response[id]["title"];
          itemParam.description = description;
          itemParam.openDate = response[id]["openDate"];
          switch (this.props.type) {
            case `community`:
              itemParam.url = `https://com.nicovideo.jp/community/${id}`;
              break;
            case `program`:
              itemParam.url = `https://live.nicovideo.jp/gate/${id}`;
              break;
            default:
              itemParam.url = `InvalidItemParam`;
              break;
          }
          itemParams.push(itemParam);
          if (index === keys.length - 1) {
            this.setState({ itemParams: itemParams });
          }
        });
      }
    );
  }

  onClick(id) {
    this.deleteItem(id);
  }

  deleteItem(id) {
    const keys = {
      community: "autoEnterCommunityList",
      program: "autoEnterProgramList"
    };
    chrome.runtime.sendMessage({
      purpose: "removeFromNestedLocalStorage",
      key: keys[this.props.type],
      innerKey: id,
      innerValue: {
        communityId: id // FiXME: communityId will be programId if this type is 'autoEnterProgramList'.
      }
    });
    const itemParams = this.state.itemParams.filter(param => param.id != id);
    this.setState({ itemParams: itemParams });
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
        messageForEmpty={"この番組は終了しました"}
      />
    ));
    if (this.state.itemParams.length === 0) {
      items = <AutoEnterEmpty />;
    }
    return <div>{items}</div>;
  }
}
