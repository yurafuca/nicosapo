import CastPage from '../page/CastPage';

export default class OfficialCastPage extends CastPage {
  putWidgets() {
      const isRetroPage = document.querySelector("[class^='___follow-toggle-form___']") == null
                          && document.querySelector("[class^='___provider-detail___']") == null;
      const props = {
        buttonOrder : `MESSAGE`,
        message     : `/* にこさぽ: ドワンゴ社提供の番組では各種ボタンが無効になります */`,
        position    : `APPEND`,
        enableExBar : true,
        element4Buttons: document.querySelector("#nicosapo-buttons"),
        idName4ExBar: isRetroPage ? 'id=watch_player_top_box' : 'class^="___operator-area___"'
      };
      super.putWidgets(props);
  }
}
