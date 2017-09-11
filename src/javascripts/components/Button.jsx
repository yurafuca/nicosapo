import React from 'react'
import classnames from 'classnames'
import Api from '../api/Api'
import Time from '../common/Time'
import AutoEnterEmpty from '../components/AutoEnterEmpty'
import NotificationItem from '../components/NotificationItem'
import styles from './button.css'


export default class Button extends React.Component {
  m(...args) {
    const res = {};
    args.forEach((value, i) => {
      if (args[i]) Object.assign(res, args[i]);
    });
    return res;
  }

  render() {
    const classNames = styles.button + ' ' + (this.props.isPrimary ? styles.primary : styles.normal);
    const octicon = (name) => {
      if (name == null) return;
      const className = `octicon octicon-${name}`;
      return <span className={className} style={{ marginRight: '5px' }}></span>;
    }
    const icon = octicon(this.props.octicon);
    return (
      <button className={classNames} style={this.m(this.props.style)} onClick={this.props.onClick}>
        {icon ? icon : ''}
        {this.props.text}
      </button>
      // <button style={style.button}>test</button>
    )
  }
}