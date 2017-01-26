import $ from 'jquery';

import Api from "./api/Api";

import FormatNicoPage from "./modules/FormatNicoPage";
import IdHolder from "./modules/IdHolder";
import PageType from "./modules/PageType";

import AutoRedirectButton from "./buttons/AutoRedirectButton";
import AutoEnterCommunityButton from "./buttons/AutoEnterCommunityButton";
import AutoEnterProgramButton from "./buttons/AutoEnterProgramButton";

import StandByPage from "./page/StandByPage";
import GatePage from "./page/GatePage";
import NormalCastPage from "./page/NormalCastPage";
import ModernCastPage from "./page/ModernCastPage";
import OfficialCastPage from "./page/OfficialCastPage";
import CommunityPage from "./page/CommunityPage";
import ChannelPage from "./page/ChannelPage";

const formatNicoPage = new FormatNicoPage();
const idHolder = new IdHolder();

const autoRedirectButton = new AutoRedirectButton();
const autoEnterCommunityButton = new AutoEnterCommunityButton();
const autoEnterProgramButton = new AutoEnterProgramButton();

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
  _page.setUpButton();

  if ((pageType === 'NORMAL_CAST_PAGE') || (pageType === 'MODERN_CAST_PAGE') || (pageType === 'OFFICIAL_CAST_PAGE')) {
    _page.putExtendedBar();
    _page.setUpExtendedBar();
    chrome.runtime.sendMessage({
        purpose: 'getFromLocalStorage',
        key: 'options.redirect.time'
      }, (response) => {
      const intervalTime = response || '50';
      console.info('[nicosapo]intervalTime = ', intervalTime);
      setTimeout(checkNewCasts, intervalTime * 1000);
    });
    // TimeCounter.
    setInterval(() => {
      _page.countExtendedBar();
    }, 1000);
  }
});

$(() => {
  $(document).on('click', '.auto_redirect_button', () => {
    if (autoRedirectButton.isToggledOn()) {
      autoRedirectButton.toggleOff();
    } else {
      autoRedirectButton.toggleOn();
    }
  });
  $(document).on('click', '.auto_enter_program_button', () => {
    if (autoEnterProgramButton.isToggledOn()) {
      autoEnterProgramButton.toggleOff();
      autoEnterProgramButton.removeAsAutoEnter();
    } else {
      autoEnterProgramButton.toggleOn();
      autoEnterProgramButton.saveAsAutoEnter();
    }
  });
  $(document).on('click', '.auto_enter_community_button', () => {
    if (autoEnterCommunityButton.isToggledOn()) {
      autoEnterCommunityButton.toggleOff();
      autoEnterCommunityButton.removeAsAutoEnter();
    } else {
      autoEnterCommunityButton.toggleOn();
      autoEnterCommunityButton.saveAsAutoEnter();
    }
  });
});

const checkNewCasts = () => {
  if (autoRedirectButton.isToggledOn()) {
    console.log(`${idHolder.liveId} is enabled auto redirect.`);
    Api.isOpen(idHolder.liveId).then((response) => {
      if (response.isOpen) {
        // OPENED
        _page.updateExtendedBar(response);
      } else {
        // CLOSED
        _page.invalidateExtendedBar();
        Api.isOpen(idHolder.communityId).then((response) => {
          if (response.isOpen) {
            goToCast(response.nextLiveId);
          }
        });
      }

    });
  } else {
    console.log(`${idHolder.liveId} is disabled auto redirect.`);
  }
  chrome.runtime.sendMessage({
      purpose: 'getFromLocalStorage',
      key: 'options.redirect.time'
    }, (response) => {
      const intervalTime = response || '50';
      console.info('[nicosapo]intervalTime = ', intervalTime);
      setTimeout(checkNewCasts, intervalTime * 1000);
  });
}

const goToCast = (liveId) => {
  const baseUrl = 'http://live.nicovideo.jp/watch/';
  const liveUrl = baseUrl + liveId;
  window.location.replace(liveUrl);
}
