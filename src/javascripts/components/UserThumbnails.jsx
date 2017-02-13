import React from 'react'
import ReactDOM from 'react-dom';
import { Tooltip } from 'react-bootstrap';
import Thumbnail from '../components/Thumbnail';

const params = {};

export default class UserThumbnails extends React.Component {
  setParams() {
    const $program = this.props.programs;

    this.params.background = `url('${$program.find('community thumbnail').text()}'`;
    this.params.title = $program.find('video title').text();
    this.params.id = $program.find('video id').text();
    this.params.url = `http://live.nicovideo.jp/watch/${id}`;
    this.params.isReserved = isReserved($program);

    const startDayJpn = program.find('video open_time_jpstr').text().match(/\d+\/(\d+)/)[1]; // Month/Day(Date) ...
    const startDateJpn = program.find('video open_time_jpstr').text().match(/\d+\/\d+\((.)\)/)[1];
    this.params.day = `${startDayJpn}(${startDateJpn})`;

    const wrappedTitle = Common.wordWrap(this.state.title, charPerLine);
    const startTimeInfo = `
      &lt;span style="color:#adff2f"&gt;
        ${program.find('video open_time_jpstr').text()}
      &lt;/span&gt;&lt;br&gt;
    `;
    this.params.text = startTimeInfo + tooltipText;
  }

  isReserved($program){
    const is_reserved = $($info).find('video is_reserved').text();
    return is_reserved == 'true';
  }

  render() {
    console.info(this.params.background);
    const thumbs = this.state.programs.map(program => {
      return <Thumbnail
        background={this.params.background}
        title={this.params.title}
        url={this.params.url}
        id={this.params.id}
        isReserved={this.params.isReserved}
        tooltip={this.params.tooltip}
        day={this.params.day}
        index={this.params.index} />
    });
    return (
      <div id="container">{thumbs}</div>
    );
  }
}
