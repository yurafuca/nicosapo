import $ from 'jquery';
import FormatNicoPage from "./modules/FormatNicoPage";
import PageType from "./modules/PageType";
import StandByPage from "./page/StandByPage";
import GatePage from "./page/GatePage";
import NormalCastPage from "./page/NormalCastPage";
import ModernCastPage from "./page/ModernCastPage";
import OfficialCastPage from "./page/OfficialCastPage";
import CommunityPage from "./page/CommunityPage";
import ChannelPage from "./page/ChannelPage";
const formatNicoPage = new FormatNicoPage();
import AutoRedirectButton from "./buttons/AutoRedirectButton"; //
const autoRedirectButton = new AutoRedirectButton(); //

let _page = null;

$(() => {
  const pageType = PageType.get();
  formatNicoPage.exec(pageType);

  const pages = {
    'STAND_BY_PAGE': StandByPage,
    'GATE_PAGE': GatePage,
    'NORMAL_CAST_PAGE': NormalCastPage,
    'MODERN_CAST_PAGE': ModernCastPage,
    'OFFICIAL_CAST_PAGE': OfficialCastPage,
    'COMMUNITY_PAGE': CommunityPage,
    'CHANNEL_PAGE': ChannelPage,
  }

  _page = new pages[pageType]();
  _page.putButton();

  // if ((pageType === 'NORMAL_CAST_PAGE') || (pageType === 'MODERN_CAST_PAGE')) {
  //   chrome.runtime.sendMessage({purpose: 'getFromLocalStorage', key: 'options.redirect.time'},
  //   (response) => {
  //     const intervalTime = response || '50';
  //     console.info('[nicosapo]intervalTime = ', intervalTime);
  //     setTimeout(checkNewCasts, intervalTime * 1000);
  //   });
  // }
});

// const checkNewCasts = () => {
//   if (autoRedirectButton.isToggledOn()) {
//     console.log(`${idHolder.liveId} is enabled auto redirect.`);
//     Api.isOpen(idHolder.liveId).then((response) => {
//       if (response.isOpen) {
//         // OPENED
//         _page.updateExtendedBar(response);
//       } else {
//         // CLOSED
//         _page.invalidateExtendedBar();
//         Api.isOpen(idHolder.communityId).then((response) => {
//           if (response.isOpen) {
//             goToCast(response.nextLiveId);
//           }
//         });
//       }
//
//     });
//   } else {
//     console.log(`${idHolder.liveId} is disabled auto redirect.`);
//   }
//   chrome.runtime.sendMessage({
//       purpose: 'getFromLocalStorage',
//       key: 'options.redirect.time'
//     }, (response) => {
//       const intervalTime = response || '50';
//       console.info('[nicosapo]intervalTime = ', intervalTime);
//       setTimeout(checkNewCasts, intervalTime * 1000);
//   });
// }

// const goToCast = (liveId) => {
//   const baseUrl = 'http://live.nicovideo.jp/watch/';
//   const liveUrl = baseUrl + liveId;
//   window.location.replace(liveUrl);
// }
