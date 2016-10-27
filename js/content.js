// $(document).ready(function() {
//     $("#testFrame").load(function() {
//         var doc = this.contentDocument || this.contentWindow.document;
//         var target = doc.getElementById("target");
//         target.innerHTML = "Found It!";
//     });
// });

$(function()
{
    let switch_button = $(`
        <span clas="switch_button">
            <a class="favorite_link switch_link"></a>
        </span>
    `);

    $('.meta').append(switch_button);

    switchOn();

    chrome.runtime.sendMessage({
        purpose: 'requestChromeTab',
        url: window.location.href
    });
});


$(function()
{
    $(document).on('click','.switch_link',function() {
        if ($(this).hasClass('switch_is_on'))
            switchOff();
        else
            switchOn();
    });
});

function switchOn()
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

    removeFromLocalStorage(getCommunityId());
}

function switchOff()
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

    const data = {enabledAutoRedirect: false};
    saveToLocalstorage(getCommunityId(), JSON.stringify(data));
}


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
        console.log('content: received');

    if (request.purpose == 'sendChromeTab') {
        const re = /http:\/\/live\.nicovideo\.jp\/watch\/lv([0-9]+)/;
        console.info(re.exec(request.tab.url)[1]);
        let tabId = request.tab.id;
        let broadcastId = 'lv' + re.exec(request.tab.url)[1];
        let communityId = getCommunityId();
        console.log('tabId: ' + tabId);
        console.log('communityId: ' + communityId);
        console.log('broadcastIdId: ' + broadcastId);
        chrome.runtime.sendMessage({
            purpose: 'sendInformationOfBroadcastTab',
            tabId: tabId,
            communityId: communityId,
            broadcastId: broadcastId
        });
    }
  });

function getCommunityId()
{
    // For some reason, this selecter gets two of communityInfo.
    // Maibe, commynityInfos[0] is most is much the same as communityInfos[1].
    let communityInfos = $('.meta a.commu_name');
    let communityUrl = communityInfos.attr('href');
    let re = /http:\/\/com\.nicovideo\.jp\/community\/([\x21-\x7e]+)/;
    let communityId = re.exec(communityUrl)[1];
    console.info(communityInfos);
    console.info(communityId);
    return communityId;
}

function saveToLocalstorage(key, value)
{
    chrome.runtime.sendMessage({
        purpose: 'saveToLocalstorage',
        key: key,
        value: value
    });
}

function removeFromLocalStorage(key)
{
    chrome.runtime.sendMessage({
        purpose: 'removeFromLocalStorage',
        key: key,
    });
}
