import blacklist from 'blacklist';
import React from 'react';

let _isMounted;

export default class Blink extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.getInitialState();
	}

	getInitialState() {
		return { visible: true };
	}

	blink () {
		if (!_isMounted) {
			return;
		}
		this.setState({ visible: !this.state.visible });
		setTimeout(this.blink.bind(this), 400);
	}

	componentDidMount () {
		_isMounted = true;
		this.blink();
	}

	componentWillUnmount() {
		_isMounted = false;
	}

	render () {
		const props = blacklist(this.props, 'children', 'duration');
		props.style = { visibility: this.state.visible ? 'visible' : 'hidden' };
		return (
			<span style={props.style}>{this.props.children}</span>
		);
	}
}
