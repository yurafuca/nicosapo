let _communityId;
let _broadcastId;
const timeCounter = new TimeCounter(new Date());

class PageType {
    static get() {
        if (this._isModernCast()) {
            return 'MODERN_CAST_PAGE';
        }

        if (this._isStandByPage()) {
            return 'STAND_BY_PAGE';
        }

        if (this._isGatePage()) {
            return 'GATE_PAGE';
        }

        if (this._isCommunityPage()) {
            return 'COMMUNITY_PAGE';
        }

        if (this._isChannelPage()) {
            return 'CHANNEL_PAGE';
        }

        if (this._isOfficialCastPage()) {
            return 'OFFICIAL_CAST_PAGE';
        }

        return 'NORMAL_CAST_PAGE';
    }

    static _isModernCast() {
        const re = /http:\/\/live2\.nicovideo\.jp\/watch\/lv([0-9]+)/;
        const url = window.location.href;

        return url.match(re);
    }

    static _isStandByPage() {
        const flag = ($('#gates').length === 0) && ($('.gate_title').length > 0);

        if (flag) {
            console.info('isStandByPage');
        }

        return flag;
    }

    static _isGatePage() {
        const flag = $('#gates').length > 0;

        if (flag) {
            console.info('isGatePage');
        }

        return flag;
    }

