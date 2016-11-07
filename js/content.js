let _communityId;
let _broadcastId;

$(function()
{ 
  initialize();

  let switch_button = $(`
      <span clas="switch_button">
          <a class="switch_link"></a>
      </span>
  `);

  let switch_link = $(switch_button).find('.switch_link');
      switch_link.css('color', 'white');
      switch_link.css('border-radius', '2px');
      switch_link.css('font-size', '12px');
      switch_link.css('padding', '2px 10px');
      switch_link.css('text-decoration', 'none');
  $(switch_button).css('display', 'inline-block');
  $(switch_button).css('text-align', 'center');


  console.info('[imanani] isModernCast = ', isModernCast());
  console.info('[imanani] div', $('.program-detail div').last());

  if (isGatePage()) {
    switch_link.css('display', 'block');
    switch_link.css('padding', '6px');
    switch_button.css('display', 'block');
    switch_link.css('font-size', '15px');
    $('.program-title').css('display', 'inline');
    // $('.gate_title').prepend(switch_button);
    $('.infobox').prepend(switch_button);
  }
  else if (isModernCast()) {
    $('.program-detail div').last().append(switch_button);
  }
  else {
    $('.meta').append(switch_button);
    // $('.livetag_box').after(switch_button);
  }

  chrome.runtime.sendMessage(
  {
    purpose: 'getFromLocalStorage',
    key: 'options.autoJump.enable'
  },
  function(response)
  {
    if (enabledOrNull(response))
      toggleOn();
    else
      toggleOff();
  });

  // setInterval(autoRedirect, 1000 * 15);
});

$(function()
{
    $(document).on('click','.switch_link',function() {
        if ($(this).hasClass('switch_is_on'))
            toggleOff();
        else
            toggleOn();
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

function isModernCast()
{
  const re = /http:\/\/live2\.nicovideo\.jp\/watch\/lv([0-9]+)/;
  const url = window.location.href;

  return url.match(re);
}

function isGatePage()
{
  console.info('[imamani][isGatePage] isGatePage = ', $('.gate_title').length);
  return $('.gate_title').length;
}

// TODO: Rename.
function autoRedirect()
{
  if (isToggledOn()) {
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

function toggleOn()
{   
    let switch_link = $('.switch_link');

    $(switch_link).addClass('switch_is_on');
    $(switch_link).removeClass('switch_is_off');

    $(switch_link).text('自動次枠移動ON');
    $(switch_link).css('background-image', 'linear-gradient(to bottom,#DC7519,#C63D1B)');
    $(switch_link).css('border-color', '#A71903'); //F5C63C

    $(switch_link).hover(
        function() {
            $(switch_link).css('background-image', 'linear-gradient(to bottom,#FE8900,#FF6101)');
            $(switch_link).css('cursor', 'pointer');
        },
        function() {
            $(switch_link).css('background-image', 'linear-gradient(to bottom,#DC7519,#C63D1B)');
            $(switch_link).css('cursor', 'auto');
        }
    );
}

function toggleOff()
{
    let switch_link = $('.switch_link');

    $(switch_link).addClass('switch_is_off');
    $(switch_link).removeClass('switch_is_on');

    $(switch_link).text('自動次枠移動OFF');
    $(switch_link).css('background-image', 'linear-gradient(to bottom,#444,#222)');
    $(switch_link).css('border-color', '#000'); //F5C63C
    $(switch_link).hover(
        function() {
            $(switch_link).css('background-image', 'linear-gradient(to bottom,#666,#444)');
            $(switch_link).css('cursor', 'pointer');
        },
        function() {
            $(switch_link).css('background-image', 'linear-gradient(to bottom,#444,#222)');
            $(switch_link).css('cursor', 'auto');
        }
    );
}

function isToggledOn()
{
  const isToggledOn = $('.switch_link').hasClass('switch_is_on');
  
  return isToggledOn;
}

function isOffAir(broadcastId)
{
  return new Promise(function(resolve, reject) {
    getStatusByBroadcast(broadcastId).then(function(response) {
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
    getStatusByCommunity(communityId).then(function(response) {
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

function getStatusByBroadcast(broadcastId)
{
  return new Promise(function(resolve, reject) {
    getStatus(broadcastId).then(function(response) {
      if(response)
        resolve(response);
      else
        reject();
    }); 
  });
}


function getStatusByCommunity(communityId)
{
  return new Promise(function(resolve, reject) {
    getStatus(communityId).then(function(response) {
      if(response)
        resolve(response);
      else
        reject();
    }); 
  });
}

function getStatus(param)
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
