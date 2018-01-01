import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default class Thumbnail extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (this.props.preload) this.refs.dummyTooltip.show();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ nextProps });
  }

  render() {
    const info = this.props.openTime ? (
      <span style={{ color: "#adff2f" }}>
        {this.props.openTime}
        <br />
      </span>
    ) : (
      ""
    );
    const tooltip = (
      <Tooltip id="tooltip">
        <span style={{ fontSize: "14px" }}>
          {info}
          {this.props.text}
        </span>
      </Tooltip>
    );
    const dummyTooltip = <Tooltip id="dummy-tooltip">dummy</Tooltip>;
    return (
      <div className="community-hover-wrapper" id={this.props.id}>
        <OverlayTrigger placement="top" animation={false} overlay={tooltip}>
          <div
            className={
              "side-corner-tag " +
              (this.props.isReserved ? "enabled" : "disabled")
            }
          >
            <div className="community">
              <a href={this.props.url} target="_blank">
                <span
                  className="comu_thumbnail"
                  style={{ backgroundImage: this.props.background }}
                />
              </a>
            </div>
            {this.props.isReserved ? (
              <p>
                <span className="reserved-message">{this.props.day}</span>
              </p>
            ) : (
              ""
            )}
          </div>
        </OverlayTrigger>
        {this.props.preload && (
          <OverlayTrigger
            ref="dummyTooltip"
            placement="top"
            animation={false}
            overlay={dummyTooltip}
          >
            <div />
          </OverlayTrigger>
        )}
      </div>
    );
  }
}

// ReactDOM.render(
//   <Thumbnail />,
//   document.getElementById('communities')
// );
