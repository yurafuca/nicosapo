import $ from 'jquery';
import React from 'react'
import ReactDOM from 'react-dom';
import { Tooltip } from 'react-bootstrap';
import Thumbnail from '../components/Thumbnail';
import Common from "../common/Common";

const thumbParams = [];

export default class UserThumbnails extends React.Component {
  setParams() {
    console.info(this.props.programs);
    const programs = this.props.programs;
    // for (const $program in programs) {
    programs.forEach(($program) => {
      console.info($program);
      const thumbParam = {};
      const thumbnailUrl = $program.find('community thumbnail').text();
      thumbParam.background = `url('${thumbnailUrl}')`;
      thumbParam.title = $program.find('video title').text();
      thumbParam.id = $program.find('video id').text();
      thumbParam.url = `http://live.nicovideo.jp/watch/${thumbParam.id}`;
      thumbParam.isReserved = this.isReserved($program);
      const startDayJpn = $program.find('video open_time_jpstr').text().match(/\d+\/(\d+)/)[1]; // Month/Day(Date) ...
      const startDateJpn = $program.find('video open_time_jpstr').text().match(/\d+\/\d+\((.)\)/)[1];
      thumbParam.day = `${startDayJpn}(${startDateJpn})`;
      const wrappedTitle = Common.wordWrap(thumbParam.title, 16);
      const startTimeInfo = `
        &lt;span style="color:#adff2f"&gt;
          ${$program.find('video open_time_jpstr').text()}
        &lt;/span&gt;&lt;br&gt;
      `;
      thumbParam.text = startTimeInfo + wrappedTitle;
      thumbParams.push(thumbParam);
    });
  }

  isReserved($program){
    const is_reserved = $($program).find('video is_reserved').text();
    return is_reserved == 'true';
  }

  render() {
    this.setParams();
    const thumbs = thumbParams.map(thumbParam => {
      return <Thumbnail
        background={thumbParam.background}
        title={thumbParam.title}
        url={thumbParam.url}
        id={thumbParam.id}
        isReserved={thumbParam.isReserved}
        tooltip={thumbParam.tooltip}
        day={thumbParam.day}
        index={thumbParam.index} />
    });
    return (
      <div id="container">{thumbs}</div>
    );
  }
}
