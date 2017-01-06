class Buttons
{
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
