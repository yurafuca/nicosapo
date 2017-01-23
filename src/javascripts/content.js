import $ from 'jquery'

import Napi from "./api/Api";

import Log from "./common/Log";
import Time from "./common/Time";

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

$(function () {
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

  if ((pageType === 'NORMAL_CAST_PAGE') || (pageType === 'MODERN_CAST_PAGE') || (pageType === 'STAND_BY_PAGE')) {
    _page.putExtendedBar();
    _page.setUpExtendedBar();
    chrome.runtime.sendMessage({
        purpose: 'getFromLocalStorage',
        key: 'options.redirect.time'
      },
      function (response) {
        const intervalTime = response || '50';
        console.info('[nicosapo]intervalTime = ', intervalTime);
        setTimeout(autoRedirect, intervalTime * 1000);
      }
    );
  }

  // TimeCounter.
  setInterval(function () {
    _page.countExtendedBar();
  }, 1000);
});

$(function () {
  $(document).on('click', '.auto_redirect_button', function () {
    if (autoRedirectButton.isToggledOn()) {
      autoRedirectButton.toggleOff();
    } else {
      autoRedirectButton.toggleOn();
    }
  });
  $(document).on('click', '.auto_enter_program_button', function () {
    if (autoEnterProgramButton.isToggledOn()) {
      autoEnterProgramButton.toggleOff();
      autoEnterProgramButton.removeAsAutoEnter();
    } else {
      autoEnterProgramButton.toggleOn();
      autoEnterProgramButton.saveAsAutoEnter();
    }
  });
  $(document).on('click', '.auto_enter_community_button', function () {
    if (autoEnterCommunityButton.isToggledOn()) {
      autoEnterCommunityButton.toggleOff();
      autoEnterCommunityButton.removeAsAutoEnter();
    } else {
      autoEnterCommunityButton.toggleOn();
      autoEnterCommunityButton.saveAsAutoEnter();
    }
  });
});

function enabledOrNull(value) {
  return (value === 'enable') || value == null;
}

// TODO: Rename.
function autoRedirect() {
  if (autoRedirectButton.isToggledOn()) {
    Log.out(idHolder.liveId + ' is enabled auto redirect.');
    Napi.isOffAir(idHolder.liveId).then(function (response) {
      if (!response.isOffAir) { // ONAIR
        _page.updateExtendedBar(response);
      } else {
        _page.invalidateExtendedBar();
        Napi.isStartedBroadcast(idHolder.communityId).then(function (response) { // OFFAIR
          if (response.isStarted) {
            redirectBroadcastPage(response.nextBroadcastId);
          }
        });
      }

    });
  } else {
    Log.out(idHolder.liveId + ' is disabled auto redirect.');
  }
  chrome.runtime.sendMessage({
      purpose: 'getFromLocalStorage',
      key: 'options.redirect.time'
    },
    function (response) {
      const intervalTime = response || '50';
      console.info('[nicosapo]intervalTime = ', intervalTime);
      setTimeout(autoRedirect, intervalTime * 1000);
    }
  );
}

function redirectBroadcastPage(broadcastId) {
  const endpoint = 'http://live.nicovideo.jp/watch/';
  const broadcastUrl = endpoint + broadcastId;
  window.location.replace(broadcastUrl);
}

function isEnabledAutoRedirect() {
  const data = sessionStorage[idHolder.communityId];

  if (data == undefined) {
    return true;
  }

  const parsedData = JSON.parse(data);

  if (parsedData.enabledAutoRedirect == 'false')
    return false;
}
