import NonCastPagee from '../page/NonCastPage';

export default class UserPage extends NonCastPagee {
  putWidgets() {
    const props = {
      buttonOrder    : `DEFAULT`,
      enableARButton : false,
      enableACButton : true,
      enableAPButton : false,
      enableExBar    : false,
      position       : `APPEND`,
      requireInline  : true,
      element4Buttons: document.querySelector('.profile'),
      idName4ExBar   : `id=siteHeader` // TODO: temp
    };
    super.putWidgets(props);
  }
}
