const bg = chrome.extension.getBackgroundPage();

class SettingPage
{
    constructor() {
        // do nothing.
    }

    static getAllSettings() {
        var settings = new Object();
        settings['options.popup.enable']           = $('input[name=options-popup-enable]:checked').val();
        settings['options.playsound.enable']       = $('input[name=options-playsound-enable]:checked').val();
        settings['options.soundfile']              = $('#options-soundfile :selected').val();
        settings['options.autoJump.enable'] = $('input[name=options-autoJump-enable]:checked').val();
        console.info('[imanani][getAllSettings] settings = ', settings);
        return settings;
    }

    static setAllSettings() {
        let setting = '';

        setting  = localStorage.getItem('options.popup.enable');
        if (setting != null)
            $('[name=options-popup-enable]').val([setting]);

        setting  = localStorage.getItem('options.playsound.enable');
        if (setting != null)
            $('[name=options-playsound-enable]').val([setting]);

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

    chrome.runtime.sendMessage(
    {
        purpose: 'getFromNestedLocalStorage',
        key: 'autoEnterCommunityList'
    },
    function(response)
    {
        console.info('[imanani][getFromNestedLocalStorage] response = ', response);
        for (let i = 0; i < response.length; i++) {
            let subscribe = $(`<div class="subscribe"><span class="id"></span><span class="name"></span><div class="thumbnail"></div></div>`);
            $(subscribe).find('.id').text(response[i]['key']);
            $(subscribe).find('.name').text("名前");
            $(subscribe).find('.thumbnail').css('background-image', 'url(http://icon.nimg.jp/community/' + response[i]['key'] +'.jpg' + ')');
            $(subscribe).find('.thumbnail').css('background-size', '60px');
            $(subscribe).find('.thumbnail').css('width', '60px');
            $(subscribe).find('.thumbnail').css('height', '60px');
            $('#items2').append(subscribe);
        }

    });
});
