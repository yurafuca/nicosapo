const bg = chrome.extension.getBackgroundPage();

class SettingPage
{
    constructor() {
        // do nothing.
    }

    static getAllSettings() {
        var settings = new Object();
        settings['options.popup.enable']        = $('input[name=options-popup-enable]:checked').val();
        settings['options.showReserved.enable'] = $('input[name=options-showReserved-enable]:checked').val();
        settings['options.playsound.enable']    = $('input[name=options-playsound-enable]:checked').val();
        settings['options.soundfile']           = $('#options-soundfile :selected').val();
        settings['options.playsound.volume']    = $("input[name=options-playsound-volume]").val();
        settings['options.autoJump.enable']     = $('input[name=options-autoJump-enable]:checked').val();
        console.info('[imanani][getAllSettings] settings = ', settings);
        return settings;
    }

    static setAllSettings() {
        let setting = '';

        setting  = localStorage.getItem('options.popup.enable');
        if (setting != null)
            $('[name=options-popup-enable]').val([setting]);

        setting  = localStorage.getItem('options.showReserved.enable');
        if (setting != null)
            $('[name=options-showReserved-enable]').val([setting]);

        setting  = localStorage.getItem('options.playsound.enable');
        if (setting != null)
            $('[name=options-playsound-enable]').val([setting]);

        setting  = localStorage.getItem('options.playsound.volume');
        if (setting != null)
            $('[name=options-playsound-volume]').val([setting]);

        setting  = localStorage.getItem('options.soundfile');
        if (setting != null)
            $('#options-soundfile').val([setting]);

        setting  = localStorage.getItem('options.autoJump.enable');
        if (setting != null)
            $('[name=options-autoJump-enable]').val([setting]);
    }
}

class ResultMessage
{
    constructor() {
        // do nothing.
    }

    static show(mode) {
        var messages = {
            SAVE: '設定を保存しました．',
            RESET: '設定をリセットしました．'
        };
        $('#console').text(messages[mode]);
        setTimeout(function() {
            $('#console').text('');
        }, 1000);
    }
}

$(function()
{
    SettingPage.setAllSettings();

    $(document).on('click','#saveAll',function() {
        const settings = SettingPage.getAllSettings();
        for (key in settings) {
            localStorage.setItem(key, settings[key]);
        };
        ResultMessage.show('SAVE');
    });

    $("#options-soundfile").change(function () {
      $("#options-soundfile option:selected").each(function() {
            new Audio('../sound/' + $(this).val()).play();
      });
    });

    $(document).on('click','.btn-danger',function() {
        const id = $(this).attr('data-id');
        const type = $(this).attr('data-type');
        const keys = {
            community: 'autoEnterCommunityList',
            program: 'autoEnterProgramList'
        }
        chrome.runtime.sendMessage(
        {
            purpose: 'removeFromNestedLocalStorage',
            key: keys[type],
            innerKey: id
        });
        $(this).closest('.listgroup-item').remove();
    });

    $(document).on('click','.soundtest',function() {
        const soundfile = $('#options-soundfile :selected').val();
        const volume    = $("input[name=options-playsound-volume]").val();
        const audio     = new Audio('../sound/' + soundfile);
        audio.volume    = volume;
        audio.play();
    });

    chrome.runtime.sendMessage(
    {
        purpose: 'getFromNestedLocalStorage',
        key: 'autoEnterProgramList'
    },
    function(response)
    {
        console.info('[imanani][getFromNestedLocalStorage] response = ', response);
        if ($.isEmptyObject(response)) {
            let subscribe = $(`
                <div class="listgroup-item clearfix">
                    <span>アイテムがありません</span>
                </div>
            `);
            $('.listgroup-program').append(subscribe);
        }
        // alert((Date.parse(response[id]['openDate'])));
        for (id in response) {
            let subscribe = $(`
                <div class="listgroup-item clearfix">
                  <div class="nudge-down BtnGroup float-right">
                    <a href="#" class="btn btn-sm btn-danger BtnGroup-item" rel="facebox">削除</a>
                  </div>
                  <div class="list-group-text-block float-left">
                    <img alt="" class="avatar" height="40" src="" width="40">
                    <span class="meta-title">
                      <a href="" target="_blank" class="developer-app-name">title</a>
                    </span>
                    <span class="meta-description text-small text-gray">
                      ---
                    </span>
                  </div>
                </div>
            `);
            $(subscribe).find('.id').text(id);
            $(subscribe).find('.developer-app-name').text(response[id]['title']);
            $(subscribe).find('.developer-app-name').attr({href: 'http://live.nicovideo.jp/gate/' + id});
            $(subscribe).find('.list-group-text-block img').attr({src: response[id]['thumbnail']});
            $(subscribe).find('.meta-description').html(
                'openDate: ' + Time.toJpnString(Date.parse(response[id]['openDate'])) +
                ((Date.parse(response[id]['openDate']) < Date.now()) ? '<span class="ended"> ⛔ この番組は終了しました</span>' : '')
            );
            $(subscribe).find('.btn-danger').attr('data-id', id);
            $(subscribe).find('.btn-danger').attr('data-type', 'program');
            // $(subscribe).find('.meta-description').html(response[id]['openDate'] + ' · Owned by <a href="' + response[id]['communityId'] + '">' + response[id]['communityName'] + '</a>');
            $('.listgroup-program').append(subscribe);
        }
    });

    chrome.runtime.sendMessage(
    {
        purpose: 'getFromNestedLocalStorage',
        key: 'autoEnterCommunityList'
    },
    function(response)
    {
        console.info('[imanani][getFromNestedLocalStorage] response = ', response);
        if ($.isEmptyObject(response)) {
            let subscribe = $(`
                <div class="listgroup-item clearfix">
                    <span>アイテムがありません</span>
                </div>
            `);
            $('.listgroup-community').append(subscribe);
        }
        // alert((Date.parse(response[id]['openDate'])));
        for (id in response) {
            let subscribe = $(`
                <div class="listgroup-item clearfix">
                  <div class="nudge-down BtnGroup float-right">
                    <a href="#" class="btn btn-sm btn-danger BtnGroup-item" rel="facebox">削除</a>
                  </div>
                  <div class="list-group-text-block float-left">
                    <img alt="" class="avatar" height="40" src="" width="40">
                    <span class="meta-title">
                      <a href="" target="_blank" class="developer-app-name">title</a>
                    </span>
                    <span class="meta-description text-small text-gray">
                      ---
                    </span>
                  </div>
                </div>
            `);
            $(subscribe).find('.id').text(id);
            $(subscribe).find('.developer-app-name').text(response[id]['title']);
            $(subscribe).find('.developer-app-name').attr({href: 'http://com.nicovideo.jp/community/' + id});
            $(subscribe).find('.list-group-text-block img').attr({src: response[id]['thumbnail']});
            $(subscribe).find('.meta-description').html(response[id]['owner']);
            $(subscribe).find('.btn-danger').attr('data-id', id);
            $(subscribe).find('.btn-danger').attr('data-type', 'community');
            // $(subscribe).find('.meta-description').html(response[id]['openDate'] + ' · Owned by <a href="' + response[id]['communityId'] + '">' + response[id]['communityName'] + '</a>');
            $('.listgroup-community').append(subscribe);
        }
    });
});
