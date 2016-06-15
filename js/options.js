class SettingPage
{
    constructor() {
        // do nothing.
    }

    static getAllSettings() {
        var settings = new Object();
        settings['options.popup.enable']        = $('input[name=options-popup-enable]:checked').val();
        settings['options.playsound.enable']    = $('input[name=options-playsound-enable]:checked').val();
        settings['options.soundfile']           = $('#options-soundfile :selected').val();
        console.log(settings);
        return settings;
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
});
