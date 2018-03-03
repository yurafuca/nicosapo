import CastPage from '../page/CastPage';

export default class NormalCastPage extends CastPage {
  putWidgets() {
    const props = {
      buttonOrder    : `DEFAULT`,
      enableARButton : true,
      enableACButton : true,
      enableAPButton : false,
      enableExBar    : true,
      position       : `APPEND`,
      requireInline  : true,
      element4Buttons: document.getElementsByClassName('meta')[0],
      idName4ExBar   : 'id="watch_player_top_box"'
    };
    super.putWidgets(props);
  }
}
