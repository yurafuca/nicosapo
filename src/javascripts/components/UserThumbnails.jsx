import $ from 'jquery';
import React from 'react'
import ReactDOM from 'react-dom';
import { Tooltip } from 'react-bootstrap';
import Thumbnail from '../components/Thumbnail';

const thumbParams = [];

export default class UserThumbnails extends React.Component {
  constructor(props) {
    super(props);
    thumbParams.length = 0;
  }

  componentWillUpdate() {
    console.log("componentWillUpdate");
  }

  setParams() {
    const programs = this.props.programs;
    programs.forEach(($program, index) => {
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
      thumbParam.openTime = $program.find('video open_time_jpstr').text();
      thumbParam.text = thumbParam.title;
      thumbParam.index = index;
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
        text={thumbParam.text}
        day={thumbParam.day}
        openTime={thumbParam.openTime}
        index={thumbParam.index} />
    });
    return (
      <div id="container">{thumbs}</div>
    );
  }
}
