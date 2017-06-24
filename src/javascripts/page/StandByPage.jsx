import NonCastPage from '../page/NonCastPage';

export default class StandByPage extends NonCastPage {
  putWidgets() {
    const props = {
      buttonOrder    : `DEFAULT`,
      enableARButton : true,
      enableACButton : false,
      enableAPButton : false,
      enableExBar    : false,
      position       : `APPEND`,
      requireInline  : true,
      element4Buttons: document.getElementById('watch_like_buttons'),
      idName4ExBar   : `siteHeader` // TODO: temp
    };
    super.putWidgets(props);
  }
}
