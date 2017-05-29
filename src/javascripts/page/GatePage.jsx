import CastPage from '../page/CastPage';

export default class GatePage extends CastPage {
  putWidgets() {
    const props = {
      buttonOrder    : `DEFAULT`,
      enableARButton : false,
      enableACButton : false,
      enableAPButton : true,
      enableExBar    : false,
      position       : `PREPEND`,
      requireInline  : true,
      element4Buttons: document.getElementsByClassName('gate_title')[0],
      idName4ExBar   : `siteHeader` // TODO: temp
    };
    super.putWidgets(props);
  }
}
