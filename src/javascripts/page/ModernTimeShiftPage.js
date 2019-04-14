import CastPage from '../page/CastPage'

export default class ModernTimeShiftPage extends CastPage {
  putWidgets() {
    const props = {
      buttonOrder: `MESSAGE`,
      message: `/* にこさぽ: タイムシフトでは各種ボタンと情報バーが無効になります */`,
      position: `APPEND`,
      enableExBar: false,
      element4Buttons: document.querySelector("#nicosapo-buttons"),
      idName4ExBar: 'class^="___operator-area___"'
    };
    super.putWidgets(props);
  }
}