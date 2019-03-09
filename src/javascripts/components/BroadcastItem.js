import React from "react";
import ReactDOM from "react-dom";

export default class BroadcastItem extends React.Component {
  description() {
    if (this.props.type === "community" || this.props.type === "program") {
      if (Date.parse(this.props.openDate) < Date.now()) {
        return (
          <span>
          <span className="ended"> {this.props.messageForEmpty}</span>
            {this.props.description}
        </span>
        );
      } else {
        return this.props.description;
      }
    } else if (this.props.type === "exclude") {
      return `登録したときのキーワード：${this.props.keyword}`;
    }
  }

  render() {
    console.log(this.props);
    return (
      <div className="listgroup-item clearfix" key={this.props.id}>
        <div className="nudge-down BtnGroup float-right">
          <span
            href=""
            className="btn btn-sm btn-danger BtnGroup-item"
            rel="facebox"
            data-id={this.props.id}
            data-type={this.props.type}
            onClick={this.props.onClick.bind(this, this.props.id)}
          >
            削除
          </span>
        </div>
        <div className="list-group-text-block float-left">
          <img
            alt=""
            className="avatar"
            height="40"
            src={this.props.thumbnail}
            width="40"
          />
          <span className="meta-title">
            <a
              href=""
              target="_blank"
              className="developer-app-name"
              href={this.props.url}
            >
              {this.props.title}
            </a>
          </span>
          <span className="meta-description text-small text-gray">
            {this.description()}
          </span>
        </div>
      </div>
    );
  }
}
