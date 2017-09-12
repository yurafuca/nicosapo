import React from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'

export default class Thumbnail extends React.Component {
  constructor(props) {
    super(props);
    this.state = props;
  }

  componentDidMount() {
    if (this.props.preload) this.refs.dummyTooltip.show();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ nextProps });
  }


  render() {
    const info = this.state.openTime ? <span style={{ color: '#adff2f' }}>{this.state.openTime}<br /></span> : '';
    const tooltip = <Tooltip id="tooltip"><span style={{fontSize: '14px'}}>{info}{this.state.text}</span></Tooltip>;
    const dummyTooltip = <Tooltip id="dummy-tooltip">dummy</Tooltip>;
    return (
      <div className="community-hover-wrapper" id={this.props.id} >
        <OverlayTrigger placement="top" animation={false} overlay={tooltip}>
          <div className={"side-corner-tag " + (this.state.isReserved ? 'enabled' : 'disabled')}>
            <div className="community">
              <a href={this.state.url} target="_blank">
                <span className="comu_thumbnail" style={{ backgroundImage: this.state.background }}></span>
              </a>
            </div>
            {
              this.state.isReserved
                ? <p><span className="reserved-message">{this.state.day}</span></p>
                : ''
            }
          </div>
        </OverlayTrigger>
        {this.props.preload &&
          <OverlayTrigger ref="dummyTooltip" placement="top" animation={false} overlay={dummyTooltip}>
            <div></div>
          </OverlayTrigger>
        }
      </div>
    );
  }
}

// ReactDOM.render(
//   <Thumbnail />,
//   document.getElementById('communities')
// );
