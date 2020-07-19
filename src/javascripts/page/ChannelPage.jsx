import NonCastPage from '../page/NonCastPage';

export default class ChannelPage extends NonCastPage {
  putWidgets() {
    const isProviderDwango = this.isProviderDwango();
    const props = {
      buttonOrder    : isProviderDwango ? `MESSAGE` : `DEFAULT`,
      message        : `/* にこさぽ: ドワンゴ社提供のチャンネルでは自動入場ボタンが無効になります */`,
      enableARButton : false,
      enableACButton : !isProviderDwango,
      enableAPButton : false,
      enableExBar    : false,
      position       : `APPEND`,
      requireInline  : true,
      element4Buttons: document.getElementsByClassName('join_leave')[0],
      idName4ExBar   : `id=CommonHeader` // TODO: temp
    };
    super.putWidgets(props);
  }

  isProviderDwango() {
    const provider = document.getElementsByClassName('cp_viewname')[0].textContent;
    return provider.includes('株式会社ドワンゴ');
  }
}
