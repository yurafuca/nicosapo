import NonCastPagee from '../page/NonCastPage';

export default class CommunityPage extends NonCastPagee {
  putWidgets() {
    const props = {
      buttonOrder    : `DEFAULT`,
      enableARButton : false,
      enableACButton : true,
      enableAPButton : false,
      enableExBar    : false,
      position       : `AFTER`,
      requireInline  : true,
      element4Buttons: document.querySelector('#comSetting_hide'),
      idName4ExBar   : `id=siteHeader` // TODO: temp
    };
    super.putWidgets(props);
  }
}
