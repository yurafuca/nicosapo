export default class NicoLive
{
    constructor() {
        // do nothing.
    }

    static getIdAndHash() {
        var promise = new Promise((resolve, reject) => {
            const posting = $.post("http://live.nicovideo.jp/api/getalertinfo");

            posting.done(function(response) {
                var status = $(response).find('getalertstatus').attr('status');
                switch (status) {
                    case "ok":
                        const result = {};
                        result.id = $(response).find('user_id').text();
                        result.hash = $(response).find('user_hash').text();
                        result.addr = $(response).find('addr').text();
                        result.port = $(response).find('port').text();
                        result.thread = $(response).find('thread').text();
                        console.info('result = ', result);
                        NicoLive.getCommunityList(result.addr, result.port, result.thread);
                        resolve(result);
                        break;
                    case "fail":
                        reject(new Error('Request failed: status is "fail".'));
                        break;
                }
            });
        });

        return promise;
    }


    static getCommunityList(addr, port, thread) {
        var promise = new Promise((resolve, reject) => {
            let xmlData = '<thread thread=' + thread + '" version="20061206" res_from="-1"/>'
            let request = $.ajax({
                url: 'http://alert.nicovideo.jp/front/getcommunitylist',
                method: 'POST',
                data: xmlData
            });

            request.done(function(response) {
                console.info(response);
                resolve(videoInfos);
            });

            request.fail(function(jqXHR, textStatus) {
                reject(new Error('Request failed: ' + textStatus));
            });
        });

        return promise;
    }

    // // Process: 2
    // static getCommunityList(userId, userHash) {
    //     var promise = new Promise((resolve, reject) => {
    //         const posting = $.post("http://alert.nicovideo.jp/front/getcommunitylist", {
    //             user_id: userId,
    //             user_hash: userHash
    //         });

    //         posting.done(function(response) {
    //             console.info(response);
    //             var status = $(response).find('getalertstatus').attr('status');
    //             switch (status) {
    //                 case "ok":
    //                     resolve(result);
    //                     break;
    //                 case "fail":
    //                     reject(new Error('Request failed: status is "fail".'));
    //                     break;
    //             }
    //         });
    //     });

    //     return promise;
    // }
}
