import $ from 'jquery'

import Napi from "./api/Api";

import Log  from "./common/Log";
import Time  from "./common/Time";

import TimeCounter from "./common/TimeCounter";
import FormatNicoPage from "./modules/FormatNicoPage";
import IdHolder from "./modules/IdHolder";
import PageType from "./modules/PageType";

import AutoRedirectButton from "./buttons/AutoRedirectButton";
import AutoEnterCommunityButton from "./buttons/AutoEnterCommunityButton";
import AutoEnterProgramButton from "./buttons/AutoEnterProgramButton";

const timeCounter = new TimeCounter(new Date());
const formatNicoPage = new FormatNicoPage();
const idHolder = new IdHolder();

const autoRedirectButton = new AutoRedirectButton();
const autoEnterCommunityButton = new AutoEnterCommunityButton();
const autoEnterProgramButton = new AutoEnterProgramButton();

$(function()
{
    const pageType = PageType.get();

    formatNicoPage.exec(pageType);

    switch (pageType) {
        case 'STAND_BY_PAGE':
            $('.infobox').prepend(autoRedirectButton.getDom());
            chrome.runtime.sendMessage({
                    purpose: 'getFromNestedLocalStorage',
                    key: 'autoEnterProgramList'
                },
                function(response) {
                    if (response[idHolder.liveId]) {
                        // Buttons.toggleOn('autoEnterProgram');
                        autoEnterProgramButton.toggleOn();
                    } else {
                        // Buttons.toggleOff('autoEnterProgram');
                        autoEnterProgramButton.toggleOff();
                    }
                }
            );
            break;
        case 'GATE_PAGE':
            $('.gate_title').prepend(autoEnterProgramButton.getDom());
            break;
        case 'MODERN_CAST_PAGE':
            $('.program-detail div').last().append(autoRedirectButton.getDom());
            break;
        case 'NORMAL_CAST_PAGE':
            $('.meta').append(autoRedirectButton.getDom());
            $('.meta').append(autoEnterCommunityButton.getDom());
            break;
        case 'OFFICIAL_CAST_PAGE':
            const noSupport = $(`<span>　
                                  /* 公式番組では自動枠移動，
                                  コミュニティへの自動入場に対応していません */
                                  </span>`)
            $('.meta').append(noSupport);
            break;
        case 'COMMUNITY_PAGE':
            $('a#comSetting_hide').after(autoEnterCommunityButton.getDom());
            break;
        case 'CHANNEL_PAGE':
            $('div.join_leave').prepend(autoEnterCommunityButton.getDom());
            break;
        default:
            // Do nothing.
            break;
    }

    const extendedBar = $(`
            <div id="extended-bar">
                <div class="time end-time"></div>
                <div class="message">延長されていません</div>
                <div class="time rest-time"></div>
            </div>
        `);

    switch (pageType) {
        case 'OFFICIAL_CAST_PAGE': // Fall Through.
        case 'NORMAL_CAST_PAGE':   // Fall Through.
        case 'MODERN_CAST_PAGE':
            $('#player').after(extendedBar);
            $('#watch_player_top_box').after(extendedBar);
            // $('#watch_player_box').after(extendedBar);
            chrome.runtime.sendMessage({
                    purpose: 'getFromLocalStorage',
                    key: 'options.autoJump.enable'
                },
                function(response) {
                    if (enabledOrNull(response)) {
                        autoRedirectButton.toggleOn();
                    } else {
                        autoRedirectButton.toggleOff();
                    }
                }
            );
            chrome.runtime.sendMessage({
                    purpose: 'getFromNestedLocalStorage',
                    key: 'autoEnterCommunityList'
                },
                function(response) {
                    if (response[idHolder.communityId]) {
                        autoEnterCommunityButton.toggleOn();
                    } else {
                        autoEnterCommunityButton.toggleOff();
                    }
                }
            );
            Napi.getStatusByBroadcast(idHolder.liveId).then(function(response) {

                // Extended Bar.
                const currentTime = Date.now();
                const currentDate = new Date(currentTime);

                // new Date() は引数にミリ秒を要求するので 1000 倍するために末尾に '000' を付加する．
                const endTime = Number($(response).find('stream end_time').text() + '000');
                const endDate = new Date(endTime);

                const endTimeJpn = Time.toJpnString(endDate.getTime());

                const restTime_Minute = Time.minuteDistance(currentDate, endDate);
                let   restTime_Second = Time.minuteDistanceOfSec(currentDate, endDate);
                      restTime_Second = ('0' + restTime_Second).slice(-2);

                // タイマーを初期化
                timeCounter.setHour(0);
                timeCounter.setMinute(restTime_Minute);
                timeCounter.setSecond(restTime_Second);

                $('#extended-bar .end-time').text(`${endTimeJpn}`);
                $('#extended-bar .rest-time').text(`${restTime_Minute}：${restTime_Second}`);
            });
            break;
        case 'STAND_BY_PAGE':
            chrome.runtime.sendMessage({
                    purpose: 'getFromLocalStorage',
                    key: 'options.autoJump.enable'
                },
                function(response) {
                    if (enabledOrNull(response)) {
                        autoRedirectButton.toggleOn();
                    } else {
                        autoRedirectButton.toggleOff();
                    }
                }
            );
            break;
        case 'GATE_PAGE':
            chrome.runtime.sendMessage({
                    purpose: 'getFromNestedLocalStorage',
                    key: 'autoEnterProgramList'
                },
                function(response) {
                    if (response[idHolder.liveId]) {
                        autoEnterProgramButton.toggleOn();
                    } else {
                        autoEnterProgramButton.toggleOff();
                    }
                });
            break;
        case 'COMMUNITY_PAGE': // Fall Through.
        case 'CHANNEL_PAGE':
            chrome.runtime.sendMessage({
                    purpose: 'getFromNestedLocalStorage',
                    key: 'autoEnterCommunityList'
                },
                function(response) {
                    if (response[idHolder.communityId]) {
                        autoEnterCommunityButton.toggleOn();
                    } else {
                        autoEnterCommunityButton.toggleOff();
                    }
                });
            break;
    }

    if ((pageType === 'NORMAL_CAST_PAGE') || (pageType === 'MODERN_CAST_PAGE') || (pageType ==='STAND_BY_PAGE')) {
        // setInterval(autoRedirect, 1000 * 50);
        chrome.runtime.sendMessage({
                purpose: 'getFromLocalStorage',
                key: 'options.redirect.time'
            },
            function(response) {
                const intervalTime = response || '50';
                console.info('[nicosapo]intervalTime = ', intervalTime);
                setTimeout(autoRedirect, intervalTime * 1000);
            }
        );
    }

    // TimeCounter.
    setInterval(function() {
        const $restTime = $('#extended-bar .rest-time');
        if ($restTime.text() == '放送が終了しました') { // TODO: Too Ugly.
            return;
        }
        const minute = timeCounter.getMinute();
        let   second = timeCounter.getSecond();
              second = ('0' + second).slice(-2);
        $restTime.text(`${minute}：${second}`);
        timeCounter.subSecond(1);
    }, 1000);
});