    static _isCommunityPage() {
        const $targetDom = $('table.communityDetail');
        if ($targetDom.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    static _isChannelPage() {
        const $targetDom = $('body#channel_top');
        if ($targetDom.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    static _isOfficialCastPage() {
        const $targetDom = $('#page.official');
        if ($targetDom.length > 0) {
            return true;
        } else {
            return false;
        }
    }
}

class Buttons {
    static make(buttonType) {
        const button = $(`
            <span class="on_off_button">
                <a class="link"></a>
            </span>
        `);

        const classes = {
            'autoRedirect': 'auto_redirect_button',
            'autoEnterCommunity': 'auto_enter_community_button',
            'autoEnterProgram': 'auto_enter_program_button'
        };

        const tips = {
            'autoRedirect': 'このページを開いたままにしておくと，新しい枠で放送が始まったとき自動で枠へ移動します',
            'autoEnterCommunity': 'このコミュニティ・チャンネルが放送を始めたとき自動で枠を新しいタブで開きます．[⚠️負荷軽減のため最大登録数は5を目安にしてください] [💡自動次枠移動が ON の状態でも移動先の枠が新しいタブで開かれます]',
            'autoEnterProgram': 'この番組が始まったとき自動で番組を新しいタブで開きます．[⚠️負荷軽減のため最大登録数は5を目安にしてください] [💡登録した番組は設定画面より設定できます]'
        };

        const parms = {
            'data-balloon-pos': 'up',
            'data-balloon-length': 'xlarge',
            'data-balloon': tips[buttonType]
        };

        const balloon = $(button).find('.link');

        $(button).addClass(classes[buttonType]);

        for (let parmName in parms) {
            $(balloon).attr(parmName, parms[parmName]);
        }

        $('#watch_title_box .meta').css('overflow', 'visible');

        console.info(button);

        return button;
    }

    static toggleOn(buttonType) {
        console.info('[imanani] buttonType = ', buttonType);

        const classes = {
            'autoRedirect': 'auto_redirect_button',
            'autoEnterCommunity': 'auto_enter_community_button',
            'autoEnterProgram': 'auto_enter_program_button'
        };

        const link = $('.' + classes[buttonType]).find('.link');

        console.debug(classes[buttonType]);

        $(link).addClass('switch_is_on');
        $(link).removeClass('switch_is_off');

        let labels = {
            'autoRedirect': '自動次枠移動',
            'autoEnterCommunity': '(このコミュニティに) 自動入場',
            'autoEnterProgram': '(この番組に) 自動入場',
        };

        $(link).text(labels[buttonType] + 'ON');
    }

    static toggleOff(buttonType) {
        console.info('[imanani] buttonType = ', buttonType);

        const classes = {
            'autoRedirect': 'auto_redirect_button',
            'autoEnterCommunity': 'auto_enter_community_button',
            'autoEnterProgram': 'auto_enter_program_button'
        };

        const link = $('.' + classes[buttonType]).find('.link');

        $(link).addClass('switch_is_off');
        $(link).removeClass('switch_is_on');

        let labels = {
            'autoRedirect': '自動次枠移動',
            'autoEnterCommunity': '(このコミュニティに) 自動入場',
            'autoEnterProgram': '(この番組に) 自動入場',
        };

        $(link).text(labels[buttonType] + 'OFF');
    }

    static isToggledOn(buttonType) {
      const classes = {
          'autoRedirect': 'auto_redirect_button',
          'autoEnterCommunity': 'auto_enter_community_button',
          'autoEnterProgram': 'auto_enter_program_button'
      };

      const link = $('.' + classes[buttonType]).find('.link');

        let isToggledOn = $(link).hasClass('switch_is_on');

        return isToggledOn;
    }

    static saveAsAutoEnter(type) {
        let id;
        let thumbnail;
        let title;
        let openDate;
        let owner;

        if (type == 'autoEnterCommunity') {
            id = IdGetter.community();
        } else if (type == 'autoEnterProgram') {
            id = IdGetter.livePage();
        }

        thumbnail = $('meta[property="og:image"]').attr('content');

        if (type == 'autoEnterProgram') {
          title = $('meta[property="og:title"]').attr('content');
          openDate = $('.kaijo meta[itemprop="datePublished"]').attr("content");
        }

        if (type == 'autoEnterCommunity') {
            const pageType = PageType.get();
            if (pageType === 'COMMUNITY_PAGE') {
                title = $('div.communityData > h2.title > a').text().replace(/[ ]/, '');
                owner = $('div.communityData tr.row:first-child > td.content > a').text().replace(/[ ]/, '');
            } else if (pageType === 'CHANNEL_PAGE') {
                title = $('h3.cp_chname').text();
                owner = $('p.cp_viewname').text();
            } else {
                title = $($('.commu_info').find('a').get(0)).html();
                owner = $('.nicopedia_nushi').find('a').text();
            }
        }


        // console.info('object = ', object);

        Storage.saveToNestedLocalStorage(type + 'List', id, {
            state: 'initialized',
            thumbnail: thumbnail,
            title: title,
            openDate: openDate,
            owner: owner
        });
    }

    static removeAsAutoEnter(type) {
        let id;

        if (type == 'autoEnterCommunity') {
            id = IdGetter.community();
        } else if (type == 'autoEnterProgram') {
            id = IdGetter.livePage();
        }

        const object = {
            id: id,
            status: 'initialized'
        };

        // console.info('object = ', object);

        Storage.removeFromNestedLocalStorage(type + 'List', id);
    }
}

class Storage {
    static saveToNestedLocalStorage(key, innerKey, innerValue) {
        console.debug(innerValue);
        chrome.runtime.sendMessage({
                purpose: 'saveToNestedLocalStorage',
                key: key,
                innerKey: innerKey,
                innerValue: innerValue
            },
            function(response) {
                console.info('[imanani][saveToNestedLocalStorage] response = ', response);
            });
    }

    static removeFromNestedLocalStorage(key, innerKey) {
        chrome.runtime.sendMessage({
                purpose: 'removeFromNestedLocalStorage',
                key: key,
                innerKey: innerKey
            },
            function(response) {
                console.info('[imanani][removeFromNestedLocalStorage] response = ', response);
            });
    }
}

class IdGetter {
    static livePage() {
        const re = /http:\/\/live\.nicovideo\.jp\/watch\/lv([0-9]+)/;
        const url = $('meta[property="og:url"]').attr('content');
        const broadcastId = 'lv' + re.exec(url)[1];

        console.info('[imanani][IdGetter.livePage] broadcastId = ', broadcastId);

        return broadcastId;
    }

    static community() {
        let communityId;

        const communityUrl = $('meta[property="og:image"]').attr('content');
        const re1 = /http:\/\/icon\.nimg\.jp\/(community|channel).*((ch|co)[0-9]+)\.jpg.*/;

        // http://icon.nimg.jp/channel/ch2624645.jpg?1471454763
        //

        if (re1.exec(communityUrl)) {
            communityId = re1.exec(communityUrl)[2];
        } else {
            // const communityUrl = $('.text .smn a').attr('href');
            // const regexp = /http:\/\/(com|ch)\.nicovideo\.jp\/(community|channel)\/([\x21-\x7e]+)/;
            // communityId = regexp.exec(communityUrl)[3];

            const communityUrl = $('a.ch_name').attr('href');
            const regexp = /http:\/\/(com|ch)\.nicovideo\.jp\/(community|channel)\/([\x21-\x7e]+)/;
            communityId = regexp.exec(communityUrl)[3];

        }

        console.info('[imanani][IdGetter.community] communityId = ', communityId);

        return communityId;
    }
}

class FormatNicoPage {
    static exec(pageType) {
        if (pageType == 'STAND_BY_PAGE') {
            $('.program-title').css('display', 'inline');
            return;
        }

        if (pageType == 'GATE_PAGE') {
            $('.program_icon').css('float', 'none');
            $('.program_icon').css('display', 'inline-block');
            $('.program-title').css('display', 'inline-block');
            // $('.program-title').css('text-overflow', 'ellipsis');
            // $('.program-title').css('width', '754px');
            $('.program-title').attr('title', $('.program-title').text());
            return;
        }

        if (pageType == 'MODERN_CAST_PAGE') {
            // Do nothing.
        }

        if (pageType == 'NORMAL_CAST_PAGE' || pageType == 'OFFICIAL_CAST_PAGE') {
            $('#watch_title_box .meta').css('width', '1000px');

            // For ExtendedBar
            $('#slider_container').css('padding', '0');
        }
    }
}

$(function() {
    initialize();

    console.info('[imanani] pageType = ', PageType.get());
    console.info('[imanani] div', $('.program-detail div').last());

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

    FormatNicoPage.exec(pageType);

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
                    if (response[IdGetter.livePage()]) {
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
                    if (response[IdGetter.community()]) {
                        Buttons.toggleOn('autoEnterCommunity');
                    } else {
                        Buttons.toggleOff('autoEnterCommunity');
                    }
                }
            );
            getStatusByBroadcast(IdGetter.livePage()).then(function(response) {

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
                    if (response[IdGetter.livePage()]) {
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
                    if (response[IdGetter.community()]) {
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
        _communityId = IdGetter.community();
}

// TODO: Rename.
function autoRedirect() {
    _broadcastId = IdGetter.livePage(); // TODO
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

                console.info('[imanani][isStartedBroadcast] = ', response);
                if (response.isStarted) {
                    _broadcastId = response.nextBroadcastId;
                    redirectBroadcastPage(response.nextBroadcastId);
                }
            });
        });
    } else {
        console.log(IdGetter.livePage() + ' is disabled auto redirect.');
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
