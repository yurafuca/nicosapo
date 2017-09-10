import React from 'react'
import Api from '../api/Api'
import Time from '../common/Time'
import AutoEnterEmpty from '../components/AutoEnterEmpty'
import NotificationItem from '../components/NotificationItem'
import Button from '../components/Button'

export default class NotificationList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { itemParams: [], communities: [] };
    this.setParams();
    this.onClick = this.onClick.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
  }

  setParams() {
    Api.getFollowingCommunities().then((communities) => {
      const itemParams = [];
      const request = { purpose: `get`, key: `excludedDistributors` };
      chrome.runtime.sendMessage(request, (response) => {
        response = {};
        communities.forEach((community) => {
          const itemParam = {
            id:          community.id,
            type:        `notification`,
            thumbnail:   community.thumbnail,
            url:         community.url,
            title:       community.title,
            description: ``,
            isExcluded:  response.hasOwnProperty(community.id)
          };
          itemParams.push(itemParam);
        });
        this.setState({ itemParams: itemParams, communities: communities });
      });
    });
  }

  onClick(e) {
    const id = e.currentTarget.getAttribute('data-id');
    this.deleteItem(id);
  }

  deleteItem(id) {
    const isTargetCommunity = (e) => e.id == id;
    const i = this.state.communities.findIndex(isTargetCommunity);
    const community = this.state.itemParams[i];
    community.isExcluded = !community.isExcluded;
    this.setState({ 'itemParams': this.state.itemParams, communities: this.state.communities });

    chrome.runtime.sendMessage({ purpose: `get`, key: `excludedDistributors` }, (res) => {
      if (res == null) res = {};
      if (!community.isExcluded) {
        if (res[id] != null) delete res[id];
      } else {
        if (res[id] == null) res[id] = community;
      }
      chrome.runtime.sendMessage({ purpose: `save`, key: `excludedDistributors`, value: res });
    });
  }

  render() {
    let items = this.state.itemParams.map((itemParam) =>
      <NotificationItem
        name        = { `switcher-lg-` + itemParam.id }
        key         = { itemParam.id }
        id          = { itemParam.id }
        type        = { itemParam.type }
        onClick     = { this.onClick }
        thumbnail   = { itemParam.thumbnail }
        url         = { itemParam.url }
        title       = { itemParam.title }
        description = { itemParam.description }
        isExcluded  = { itemParam.isExcluded } />
    );
    if (this.state.itemParams.length === 0) {
      items = <AutoEnterEmpty />
    }
    return (
      <div>
        <div style={{ 'marginTop': '15px', 'marginBottom': '10px' }}>
          <Button isPrimary={true}  style={{ 'marginLeft': '10px' }} text="設定を保存する" />
          <Button isPrimary={false} style={{ 'marginLeft': '15px', 'float': 'right' }} text="すべて無効にする" />
          <Button isPrimary={false} style={{ 'marginLeft': '15px', 'float': 'right' }} text="すべて有効にする" />
        </div>
        {items}
      </div>
    )
  }
}
