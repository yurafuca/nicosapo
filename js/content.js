// $(document).ready(function() {
//     $("#testFrame").load(function() {
//         var doc = this.contentDocument || this.contentWindow.document;
//         var target = doc.getElementById("target");
//         target.innerHTML = "Found It!";
//     });
// });

$(function()
{
    chrome.runtime.sendMessage({
        purpose: 'requestChromeTab',
        url: window.location.href
    });
});

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

function saveToLocalstorage(communityId, boolean)
{
    localStorge[communityId] = boolean;
}
