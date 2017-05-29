import CastPage from '../page/CastPage';

export default class OfficialCastPage extends CastPage {
  putWidgets() {
      const props = {
        buttonOrder : `MESSAGE`,
        message     : `/* にこさぽ: 公式番組では自動枠移動，コミュニティへの自動入場に対応していません */`,
        position    : `APPEND`,
        enableExBar : true,
        idName4ExBar: 'watch_player_top_box'
      };
      super.putWidgets(props);
  }
}
