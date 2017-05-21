import $ from 'jquery';
import store from 'store'
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
      thumbParams: [],
      isLoading: true,
      resultCount: 0,
      query: store.get('query') || '',
      queried: store.get('query') || '',
      favoriteQueries: store.get('favoriteQueries') || [],
      sortMode: store.get('sortMode') || 'startTime-dsc',
    };
    this.search = this.search.bind(this);
    this.setQuery = this.setQuery.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.registFavorite = this.registFavorite.bind(this);
    this.changeSortMode = this.changeSortMode.bind(this);
    this.removeQuery = this.removeQuery.bind(this);
  }

  componentDidMount() {
    this.setParams(this.state.query, this.state.sortMode);
  }

  componentWillReceiveProps(nextProps) {
    // this.setState({ programs: nextProps.programs }, this.setParams);
  }

  setParams(query, sortMode) {
    Api.search(query, sortMode).then((response) => {
      const datas = response.data;
      const thumbParams = [];
      this.setState({ resultCount: datas.length });
      for (const data of datas) {
        const thumbParam = {};
        thumbParam.url = `http://live.nicovideo.jp/watch/${data.contentId}`;
        thumbParam.thumbnail = data.communityIcon;
        thumbParam.description = data.description.replace(/\<.+\>/g, ' ');
        thumbParam.title = data.title;
        thumbParam.viewCounter = data.viewCounter;
        thumbParam.commentCounter = data.commentCounter;
        const foo = (new Date(data.startTime));
        const bar = foo.getTime();
        const baz = (new Date()).getTime();
        const hoge = (baz-bar)/1000/60;
        thumbParam.lapsedTime = parseInt(hoge);
        thumbParams.push(thumbParam);
      }
      this.setState({ thumbParams: thumbParams, isLoading: false });
    });
  }

  handleChange(event) {
    this.setState({query: event.target.value});
  }

  handleKeyPress(event) {
    if (event.key == 'Enter') {
      store.set('query', this.state.query);
      event.preventDefault();
      this.search();
    }
  }

  registFavorite(e) {
    const q = this.state.query;
    const queries = this.state.favoriteQueries.filter((query) => q !== query);
    queries.push(q);
    this.setState({ favoriteQueries: queries });
    store.set('favoriteQueries', queries);
  }

  changeSortMode(e) {
    this.setState({ sortMode: e.target.value }, this.search);
    store.set('sortMode', e.target.value);
  }

  setQuery(e) {
    store.set('query', e.currentTarget.getAttribute('data-query'));
    this.setState({query: e.currentTarget.getAttribute('data-query')}, this.search);
  }

  removeQuery() {
    const q = this.state.queried;
    const queries = this.state.favoriteQueries.filter((query) => q !== query);
    this.setState({ favoriteQueries: queries });
    store.set('favoriteQueries', queries);
  }

  search() {
    this.setState({ thumbParams: [], isLoading: true, queried: this.state.query });
    this.setParams(this.state.query, this.state.sortMode);
  }

  render() {
    return (
      <div>
        <form id="search-container">
          <select id="search-sort" name="sort" onChange={this.changeSortMode} value={this.state.sortMode}>
            <option value="startTime-dsc">放送日時が近い順</option>
            <option value="startTime-asc">放送日時が遠い順</option>
            <option value="viewCounter-dsc">来場者数が多い順</option>
            <option value="viewCounter-asc">来場者数が少ない順</option>
            <option value="commentCounter-dsc">コメント数が多い順</option>
            <option value="commentCounter-asc">コメント数が少ない順</option>
          </select>
          <input type="text" id="search-input" value={this.state.query} placeholder="キーワードを入力" onChange={this.handleChange} onKeyDown={this.handleKeyPress}/>
          <input type="button" id="search-button" value="検索" onClick={this.search}/>
          <span id="regist-favorite" onClick={this.registFavorite}>お気に入りに登録</span>
        </form>
        <div id="favorite-query-list">
          <span className="favorite-query-head">お気に入り</span>
          {this.state.favoriteQueries.map((query) =>
            <span
              className="favorite-query"
              onClick={this.setQuery}
              data-query={query}>
              {query}
              <span className={this.state.queried==query ? '' : 'none'}>
                <span className="query-remove" onClick={this.removeQuery}>削除</span>
              </span>
            </span>
          )}
        </div>
        <div id="result">
          <span>{this.state.queried} に該当する放送が {this.state.resultCount} 件{this.state.resultCount>=100 ? '以上' : ''}見つかりました．</span>
        </div>
        <div id="container" className={this.state.isLoading ? 'nowloading' : ''}>
          {this.state.thumbParams.map((thumbParam) =>
            <ListItem
              title      = {thumbParam.title}
              url        = {thumbParam.url}
              description      = {thumbParam.description}
              thumbnail   = {thumbParam.thumbnail}
              viewCounter   = {thumbParam.viewCounter}
              commentCounter   = {thumbParam.commentCounter}
              lapsedTime   = {thumbParam.lapsedTime} />
          )}
        </div>
      </div>
    );
  }
}
