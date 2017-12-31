import React from 'react';
import ReactDOM from 'react-dom';

export default class AutoEnterItem extends React.Component {
  render() {
    return (
      <div className="listgroup-item clearfix">
        <div className="nudge-down BtnGroup float-right">
          <a href=""
            className="btn btn-sm btn-danger BtnGroup-item"
            rel="facebox"
            data-id={this.props.id}
            data-type={this.props.type}
            onClick={this.props.onClick.bind(this, this.props.id)}>
            削除
          </a>
        </div>
        <div className="list-group-text-block float-left">
          <img alt=""
            className="avatar"
            height="40"
            src={this.props.thumbnail}
            width="40" />
          <span className="meta-title">
            <a href=""
              target="_blank"
              className="developer-app-name"
              href={this.props.url}>
              {this.props.title}
            </a>
          </span>
          <span className="meta-description text-small text-gray">
            {this.props.description}
          </span>
        </div>
      </div>
    );
  }
}
