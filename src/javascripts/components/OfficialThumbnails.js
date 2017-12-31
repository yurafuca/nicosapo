import $ from "jquery";
import React from "react";
import Thumbnail from "../components/Thumbnail";

export default class OfficialThumbnails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      programs: props.programs || [],
      thumbParams: []
    };
  }

  componentDidMount() {
    this.setParams();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ programs: nextProps.programs }, this.setParams);
  }

  setParams() {
    if (this.state.programs == null) {
      this.setState({ thumbParams: [] });
      return;
    }
    const thumbParams = [];
    this.state.programs.forEach((program, index) => {
      const thumbParam = {};
      const $program = $(program);
      const communityId = $program.find(".video_text a").attr("href");
      const regexp = /http\:\/\/ch.nicovideo.jp\/channel\/(.+)/;
      const resultarr = regexp.exec(communityId);
      let thumbnailUrl;
      if (resultarr != null) {
        thumbnailUrl = `http://icon.nimg.jp/channel/${resultarr[1]}.jpg`;
      } else {
        thumbnailUrl = $program.find(".info a img").attr("src");
      }
      thumbParam.background = `url('${thumbnailUrl}')`;
      thumbParam.title = $program.find(".video_title").text();
      thumbParam.id = `lv${$program.find(".video_id").text()}`;
      thumbParam.url = `http://live.nicovideo.jp/watch/${thumbParam.id}`;
      thumbParam.text = thumbParam.title;
      thumbParam.index = index;
      thumbParam.openTime = $program.has(".reserve").length
        ? `20${$program.find(".time").text()} 開場`
        : undefined;
      thumbParams.push(thumbParam);
      if (index == this.state.programs.length - 1) {
        this.setState({ thumbParams: thumbParams });
      }
    });
  }

  render() {
    if (this.state.thumbParams == null) {
      return <div id="container" />;
    }
    return (
      <div id="container">
        {this.state.thumbParams.map(thumbParam => (
          <Thumbnail
            key={thumbParam.id}
            preload={thumbParam.index == 0}
            background={thumbParam.background}
            title={thumbParam.title}
            url={thumbParam.url}
            id={thumbParam.id}
            text={thumbParam.text}
            index={thumbParam.index}
            openTime={thumbParam.openTime}
          />
        ))}
      </div> // TODO: delete container
    );
  }
}
