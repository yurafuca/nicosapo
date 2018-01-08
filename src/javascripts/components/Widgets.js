import React from "react";
import ReactDOM from "react-dom";
import ExBar from "../components/ExBar";
import NewCastChecker from "../modules/NewCastChecker";
import AutoScrollButton from "../buttons/AutoScrollButton";
import AutoRedirectButton from "../buttons/AutoRedirectButton";
import AutoEnterCommunityButton from "../buttons/AutoEnterCommunityButton";
import AutoEnterProgramButton from "../buttons/AutoEnterProgramButton";

const _newCastChecker = new NewCastChecker();

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function prependChild(newNode, parentNode) {
  parentNode.insertBefore(newNode, parentNode.firstChild);
}

export default class Widgets extends React.Component {
  constructor(props) {
    super(props);
    this.state = { response: "" };
  }

  putButtons() {
    /**
     * MESSAGE
     */
    if (this.props.buttonOrder === `MESSAGE`) {
      const child = document.createElement("span");
      child.textContent = this.props.message;
      child.style.whiteSpace = "nowrap";
      child.style.fontSize = "12px";
      child.style.color = "#777";
      // this.props.element4Buttons.appendChild(child);
      insertAfter(child, this.props.element4Buttons);
      return;
    }
    /**
     * DEFAULT
     */
    const parent = this.props.element4Buttons;
    const child = document.createElement("div");
    child.id = "nicosapo_buttons";
    switch (this.props.position) {
      case `APPEND`:
        parent.appendChild(child);
        break;
      case `PREPEND`:
        prependChild(child, parent);
        break;
      case `AFTER`:
        insertAfter(child, parent);
        break;
      case `BEFORE`:
        // Not supported.
        break;
    }
    const reactDom = this._getButtons();
    ReactDOM.render(reactDom, child);
  }

  _getButtons() {
    const buttonDoms = [];
    if (this.props.enableARButton) {
      _newCastChecker.setProlongReceiver(this._prolongReceiver.bind(this)); // TODO: ugly
      _newCastChecker.run(); // TODO: ugly
      buttonDoms.push(<AutoScrollButton />);
      buttonDoms.push(<AutoRedirectButton notify={this._recieveNotify} />);
    }
    if (this.props.enableACButton) {
      buttonDoms.push(<AutoEnterCommunityButton />);
    }
    if (this.props.enableAPButton) {
      buttonDoms.push(<AutoEnterProgramButton />);
    }
    let wrapper = null;
    if (this.props.requireInline) {
      wrapper = <div style={{ display: "inline-block" }}>{buttonDoms}</div>;
    } else {
      wrapper = <div>{buttonDoms}</div>;
    }
    return wrapper;
  }

  _prolongReceiver(response) {
    this.setState({ response: response });
  }

  _recieveNotify(isToggledOn) {
    _newCastChecker.setMode(isToggledOn);
  }

  componentDidMount() {
    this.putButtons();
  }

  render() {
    const exBar = this.props.enableExBar ? (
      <ExBar response={this.state.response} />
    ) : null;
    return exBar;
  }
}
