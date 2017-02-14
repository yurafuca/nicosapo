import React from 'react';
import ReactDOM from 'react-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export default class Thumbnail extends React.Component {
  getToolTip() {
    const tooltip = (
      <Tooltip id="tooltip">{[
          <span style={{fontSize: '14px'}}>
            {(() => {
              if (this.props.isReserved)
                return <span style={{color:'#adff2f'}}>{this.props.openTime}<br/></span>
            })()}
            {this.props.text}
          </span>
        ]}
      </Tooltip>
    );
    return tooltip;
  }

  render() {
    return (
      <OverlayTrigger placement="top" animation={false} overlay={this.getToolTip()}>
        <div className="community-hover-wrapper">
          <div className={"side-corner-tag " + (this.props.isReserved ? 'enabled' : 'disabled')}>
            <div className="community">
              <a href={this.props.url} target="_blank">
                <span className="comu_thumbnail" style={{backgroundImage: this.props.background}}></span>
              </a>
            </div>
            {(() => {
              if (this.props.isReserved)
                return <p>
                  <span className="reserved-message">{this.props.day}</span>
                </p>
            })()}
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
