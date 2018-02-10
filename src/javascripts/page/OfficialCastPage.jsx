import CastPage from '../page/CastPage';

export default class OfficialCastPage extends CastPage {
  putWidgets() {
      const isRetroPage = document.querySelector("[class^='___toggle-button___']") == null
                          && document.querySelector("[class^='___provider-detail___']") == null;
      const props = {
        buttonOrder : `MESSAGE`,
        message     : `/* にこさぽ: ドワンゴ社提供の番組では各種ボタンが無効になります */`,
        position    : `APPEND`,
        enableExBar : true,
        element4Buttons: document.querySelector("[class^='___toggle-button___']") // 新配信
                         || document.querySelector("[class^='___provider-detail___']") // フォローボタンのない新配信
                         || document.getElementById('channel_interface_bookmark'), // 旧配信
        idName4ExBar: isRetroPage ? 'id=watch_player_top_box' : 'class^="___operator-area___"'
      };
      super.putWidgets(props);
  }
}
