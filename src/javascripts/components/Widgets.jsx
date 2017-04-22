import React from 'react';
import ReactDOM from 'react-dom';
import ExBar from '../components/ExBar';
import NewCastChecker from '../modules/NewCastChecker';
import AutoRedirectButton from '../buttons/AutoRedirectButton';
import AutoEnterCommunityButton from '../buttons/AutoEnterCommunityButton';

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
    this.state = { response: '' };
    _newCastChecker.setProlongReceiver(this._prolongReceiver.bind(this));
    _newCastChecker.run();
  }

  putButtons() {
    const parent = this.props.element4Buttons;
    const child = document.createElement('div');
    child.id = 'nicosapo_buttons';
    switch(this.props.position) {
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
      buttonDoms.push(<AutoRedirectButton notify={this._recieveNotify} />)
    }
    if (this.props.enableACButton) {
      buttonDoms.push(<AutoEnterCommunityButton />)
    }
    if (this.props.enableAPButton) {
      buttonDoms.push(<AutoEnterProgramButton />)
    }
    let wrapper = null;
    if (this.props.requireInline) {
      wrapper = <div style={{display: 'inline-block'}}>{buttonDoms}</div>;
    } else {
      wrapper = <div>{buttonDoms}</div>;
    }
    return(wrapper);
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
    const exBar = (this.props.enableExBar) ? <ExBar response={this.state.response}/> : null;
    return(exBar);
  }
}
