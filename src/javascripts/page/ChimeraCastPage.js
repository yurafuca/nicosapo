import CastPage from "../page/CastPage";

export default class ChimeraCastPage extends CastPage {
  putWidgets() {
    const props = {
      buttonOrder: `DEFAULT`,
      enableARButton: true,
      enableACButton: true,
      enableAPButton: false,
      enableExBar: true,
      position: `APPEND`,
      requireInline: true,
      element4Buttons: document.querySelector(".program-title").nextSibling,
      idName4ExBar: 'id="bourbon-block"'
    };
    super.putWidgets(props);
  }
}
