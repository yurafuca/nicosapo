import React from 'react';
import ReactDOM from 'react-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export default class Thumbnail extends React.Component {
  render() {
    const tooltip = (
      <Tooltip id="tooltip"><strong>Holy guacamole!</strong> Check this info.</Tooltip>
    );
    const style = {
      backgroundImage: this.props.background
    }
    return (
      <OverlayTrigger placement="left" overlay={tooltip}>
        <div className="community-hover-wrapper">
          <div className={"side-corner-tag " + (this.props.isReserved ? 'enabled' : 'disabled')}>
            <div className="community">
              <a href={this.props.url} target="_blank">
                <span className="thumbnail" style={style}></span>
              </a>
            </div>
            <p>
              <span className="reserved-message">{this.props.day}</span>
            </p>
          </div>
        </div>
      </OverlayTrigger>
    );
  }
}

ReactDOM.render(
  <Thumbnail />,
  document.getElementById('communities')
);