$(function() {
    $(document).on('click', '.auto_redirect_button', function() {
        if (autoRedirectButton.isToggledOn()) {
            autoRedirectButton.toggleOff();
        } else {
            autoRedirectButton.toggleOn();
        }
    });
    $(document).on('click', '.auto_enter_program_button', function() {
        if (autoEnterProgramButton.isToggledOn()) {
            autoEnterProgramButton.toggleOff();
            autoEnterProgramButton.removeAsAutoEnter();
        } else {
            autoEnterProgramButton.toggleOn();
            autoEnterProgramButton.saveAsAutoEnter();
        }
    });
    $(document).on('click', '.auto_enter_community_button', function() {
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

        Napi.isOffAir(idHolder.liveId).then(function(response) {

            // ONAIR.
            if (!response.isOffAir) {

                // Extended Bar.
                const currentTime = Date.now();
                const currentDate = new Date(currentTime);

                // new Date() は引数にミリ秒を要求するので 1000 倍するために末尾に '000' を付加する．
                const endTime = Number($(response).find('stream end_time').text() + '000');
                const endDate = new Date(endTime)

                const endTimeJpn = Time.toJpnString(endDate.getTime());
                const endTimeJpnLast = $('#extended-bar .end-time').text();

                const restTime_Minute = Time.minuteDistance(currentDate, endDate);
                let   restTime_Second = Time.minuteDistanceOfSec(currentDate, endDate);
                      restTime_Second = ('0' + restTime_Second).slice(-2);

                // 終了時刻が更新された場合はタイマーを更新
                if (endTimeJpnLast !== endTimeJpn) {
                    timeCounter.setHour(0); // TODO:
                    timeCounter.setMinute(restTime_Minute);
                    timeCounter.setSecond(restTime_Second);

                    $('#extended-bar .end-time').text(`${endTimeJpn}`);
                    $('#extended-bar .rest-time').text(`${restTime_Minute}：${restTime_Second}`);

                    // 点滅処理 (奇数回繰り返してメッセージを残す)
                    for (let i = 0; i < 9; i++) {
                        let message = '';
                        if (i % 2 === 0) {
                            message = `${endTimeJpn} に放送が延長されました`;
                        } else {
                            message = ``;
                        }
                        setTimeout(function() {
                            $('#extended-bar .message').text(message);
                        }, i * 500);
                    }
                }

                return;
            }

            // OFFAIR.
            Napi.isStartedBroadcast(idHolder.communityId).then(function(response) {
                // タイマーを無効化
                $('#extended-bar .end-time').text(`放送が終了しました`);
                $('#extended-bar .rest-time').text(`放送が終了しました`);

                Log.out('Napi.isStartedBroadcast', response);

                if (response.isStarted) {
                    redirectBroadcastPage(response.nextBroadcastId);
                }
            });
        });
    } else {
        Log.out(idHolder.liveId + ' is disabled auto redirect.');
    }

    chrome.runtime.sendMessage({
            purpose: 'getFromLocalStorage',
            key: 'options.redirect.time'
        },
        function(response) {
            const intervalTime = response || '50';
            console.info('[nicosapo]intervalTime = ', intervalTime);
            setTimeout(autoRedirect, intervalTime * 1000);
        }
    );
}

function autoEnter() {

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
