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
      // console.info('[imamani][isStandByPage] isStandByPage = ', $('.gate_title').length);
      // return $('.gate_title').length;
        if (location.href.match(/gate\/([lc][ohv][0-9]+)/i))
            return false;

        if ($('.gate_title').length > 0)
            return true;

        return false;
    }

    static isGatePage()
    {
        return location.href.match(/gate\/([lc][ohv][0-9]+)/i);
    }
}

class Api
 {
    static getStatusByBroadcast(broadcastId)
    {
      return new Promise(function(resolve, reject) {
        Api.getStatus(broadcastId).then(function(response) {
          if(response)
            resolve(response);
          else
            reject();
        }); 
      });
    }

    static getStatusByCommunity(communityId)
    {
      return new Promise(function(resolve, reject) {
        Api.getStatus(communityId).then(function(response) {
          if(response)
            resolve(response);
          else
            reject();
        }); 
      });
    }

    static getStatus(param)
    {
      return new Promise(function(resolve, reject) {
        const endpoint = "http://watch.live.nicovideo.jp/api/getplayerstatus?v=";
        const posting  = $.get(endpoint + param);

        posting.done(function(response) {
          let status = $(response).find('getplayerstatus').attr('status');
          console.info('[imanani][getStatus] response = ', response);
          resolve(response);
        });
      });
    }
}

class Buttons
{
    static toggleOn(buttonType)
    {   
        let link;

        console.info('[imanani] buttonType = ', buttonType);

        let links = {
          'autoRedirect': $('.auto_redirect_button').find('.link'),
          'autoEnterCommunity': $('.auto_enter_community_button').find('.link'),
          'autoEnterProgram': $('.auto_enter_program_button').find('.link'),
        };

        link = links[buttonType];

        $(link).addClass('switch_is_on');
        $(link).removeClass('switch_is_off');

        let labels = {
          'autoRedirect': '自動次枠移動',
          'autoEnterCommunity': '(このコミュニティで) 自動入場',
          'autoEnterProgram': '(この番組に) 自動入場',
        };

        $(link).text(labels[buttonType] + 'ON');
        $(link).css('background-image', 'linear-gradient(to bottom,#DC7519,#C63D1B)');
        $(link).css('border-color', '#A71903'); //F5C63C

        $(link).hover(
            function() {
                $(link).css('background-image', 'linear-gradient(to bottom,#FE8900,#FF6101)');
                $(link).css('cursor', 'pointer');
            },
            function() {
                $(link).css('background-image', 'linear-gradient(to bottom,#DC7519,#C63D1B)');
                $(link).css('cursor', 'auto');
            }
        );
    }

    static toggleOff(buttonType)
    {
        let link;

        let links = {
          'autoRedirect': $('.auto_redirect_button').find('.link'),
          'autoEnterCommunity': $('.auto_enter_community_button').find('.link'),
          'autoEnterProgram': $('.auto_enter_program_button').find('.link'),
        };

        link = links[buttonType];

        $(link).addClass('switch_is_off');
        $(link).removeClass('switch_is_on');

        let labels = {
          'autoRedirect': '自動次枠移動',
          'autoEnterCommunity': '(このコミュニティで) 自動入場',
          'autoEnterProgram': '(この番組に) 自動入場',
        };

        $(link).text(labels[buttonType] + 'OFF');
        $(link).css('background-image', 'linear-gradient(to bottom,#444,#222)');
        $(link).css('border-color', '#000'); //F5C63C
        $(link).hover(
            function() {
                $(link).css('background-image', 'linear-gradient(to bottom,#666,#444)');
                $(link).css('cursor', 'pointer');
            },
            function() {
                $(link).css('background-image', 'linear-gradient(to bottom,#444,#222)');
                $(link).css('cursor', 'auto');
            }
        );
    }

    static isToggledOn(buttonType)
    {
        let link;

        let links = {
          'autoRedirect': $('.auto_redirect_button').find('.link'),
          'autoEnterCommunity': $('.auto_enter_community_button').find('.link'),
          'autoEnterProgram': $('.auto_enter_program_button').find('.link'),
        };

        link = links[buttonType];

        let isToggledOn = $(link).hasClass('switch_is_on');
      
        return isToggledOn;
    }

    static saveAsAutoEnter(type)
    {   
        let id;

        if (type == 'autoEnterCommunity') {
            id = getCommunityId();
        }
        else if (type == 'autoEnterProgram') {
            id = getBroadcastId();
        }

        // console.info('object = ', object);

        Storage.saveToNestedLocalStorage(type + 'List', id, 'initialized');
    }

