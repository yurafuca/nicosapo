import CastPage from '../page/CastPage';

export default class OfficialCastPage extends CastPage {
  putWidgets() {
      const isRetroPage = document.querySelector("[class^='___toggle-button___']") == null;
      const props = {
        buttonOrder : `MESSAGE`,
        message     : `/* にこさぽ: 公式番組ではでは各種ボタンが無効になります */`,
        position    : `APPEND`,
        enableExBar : true,
        element4Buttons: document.querySelector("[class^='___toggle-button___']") || document.getElementById('channel_interface_bookmark'),
        idName4ExBar: isRetroPage ? 'id=watch_player_top_box' : 'class^="___operator-area___"'
      };
      super.putWidgets(props);
  }
}
