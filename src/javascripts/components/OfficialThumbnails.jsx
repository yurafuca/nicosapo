import $ from 'jquery';
import React from 'react'
import ReactDOM from 'react-dom';
import { Tooltip } from 'react-bootstrap';
import Thumbnail from '../components/Thumbnail';

const thumbParams = [];

export default class OfficialThumbnails extends React.Component {
  setParams() {
    const programs = this.props.programs;
    console.info(programs);
    programs.forEach((program, index) => {
      const $program = $(program);
      const thumbParam = {};
      const communityId = $program.find('.video_text a').attr('href');
      const regexp = /http\:\/\/ch.nicovideo.jp\/channel\/(.+)/;
      const resultarr = regexp.exec(communityId);
      let thumbnailTmp = undefined;
      if (resultarr != null) {
        thumbnailTmp = `http://icon.nimg.jp/channel/${resultarr[1]}.jpg`;
      } else {
        thumbnailTmp = $program.find('.info a img').attr('src');
      }
      thumbParam.background = `url('${thumbnailTmp}')`;
      thumbParam.title = $program.find('.video_title').text();
      thumbParam.id = `lv${$program.find('.video_id').text()}`;
      thumbParam.url = `http://live.nicovideo.jp/watch/${thumbParam.id}`;
      thumbParam.text = thumbParam.title;
      thumbParam.index = index;
      thumbParams.push(thumbParam);
    });
  }

  render() {
    this.setParams();
    const thumbs = thumbParams.map(thumbParam => {
      return <Thumbnail
        background={thumbParam.background}
        title={thumbParam.title}
        url={thumbParam.url}
        id={thumbParam.id}
        text={thumbParam.text}
        index={thumbParam.index} />
    });
    return (
      <div id="container">{thumbs}</div>
    );
  }
}