    static removeAsAutoEnter(type)
    {   
        let id;

        if (type == 'autoEnterCommunity') {
            id = getCommunityId();
        }
        else if (type == 'autoEnterProgram') {
            id = getBroadcastId();
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


$(function()
{ 
  initialize();

  let autoRedirectButton = makeButton('autoRedirect');
  let autoEnterProgramButton = makeButton('autoEnterProgram');
  let autoEnterCommunityButton = makeButton('autoEnterCommunity');

  console.info('[imanani] isModernCast = ', PageType.isModernCast());
  console.info('[imanani] div', $('.program-detail div').last());

  if (PageType.isStandByPage()) {
    autoRedirectButton.css('display', 'block');
    let link = $(autoRedirectButton).find('.link');
        link.css('display', 'block');
        link.css('padding', '6px');
        link.css('font-size', '15px');
    $('.program-title').css('display', 'inline');
    $('.infobox').prepend(autoRedirectButton);
  }
  else if (PageType.isGatePage()) {
    autoRedirectButton.css('display', 'block');
    let link = $(autoRedirectButton).find('.link');
        link.css('display', 'block');
        link.css('padding', '6px');
        link.css('font-size', '15px');
    $('.program-title').css('display', 'inline');
    $('.infobox').prepend(autoEnterProgramButton);
  }
  else if (PageType.isModernCast()) {
    $('.program-detail div').last().append(autoRedirectButton);
    $('.program-detail div').last().append(autoEnterCommunityButton);
  }
  else {
    $('.meta').append(autoRedirectButton);
    $('.meta').append(autoEnterCommunityButton);
  }

  chrome.runtime.sendMessage(
  {
    purpose: 'getFromLocalStorage',
    key: 'options.autoJump.enable'
  },
  function(response)
  {
    if (enabledOrNull(response)) {
        Buttons.toggleOn('autoRedirect');
        Buttons.toggleOff('autoEnterCommunity');
        Buttons.toggleOff('autoEnterProgram');
    }
    else {
      Buttons.toggleOff('autoRedirect');
      Buttons.toggleOff('autoEnterCommunity');
      Buttons.toggleOff('autoEnterProgram');
    }
  });

  setInterval(autoRedirect, 1000 * 15);
});

$(function()
{
    $(document).on('click','.link',function() {
        const parentNode = $(this).parent().get(0);
        const parentClass = parentNode.className.split(" ")[0];
        const buttonTypes = {
          'auto_redirect_button': 'autoRedirect',
          'auto_enter_community_button': 'autoEnterCommunity',
          'auto_enter_program_button': 'autoEnterProgram',
        };
        const buttonType = buttonTypes[parentClass];
        // console.info('[imanani] parentNode = ', parentNode);
        // console.info('[imanani] parentClass = ', parentClass);
        // console.info('[imanani] buttonType = ', buttonTypes[parentClass]);
        // console.info('[imanani] this = ', $(this));
        // console.info('[imanani] switch_is_on = ', $(this).hasClass('switch_is_on'));
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

function enabledOrNull(value) {
  return (value === 'enable') || value == null;
}

function initialize()
{
  _communityId = getCommunityId();
  _broadcastId = getBroadcastId();
}

function makeButton(buttonType)
{
  const buttons = {
    'autoRedirect': $(`<span class="auto_redirect_button">
        <a class="link" data-balloon="ON にすると新しい枠で放送が始まったとき自動でその枠へ移動します．" data-balloon-pos="up" data-balloon-length="large"></a>
        </span>`),
    'autoEnterCommunity': $(`<span class="auto_enter_community_button">
        <a class="link" data-balloon="ON にするとこのコミュニティ/チャンネルが放送を始めたときその枠を新しいタブで開きます．
        自動入場リストの管理は設定画面よりおこなえます．" data-balloon-pos="up" data-balloon-length="large"></a>
        </span>`),
    'autoEnterProgram': $(`<span class="auto_enter_program_button">
        <a class="link" data-balloon="ON にするとこの番組が始まったとき新しいタブでその番組を開きます．
        自動入場リストの管理は設定画面よりおこなえます．" data-balloon-pos="up" data-balloon-length="large"></a></span>`)
  };

  const tips = {
    'autoRedirect': 'ONにすると新しい枠で放送が始まったとき自動でその枠へ移動します',
    'autoEnterCommunity': 'ONにするとこの<strong>コミュニティ/チャンネル</strong>が放送を始めたときその枠を新しいタブで開きます．<br>自動入場リストの管理は設定画面よりおこなえます．',
    'autoEnterProgram': 'ONにするとこの<strong>番組</strong>が始まったとき新しいタブでその番組を開きます．<br>自動入場リストの管理は設定画面よりおこなえます．'
  };

  const button = buttons[buttonType];
        $(button).css('display', 'inline-block');
        $(button).css('text-align', 'center');

  const link = $(button).find('.link');
        link.css('color', 'white');
        link.css('border-radius', '2px');
        link.css('font-size', '12px');
        link.css('padding', '2px 10px');
        link.css('margin-left', '5px');
        link.css('text-decoration', 'none');

    button.data('powertip', tips[buttonType]);
    button.powerTip({
        fadeInTime: 30,
        fadeOutTime: 30,
        closeDelay: 0,
        intentPollInterval: 0
    });

    $('#watch_title_box .meta').css('overflow', 'visible');

    // $(button).data('balloon', 'tips[buttonType]');
    // $(button).data('balloon-pos', 'up');
    // $('span').data('balloon', 'tips[buttonType]');
    // $('span').data('balloon-pos', 'up');
    // $('button[data-balloon]').css('z-index', '9999');
    // $('button[data-balloon]').css('position', 'absolute');
    return button;
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
      console.log(getBroadcastId() + ' is disabled auto redirect.');
  }
}

function autoEnter()
{
  //
}

function isOffAir(broadcastId)
{
  return new Promise(function(resolve, reject) {
    Api.getStatusByBroadcast(broadcastId).then(function(response) {
      const errorCode = $(response).find('error code').text();

      // OFFAIR or ERROR.
      if (errorCode) {
         switch(errorCode) {
           case 'closed':
             console.log(_broadcastId + ' is OFFAIR');
             resolve(true);
             return;
           case 'error':
             console.log(_broadcastId + ' is ERROR.');
             reject();
             return;
         }
      }

      // ONAIR
      const broadcastId = $(response).find('stream id').text();
      console.log(broadcastId + ' is ONAIR');
      resolve(false);
    });
  });
}

function isStartedBroadcast(communityId)
{
  return new Promise(function(resolve, reject) {
    Api.getStatusByCommunity(communityId).then(function(response) {
      const errorCode = $(response).find('error code').text();
      const result = {
        isStarted: undefined,
        nextBroadcastId: undefined
      };

      // OFFAIR or ERROR.
      if (errorCode) {
         switch(errorCode) {
           case 'closed':
             console.log(_communityId + ' is NOT_READY');
             result.isStarted = false;
             resolve(result);
             return;
           case 'error':
             console.log(_communityId + ' is ERROR.');
             reject();
             return;
         }
      }

      // OFFAIR or ONAIR.
      const endTime = $(response).find('end_time').text();

      if (Date.now() < (endTime + '000')) {
        console.log($(response).find('stream id').text() + ' is NOW_OPEND.');
        result.isStarted = true;
        result.nextBroadcastId = $(response).find('stream id').text();
      } else {
        console.log('foobar');
        console.log('[imanani][isStartedBroadcast] Date.now = ' + Date.now());
        console.log('[imanani][isStartedBroadcast] endTime = ' + endTime + '000');
        console.log(_communityId + ' is NOT_READY.');
        result.isStarted = false;
      }

      resolve(result);
    });
  });
}

function getBroadcastId()
{
  const re = /http:\/\/live\.nicovideo\.jp\/watch\/lv([0-9]+)/;
  // const url = window.location.href;
  const url = $('meta[property="og:url"]').attr('content');
  const broadcastId = 'lv' + re.exec(url)[1];
    console.info('[imanani][getBroadcastId] broadcastId = ', broadcastId);

  return broadcastId;
}

function getCommunityId()
{
    // For some reason, this selecter gets two of communityInfo.
    // Maibe, commynityInfos[0] is most is much the same as communityInfos[1].
    // let communityInfos = $('.meta a.commu_name');
    // let communityUrl = communityInfos.attr('href');
    // let re = /http:\/\/com\.nicovideo\.jp\/community\/([\x21-\x7e]+)/;
    // let communityId = re.exec(communityUrl)[1];
    const communityUrl = $('meta[property="og:image"]').attr('content');
    const re = /http:\/\/icon\.nimg\.jp\/community\/[0-9]+\/([\x21-\x7e]+)\.jpg.*/;
    const communityId = re.exec(communityUrl)[1];
    console.info('[imanani][getCommunityId] communityId = ', communityId);

    return communityId;
}

function redirectBroadcastPage(broadcastId)
{
  const endpoint = 'http://live.nicovideo.jp/watch/';
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