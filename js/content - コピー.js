let _communityId;
let _broadcastId;

class PageType
{
    static isModernCast()
    {
      const re = /http:\/\/live2\.nicovideo\.jp\/watch\/lv([0-9]+)/;
      const url = window.location.href;

      return url.match(re);
    }

    static isStandByPage()
    {   
        const flag = ($('#gates').length === 0) && ($('.gate_title').length > 0);

        if (flag) {
            console.info('isStandByPage');
        }

        return flag;
    }

    static isGatePage()
    {
        const flag = $('#gates').length > 0;

        if (flag) {
            console.info('isGatePage');
        }

        return flag;
    }
}

class Buttons
{
    static make(buttonType)
    {
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
            'autoEnterCommunity': 'このコミュニティ/このコミュニティ/チャンネルが放送を始めたとき自動で枠を新しいタブで開きます．',
            'autoEnterProgram': 'この番組が始まったとき自動で番組を新しいタブで開きます．/ 🔰 登録した番組は設定画面より設定できます． / 🔰 登録数が多いとブラウザやサーバーに負担をかけます．適度にご利用ください．'
        };

        const parms = {
            'data-balloon-pos': 'up',
            'data-balloon-length': 'large',
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

    static toggleOn(buttonType)
    {   
        console.info('[imanani] buttonType = ', buttonType);

        const link = $('.on_off_button').find('.link');

        $(link).addClass('switch_is_on');
        $(link).removeClass('switch_is_off');

        let labels = {
          'autoRedirect': '自動次枠移動',
          'autoEnterCommunity': '(このコミュニティで) 自動入場',
          'autoEnterProgram': '(この番組に) 自動入場',
        };

        $(link).text(labels[buttonType] + 'ON');
    }

    static toggleOff(buttonType)
    {
        console.info('[imanani] buttonType = ', buttonType);

        const link = $('.on_off_button').find('.link');

        $(link).addClass('switch_is_off');
        $(link).removeClass('switch_is_on');

        let labels = {
          'autoRedirect': '自動次枠移動',
          'autoEnterCommunity': '(このコミュニティで) 自動入場',
          'autoEnterProgram': '(この番組に) 自動入場',
        };

        $(link).text(labels[buttonType] + 'OFF');
    }

    static isToggledOn(buttonType)
    {
        const link = $('.on_off_button .link');

        let isToggledOn = $(link).hasClass('switch_is_on');
      
        return isToggledOn;
    }

    static saveAsAutoEnter(type)
    {   
        let id;
        let thumbnail;
        let title;
        let openDate;

        if (type == 'autoEnterCommunity') {
            id = IdGetter.community();
        }
        else if (type == 'autoEnterProgram') {
            id = IdGetter.livePage();
        }

        thumbnail = $('meta[property="og:image"]').attr('content');
        title = $('meta[property="og:title"]').attr('content');
        openDate = $('.kaijo meta[itemprop="datePublished"]').attr("content");

        // console.info('object = ', object);

        Storage.saveToNestedLocalStorage(type + 'List', id, {state: 'initialized', thumbnail: thumbnail, title: title, openDate: openDate});
    }

    static removeAsAutoEnter(type)
    {   
        let id;

        if (type == 'autoEnterCommunity') {
            id = IdGetter.community();
        }
        else if (type == 'autoEnterProgram') {
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

class Storage
{
    static saveToNestedLocalStorage(key, innerKey, innerValue)
    {
        chrome.runtime.sendMessage(
        {
            purpose: 'saveToNestedLocalStorage',
            key: key,
            innerKey: innerKey,
            innerValue: innerValue
        },
        function(response)
        {
            console.info('[imanani][saveToNestedLocalStorage] response = ', response);
        });
    }

    static removeFromNestedLocalStorage(key, innerKey)
    {
        chrome.runtime.sendMessage(
        {
            purpose: 'removeFromNestedLocalStorage',
            key: key,
            innerKey: innerKey
        },
        function(response)
        {
            console.info('[imanani][removeFromNestedLocalStorage] response = ', response);
        });
    }
}

class IdGetter
{
    static livePage()
    {
        const re = /http:\/\/live\.nicovideo\.jp\/watch\/lv([0-9]+)/;
        const url = $('meta[property="og:url"]').attr('content');
        const broadcastId = 'lv' + re.exec(url)[1];
        
        console.info('[imanani][IdGetter.livePage] broadcastId = ', broadcastId);

        return broadcastId;
    }

    static community()
    {
        let communityId;

        const communityUrl = $('meta[property="og:image"]').attr('content');
        const re1 = /http:\/\/icon\.nimg\.jp\/community\/[0-9]+\/([\x21-\x7e]+)\.jpg.*/;

        if (re1.exec(communityUrl)) {
            communityId = re1.exec(communityUrl)[1];
        }
        else {
            const communityUrl = $('.text .smn a').attr('href');
            const regexp = /http:\/\/(com|ch)\.nicovideo\.jp\/(community|channel)\/([\x21-\x7e]+)/;
            communityId = regexp.exec(communityUrl)[3];        
        }

        console.info('[imanani][IdGetter.community] communityId = ', communityId);

        return communityId;
    }
}

$(function()
{ 
  initialize();

  console.info('[imanani] isModernCast = ', PageType.isModernCast());
  console.info('[imanani] div', $('.program-detail div').last());

  if (PageType.isStandByPage()) {
    const button = Buttons.make('autoRedirect');
          button.css('display', 'block');
    const link = $(button).find('.link');
          link.css('display', 'block');
          link.css('padding', '6px');
          link.css('font-size', '15px');
    $('.program-title').css('display', 'inline');
    $('.infobox').prepend(button);
  }
  else if (PageType.isGatePage()) {
    const button = Buttons.make('autoEnterProgram');
    $('.gate_title').prepend(button);
    $('.program-title').css('display', 'inline-block');
    $('.program-title').css('text-overflow', 'ellipsis');
    $('.program-title').css('width', '754px');
    $('.program-title').attr('title', $('.program-title').text());
    chrome.runtime.sendMessage(
    {
        purpose: 'getFromNestedLocalStorage',
        key: 'autoEnterProgramList'
        },
        function(response)
        {
        if (response[IdGetter.livePage()]) {
            Buttons.toggleOn('autoEnterProgram');
        }
        else {
          Buttons.toggleOff('autoEnterProgram');
        }
    });
  }
  else if (PageType.isModernCast()) {
    const button = Buttons.make('autoRedirect');
    $('.program-detail div').last().append(button);
  }
  else {
    const button = Buttons.make('autoRedirect');
    $('.meta').append(button);
    chrome.runtime.sendMessage(
    {
        purpose: 'getFromLocalStorage',
        key: 'options.autoJump.enable'
        },
        function(response)
        {
        if (enabledOrNull(response)) {
            Buttons.toggleOn('autoRedirect');
        }
        else {
          Buttons.toggleOff('autoRedirect');
        }
    });
}

  setInterval(autoRedirect, 1000 * 15);
});

$(function()
{
    $(document).on('click','.link',function() {
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
        }
        else {
            Buttons.toggleOn(buttonType);
            if (buttonType == 'autoEnterCommunity' || buttonType == 'autoEnterProgram') {
                Buttons.saveAsAutoEnter(buttonType);
            }
        }
    });
});

function enabledOrNull(value)
{
  return (value === 'enable') || value == null;
}

function initialize()
{
    if (!PageType.isGatePage())
  _communityId = IdGetter.community();
  _broadcastId = IdGetter.livePage();
}

// TODO: Rename.
function autoRedirect()
{
  if (Buttons.isToggledOn('autoRedirect')) {
    console.log(_broadcastId + ' is enabled auto redirect.');

    isOffAir(_broadcastId).then(function(isOffAir) {
      // ONAIR.
      if (!isOffAir) return;

      // OFFAIR.
      isStartedBroadcast(_communityId).then(function(response) {
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

function autoEnter()
{
    
}

function redirectBroadcastPage(broadcastId)
{
  const endpoint     = 'http://live.nicovideo.jp/watch/';
  const broadcastUrl = endpoint + broadcastId;
  window.location.replace(broadcastUrl);
}

function isEnabledAutoRedirect()
{
    const data = sessionStorage[this._communityId];

    if (data == undefined) {
        return true;
    }

    const parsedData = JSON.parse(data);

    if (parsedData.enabledAutoRedirect == 'false')
        return false;
}