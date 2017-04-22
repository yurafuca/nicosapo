import CastPage from '../page/CastPage'

export default class TimeShiftPage extends CastPage {
  putWidgets() {
      const props = {
        buttonOrder : `MESSAGE`,
        message     : `/* にこさぽ: タイムシフトでは各種ボタンと情報バーが無効になります */`,
        position    : `APPEND`,
        enableExBar : false,
        idName4ExBar: 'watch_player_top_box'
      };
      super.putWidgets(props);
  }
}
