import $ from 'jquery';
import React from 'react'
import Api from '../api/Api';
import Common from '../common/Common';
import ListItem from '../components/ListItem';
import CastSearcher from '../modules/CastSearcher'

export default class SearchContent extends React.Component {
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
    // this.setState({ programs: nextProps.programs }, this.setParams);
  }

  setParams() {
    Api.foo().then((response) => {
      const datas = response.data;
      const thumbParams = [];
      for (const data of datas) {
        const thumbParam = {};
        thumbParam.url = `http://live.nicovideo.jp/watch/${data.contentId}`;
        thumbParam.thumbnail = data.communityIcon;
        thumbParam.description = Common.wordWrap(data.description, 34);
        thumbParam.title = data.title;
        thumbParams.push(thumbParam);
      }
      this.setState({ thumbParams: thumbParams });
    });
    // if (this.state.programs == null) {
    //   this.setState({thumbParams: []});
    //   return;
    // }
    // const thumbParams  = [];
    // this.state.programs.forEach((program, index) => {
    //   const thumbParam  = {};
    //   const $program    = $(program);
    //   const communityId = $program.find('.video_text a').attr('href');
    //   const regexp      = /http\:\/\/ch.nicovideo.jp\/channel\/(.+)/;
    //   const resultarr   = regexp.exec(communityId);
    //   let thumbnailUrl;
    //   if (resultarr != null) {
    //     thumbnailUrl = `http://icon.nimg.jp/channel/${resultarr[1]}.jpg`;
    //   } else {
    //     thumbnailUrl = $program.find('.info a img').attr('src');
    //   }
    //   thumbParam.background = `url('${thumbnailUrl}')`;
    //   thumbParam.title      = $program.find('.video_title').text();
    //   thumbParam.id         = `lv${$program.find('.video_id').text()}`;
    //   thumbParam.url        = `http://live.nicovideo.jp/watch/${thumbParam.id}`;
    //   thumbParam.text       = thumbParam.title;
    //   thumbParam.index      = index;
    //   thumbParam.openTime   = ($program.has('.reserve').length) ? (`20${$program.find('.time').text()} 開場`) : (undefined);
    //   thumbParams.push(thumbParam);
    //   if (index == this.state.programs.length - 1) {
    //     this.setState({ thumbParams: thumbParams });
    //   }
    // });
  }

  render() {
    // (new CastSearcher).run();
    return (
      <div id="container">
        <form id="search-container">
          <input type="search" id="search-input" placeholder="キーワードを入力"/>
          <input type="button" id="search-button" value="検索"/>
        </form>
        {this.state.thumbParams.map((thumbParam) =>
          <ListItem
            title      = {thumbParam.title}
            url        = {thumbParam.url}
            description      = {thumbParam.description}
            thumbnail   = {thumbParam.thumbnail} />
        )}
      </div> // TODO: delete container
    );
  }
}
