import React from 'react';
import ReactDOM from 'react-dom';

export default class ListItem extends React.Component {
  render() {
    return (
      <div className="listgroup-item clearfix">
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
