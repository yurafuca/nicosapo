import CastPage from '../page/CastPage';

export default class OfficialCastPage extends CastPage {
  putWidgets() {
      const props = {
        buttonOrder : `MESSAGE`,
        message     : `/* にこさぽ: 公式番組ではでは各種ボタンが無効になります */`,
        position    : `APPEND`,
        enableExBar : true,
        element4Buttons: document.querySelector("[class^='___toggle-button___']"),
        idName4ExBar: 'class^="___operator-area___"'
      };
      super.putWidgets(props);
  }
}
