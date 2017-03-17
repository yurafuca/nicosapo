import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export default class Thumbnail extends React.Component {
  constructor(props) {
    super(props);
    this.state = props;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ nextProps });
  }

  getToolTip() {
    const tooltip = (
      <Tooltip id="tooltip">{[
          <span style={{fontSize: '14px'}}>
            {
              this.state.openTime
                ? <span style={{color:'#adff2f'}}>{this.state.openTime}<br/></span>
                : ''
            }
            {this.state.text}
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
          <div className={"side-corner-tag " + (this.state.isReserved ? 'enabled' : 'disabled')}>
            <div className="community">
              <a href={this.state.url} target="_blank">
                <span className="comu_thumbnail" style={{backgroundImage: this.state.background}}></span>
              </a>
            </div>
              {
                this.state.isReserved
                  ? <p><span className="reserved-message">{this.state.day}</span></p>
                  : ''
              }
          </div>
        </div>
      </OverlayTrigger>
    );
  }
}

// ReactDOM.render(
//   <Thumbnail />,
//   document.getElementById('communities')
// );
