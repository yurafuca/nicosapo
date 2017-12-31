import React from 'react';
import Time from '../common/Time';
import AutoEnterItem from '../components/AutoEnterItem';
import AutoEnterEmpty from '../components/AutoEnterEmpty';

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
      'community': 'autoEnterCommunityList',
      'program':   'autoEnterProgramList'
    };
    chrome.runtime.sendMessage({
        purpose: 'getFromNestedLocalStorage',
        key: keyList[this.props.type]
      }, (response) => {
        const itemParams = [];
        const keysArray = Object.keys(response);
        keysArray.forEach((id, index) => {
          const itemParam = {};
          let description;
          if (this.props.type === 'community') {
            description = response[id]['owner'];
          } else {
            description = `開場時刻: ${Time.toJpnString(Date.parse(response[id]['openDate']))}`;
            if (Date.parse(response[id]['openDate']) < Date.now()) {
              description += '<span class="ended"> ⛔ この番組は終了しました</span>';
            }
          }
          itemParam.id          = id;
          itemParam.type        = this.props.type;
          itemParam.onClick     = this.onClick;
          itemParam.thumbnail   = response[id]['thumbnail'];
          itemParam.title       = response[id]['title'];
          itemParam.description = description;
          switch(this.props.type) {
            case `community`:
              itemParam.url     = `http://com.nicovideo.jp/community/${id}`;
              break;
            case `program`:
              itemParam.url     = `http://live.nicovideo.jp/gate/${id}`;
              break;
            default:
              itemParam.url     = `InvalidItemParam`;
              break;
          }
          itemParams.push(itemParam);
          if (index === keysArray.length - 1) {
            this.setState({ 'itemParams': itemParams });
          }
        });
    });
  }

  onClick(id) {
    this.deleteItem(id);
  }

  deleteItem(id) {
    const keys = {
      community: 'autoEnterCommunityList',
      program:   'autoEnterProgramList'
    }
    chrome.runtime.sendMessage({
      purpose: 'removeFromNestedLocalStorage',
      key: keys[this.props.type],
      innerKey: id
    });
    const itemParams = itemParams.filter((param) => param.id != id );
    this.setState({ 'itemParams': itemParams });
  }

  render() {
    let items = this.state.itemParams.map((itemParam) =>
      <AutoEnterItem
        id          = {itemParam.id}
        type        = {itemParam.type}
        onClick     = {itemParam.onClick}
        thumbnail   = {itemParam.thumbnail}
        url         = {itemParam.url}
        title       = {itemParam.title}
        description = {itemParam.description} />
    );
    if (this.state.itemParams.length === 0) {
      items = <AutoEnterEmpty />
    }
    return (
      <div>{items}</div>
    )
  }
}
