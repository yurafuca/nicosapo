export default class Storage
{
    static saveToNestedLocalStorage(key, innerKey, innerValue) {
        console.debug(innerValue);

        chrome.runtime.sendMessage({
                purpose: 'saveToNestedLocalStorage',
                key: key,
                innerKey: innerKey,
                innerValue: innerValue
            },
            function(response) {
                console.info('[imanani][saveToNestedLocalStorage] response = ', response);
            });
    }

    static removeFromNestedLocalStorage(key, innerKey) {
        chrome.runtime.sendMessage({
                purpose: 'removeFromNestedLocalStorage',
                key: key,
                innerKey: innerKey
            },
            function(response) {
                console.info('[imanani][removeFromNestedLocalStorage] response = ', response);
            });
    }
}
