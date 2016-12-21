import React, {Component} from 'react'

export default class Counter extends Component {
    constructor() {
        super();
        this.state = {
            count: 0
        }
    }

    handleClick() {
        this.setState({
            count: this.state.count + 2
        });
    }

    render() {
        return (
            <div>
                Count: {this.state.count}
                <button onClick={this.handleClick.bind(this)}>increment</button>
            </div>
        );
    }
}
