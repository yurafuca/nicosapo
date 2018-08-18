import CastPage from '../page/CastPage';

export default class ModernCastPage extends CastPage {
  putWidgets() {
    const props = {
      buttonOrder: `DEFAULT`,
      enableARButton: true,
      enableACButton: true,
      enableAPButton: false,
      enableExBar: true,
      position: `APPEND`,
      requireInline: true,
      element4Buttons: document.querySelector('[class^="___provider-detail___"]'),
      idName4ExBar: 'class^="___operator-area___"'
    };
    super.putWidgets(props);
  }
}