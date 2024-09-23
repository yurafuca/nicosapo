import CastPage from '../page/CastPage';

export default class OfficialCastPage extends CastPage {
  putWidgets() {
      const props = {
        buttonOrder : `MESSAGE`,
        message     : `/* にこさぽ: ドワンゴ社提供の番組では各種ボタンが無効になります */`,
        position    : `APPEND`,
        enableExBar : true,
        element4Buttons: document.querySelector("#nicosapo-buttons"),
        idName4ExBar: 'class^="___operator-area___"'
      };
      super.putWidgets(props);
  }
}
