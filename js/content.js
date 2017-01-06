let _communityId;
let _broadcastId;
const timeCounter = new TimeCounter(new Date());
const formatNicoPage = new FormatNicoPage();
const idHolder = new IdHolder();

$(function()
{
    initialize();

    console.info('[nicosapo] pageType = ', PageType.get());

    const buttonTypes = {
        NORMAL_CAST_PAGE: 'autoRedirect',
        MODERN_CAST_PAGE: 'autoRedirect',
        STAND_BY_PAGE: 'autoRedirect',
        GATE_PAGE: 'autoEnterProgram'
    };

    const pageType = PageType.get();
    const buttonType = buttonTypes[pageType];
    const switchButton = Buttons.make(buttonType);

    console.info(pageType);

    formatNicoPage.exec(pageType);

    switch (pageType) {
        case 'STAND_BY_PAGE':
            const link = $(switchButton).find('.link');
            link.css('display', 'block');
            link.css('padding', '6px');
            link.css('font-size', '15px');
            switchButton.css('display', 'block');
            $('.infobox').prepend(switchButton);
            chrome.runtime.sendMessage({
                    purpose: 'getFromNestedLocalStorage',
                    key: 'autoEnterProgramList'
                },
                function(response) {
                    if (response[idHolder.liveId]) {
                        Buttons.toggleOn('autoEnterProgram');
                    } else {
                        Buttons.toggleOff('autoEnterProgram');
                    }
                }
            );
            break;
        case 'GATE_PAGE':
            $('.gate_title').prepend(switchButton);
            break;
        case 'MODERN_CAST_PAGE':
            $('.program-detail div').last().append(switchButton);
            break;
        case 'NORMAL_CAST_PAGE':
            $('.meta').append(switchButton);
            const switchButton2 = Buttons.make('autoEnterCommunity');
            $('.meta').append(switchButton2);
            break;
        case 'OFFICIAL_CAST_PAGE':
            const noSupport = $('<span>　/* 公式番組では自動枠移動，コミュニティへの自動入場に対応していません */</span>')
            $('.meta').append(noSupport);
            break;
        case 'COMMUNITY_PAGE':
            const switchButton3 = Buttons.make('autoEnterCommunity');
            $('a#comSetting_hide').after(switchButton3);
            break;
        case 'CHANNEL_PAGE':
            const switchButton4 = Buttons.make('autoEnterCommunity');
            $('div.join_leave').prepend(switchButton4);
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
                        Buttons.toggleOn('autoRedirect');
                    } else {
                        Buttons.toggleOff('autoRedirect');
                    }
                }
            );
            chrome.runtime.sendMessage({
                    purpose: 'getFromNestedLocalStorage',
                    key: 'autoEnterCommunityList'
                },
                function(response) {
                    if (response[idHolder.communityId]) {
                        Buttons.toggleOn('autoEnterCommunity');
                    } else {
                        Buttons.toggleOff('autoEnterCommunity');
                    }
                }
            );
            getStatusByBroadcast(idHolder.liveId).then(function(response) {

                // Extended Bar.
                const currentTime = Date.now();
                const currentDate = new Date(currentTime);

                // new Date() は引数にミリ秒を要求するので 1000 倍するために末尾に '000' を付加する．
                const endTime = Number($(response).find('stream end_time').text() + '000');
                const endDate = new Date(endTime)

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
                        Buttons.toggleOn('autoRedirect');
                    } else {
                        Buttons.toggleOff('autoRedirect');
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
                        Buttons.toggleOn('autoEnterProgram');
                    } else {
                        Buttons.toggleOff('autoEnterProgram');
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
                        Buttons.toggleOn('autoEnterCommunity');
                    } else {
                        Buttons.toggleOff('autoEnterCommunity');
                    }
                });
            break;
    }

    if ((pageType === 'NORMAL_CAST_PAGE') || (pageType === 'MODERN_CAST_PAGE')) {
        setInterval(autoRedirect, 1000 * 20);
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
    $(document).on('click', '.link', function() {
        const parentNode = $(this).parent().get(0);
        const parentClass = parentNode.className.split(" ")[1];
        const buttonTypes = {
            'auto_redirect_button': 'autoRedirect',
            'auto_enter_community_button': 'autoEnterCommunity',
            'auto_enter_program_button': 'autoEnterProgram',
        };
        const buttonType = buttonTypes[parentClass];
        if ($(this).hasClass('switch_is_on')) {
            Buttons.toggleOff(buttonType);
            if (buttonType == 'autoEnterCommunity' || buttonType == 'autoEnterProgram') {
                Buttons.removeAsAutoEnter(buttonType);
            }
        } else {
            Buttons.toggleOn(buttonType);
            if (buttonType == 'autoEnterCommunity' || buttonType == 'autoEnterProgram') {
                Buttons.saveAsAutoEnter(buttonType);
            }
        }
    });
});

function enabledOrNull(value) {
    return (value === 'enable') || value == null;
}

function initialize() {
    if (PageType.get() != 'GATE_PAGE')
        _communityId = idHolder.communityId;
}

// TODO: Rename.
function autoRedirect() {
    _broadcastId = idHolder.liveId; // TODO
    if (Buttons.isToggledOn('autoRedirect')) {
        console.log(_broadcastId + ' is enabled auto redirect.');
        isOffAir(_broadcastId).then(function(response) {

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
            isStartedBroadcast(_communityId).then(function(response) {
                // タイマーを無効化
                $('#extended-bar .end-time').text(`放送が終了しました`);
                $('#extended-bar .rest-time').text(`放送が終了しました`);

                console.info('[nicosapo][isStartedBroadcast] = ', response);
                if (response.isStarted) {
                    _broadcastId = response.nextBroadcastId;
                    redirectBroadcastPage(response.nextBroadcastId);
                }
            });
        });
    } else {
        console.log(idHolder.liveId + ' is disabled auto redirect.');
    }
}

function autoEnter() {

}

function redirectBroadcastPage(broadcastId) {
    const endpoint = 'http://live.nicovideo.jp/watch/';
    const broadcastUrl = endpoint + broadcastId;
    window.location.replace(broadcastUrl);
}

function isEnabledAutoRedirect() {
    const data = sessionStorage[this._communityId];

    if (data == undefined) {
        return true;
    }

    const parsedData = JSON.parse(data);

    if (parsedData.enabledAutoRedirect == 'false')
        return false;
}
