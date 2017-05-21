import React from 'react';
import ReactDOM from 'react-dom';

export default class ListItem extends React.Component {
  render() {
    return (
      <div className="listgroup-item clearfix">
        <div className="list-group-text-block float-left">
          <img alt=""
            className="avatar"
            height="60"
            src={this.props.thumbnail}
            width="60" />
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
          </span><br/>
          <span className="meta-status text-small text-gray">
             {this.props.viewCounter} 来場者 · {this.props.commentCounter} コメント · {this.props.lapsedTime} 分経過
          </span>
        </div>
      </div>
    );
  }
}
