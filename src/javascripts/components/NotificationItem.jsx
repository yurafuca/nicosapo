import React from 'react';
import ReactDOM from 'react-dom';

export default class NotificationItem extends React.Component {
  render() {
    return (
      <div className="listgroup-item card-style">
        <div className="nudge-down BtnGroup float-right">
          <div className="form-switcher">
            <input type="checkbox" name={this.props.name} id={this.props.name} data-id={this.props.id} onClick={this.props.onClick} checked={this.props.isExcluded}></input>
              <label className="switcher" htmlFor={this.props.name}></label>
          </div>
        </div>
        <div className="list-group-text-block float-left">
          <img alt=""
            className="avatar"
            height="55"
            src={this.props.thumbnail}
            width="55" />
          <span className="meta-title">
            <a href=""
              target="_blank"
              className="developer-app-name"
              href={this.props.url}>
              {this.props.title}
            </a>
          </span>
          <span className="octicon octicon-location text-vividgray" color="red"></span>
          <span className="meta-description text-small text-gray">
            {this.props.id}
          </span>
        </div>
      </div>
    );
  }
}
