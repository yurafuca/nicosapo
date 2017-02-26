import React from 'react';
import NewCastChecker from '../modules/NewCastChecker';
import ExBar from '../components/ExBar';

const _newCastChecker = new NewCastChecker();

/**
 * ExBar と NewCastChecker をまとめて管理する．
 * 将来的には Button も管理対象にするかもしれない．
 * @author tsuyuno
 */
export default class Gadgets extends React.Component {
  constructor(props) {
    super(props);
    this.state = { response: '' };
    _newCastChecker.setProlongReceiver(this.prolongReceiver.bind(this));
    _newCastChecker.run();
  }

  prolongReceiver(response) {
    this.setState({ response: response });
  }

  render() {
    return(
      <ExBar response={this.state.response}/>
    )
  }
}
