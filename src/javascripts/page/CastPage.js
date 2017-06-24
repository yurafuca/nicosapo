import IdHolder from '../modules/IdHolder'
import Page from '../page/Page'

export default class CastPage extends Page {
  constructor() {
    super();
    console.log('castpage');
    chrome.runtime.sendMessage({
      purpose: 'NiconamaTabs.add',
      id: (new IdHolder()).communityId
    });
  }
}
