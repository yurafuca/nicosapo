import $ from 'jquery'
import IdHolder from '../modules/IdHolder'
import Page from '../page/Page'

export default class CastPage extends Page {
  constructor() {
    super();
    this.communityId = (new IdHolder()).communityId;

    /**
     * 自動スクロールが有効ならスクロール位置を復元する
     */
    chrome.runtime.sendMessage({
      purpose: 'getFromLocalStorage',
      key: 'options.autoScroll.enable'
    },
      (response) => {
        if (response == 'enable' || response == null) {
          /**
           * 次枠移動を使用した場合はスクロール位置を復元する
           * そうでなければ NiconamaTabs に登録する
           */
          chrome.runtime.sendMessage({ purpose: 'NiconamaTabs.get' }, (response) => {
            if (response == null || response.castId != this.communityId) {
              chrome.runtime.sendMessage({
                purpose: 'NiconamaTabs.add',
                id: this.communityId,
                scrollTop: response ? response.scrollTop : 0
              });
            } else {
              setTimeout(() => {
                const scrollTop = response.scrollTop;
                $('html,body').animate({ scrollTop: scrollTop }, 200, 'swing');
              }, 3 * 1000);
            }
          });
        }
      }
    )

    /**
     * スクロール位置を localStorage で保持する
     */
    window.addEventListener('scroll', (e) => {
      chrome.runtime.sendMessage({
        purpose: 'NiconamaTabs.add',
        id: this.communityId,
        scrollTop: document.body.scrollTop
      });
    });
 }
}
