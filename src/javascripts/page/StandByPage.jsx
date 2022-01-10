import NonCastPage from '../page/NonCastPage';

export default class StandByPage extends NonCastPage {
  constructor() {
    super();
    document.querySelector("[class^='___program-information-main-area___']").insertAdjacentHTML("afterbegin", "<div id='nicosapo-buttons'></div>");
  }

  putWidgets() {
    const props = {
      buttonOrder    : `DEFAULT`,
      enableARButton : false,
      enableACButton : false,
      enableAPButton : true,
      enableExBar    : false,
      position       : `APPEND`,
      requireInline  : true,
      element4Buttons: document.querySelector('#nicosapo-buttons'),
      idName4ExBar: 'class^="___operator-area___"'
    };
    super.putWidgets(props);
  }
}
