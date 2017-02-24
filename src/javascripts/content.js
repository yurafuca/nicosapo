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
import CastPage from './page/CastPage'
const formatNicoPage = new FormatNicoPage();

$(() => {
  const pageType = PageType.get();
  formatNicoPage.exec(pageType);
  const pages = {
    'STAND_BY_PAGE':      StandByPage,
    'GATE_PAGE':          GatePage,
    'NORMAL_CAST_PAGE':   NormalCastPage,
    'MODERN_CAST_PAGE':   ModernCastPage,
    'OFFICIAL_CAST_PAGE': OfficialCastPage,
    'COMMUNITY_PAGE':     CommunityPage,
    'CHANNEL_PAGE':       ChannelPage,
  }
  const page = new pages[pageType]();
  page.putButton();
  if (page instanceof CastPage) {
    page.buildExtendedBar();
  }
});
