import React from 'react';
import ReactDOM from 'react-dom';

export default class AutoEnterEmpty extends React.Component {
  render() {
    return (
      <div className="listgroup-item clearfix">
          <span>アイテムがありません</span>
      </div>
    );
  }
}
