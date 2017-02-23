import $ from 'jquery';
import React from 'react'
import store from 'store';
import Thumbnail from '../components/Thumbnail';
import Common from '../common/Common';

const thumbParams = [];

export default class UserThumbnails extends React.Component {
  constructor(props) {
    super(props);
    thumbParams.length = 0;
  }

  setParams() {
    this.props.programs.forEach(($program, index) => {
      const thumbParam   = {};
      const thumbnailUrl = $program.find('community thumbnail').text();
      const startDayJpn  = $program.find('video open_time_jpstr').text().match(/\d+\/(\d+)/)[1]; // Month/Day(Date) ...
      const startDateJpn = $program.find('video open_time_jpstr').text().match(/\d+\/\d+\((.)\)/)[1];
      thumbParam.background = `url('${thumbnailUrl}')`;
      thumbParam.title      = $program.find('video title').text();
      thumbParam.id         = $program.find('video id').text();
      thumbParam.url        = `http://live.nicovideo.jp/watch/${thumbParam.id}`;
      thumbParam.isReserved = this.isReserved($program);
      thumbParam.day        = `${startDayJpn}(${startDateJpn})`;
      thumbParam.openTime   = $program.find('video open_time_jpstr').text();
      thumbParam.text       = thumbParam.title;
      thumbParam.index      = index;
      if (!thumbParam.isReserved || store.get('options.showReserved.enable') == 'enable') {
        thumbParams.push(thumbParam);
      }
    });
  }

  isReserved($program){
    const is_reserved = $($program).find('video is_reserved').text();
    return is_reserved == 'true';
  }

  render() {
    this.setParams();
    const thumbs = thumbParams.map((thumbParam) =>
      <Thumbnail
        background = {thumbParam.background}
        title      = {thumbParam.title}
        url        = {thumbParam.url}
        id         = {thumbParam.id}
        isReserved = {thumbParam.isReserved}
        text       = {thumbParam.text}
        day        = {thumbParam.day}
        openTime   = {thumbParam.openTime}
        index      = {thumbParam.index} />
    );
    return (
      <div id="container">{thumbs}</div> // TODO: delete container
    );
  }
}
