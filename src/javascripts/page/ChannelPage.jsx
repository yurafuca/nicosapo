import NonCastPage from '../page/NonCastPage';

export default class ChannelPage extends NonCastPage {
  putWidgets() {
    const props = {
      buttonOrder    : `DEFAULT`,
      enableARButton : false,
      enableACButton : true,
      enableAPButton : false,
      enableExBar    : false,
      position       : `APPEND`,
      requireInline  : true,
      element4Buttons: document.getElementsByClassName('join_leave')[0],
      idName4ExBar   : `id=siteHeader` // TODO: temp
    };
    super.putWidgets(props);
  }
}
