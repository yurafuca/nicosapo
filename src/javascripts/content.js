import $ from "jquery";
import FormatNicoPage from "./modules/FormatNicoPage";
import PageType from "./modules/PageType";
import StandByPage from "./page/StandByPage";
import GatePage from "./page/GatePage";
import NormalCastPage from "./page/NormalCastPage";
import ChimeraCastPage from "./page/ChimeraCastPage";
import ModernCastPage from "./page/ModernCastPage";
import OfficialCastPage from "./page/OfficialCastPage";
import TimeShiftPage from "./page/TimeShiftPage";
import ModernTimeShiftPage from "./page/ModernTimeShiftPage";
import CommunityPage from "./page/CommunityPage";
import ChannelPage from "./page/ChannelPage";

const formatNicoPage = new FormatNicoPage();

$(() => {
  const pageType = PageType.get();
  formatNicoPage.exec(pageType);
  const pages = {
    STAND_BY_PAGE: StandByPage,
    GATE_PAGE: GatePage,
    NORMAL_CAST_PAGE: NormalCastPage,
    CHIMERA_CAST_PAGE: ChimeraCastPage,
    MODERN_CAST_PAGE: ModernCastPage,
    OFFICIAL_CAST_PAGE: OfficialCastPage,
    TIME_SHIFT_PAGE: TimeShiftPage,
    MODERN_TIME_SHIFT_PAGE: ModernTimeShiftPage,
    COMMUNITY_PAGE: CommunityPage,
    CHANNEL_PAGE: ChannelPage
  };
  const page = new pages[pageType]();
  page.putWidgets();
});