# unicode-match-property [![Build status](https://travis-ci.org/mathiasbynens/unicode-match-property.svg?branch=master)](https://travis-ci.org/mathiasbynens/unicode-match-property)

_unicode-match-property_ matches a given Unicode property or [property alias](https://github.com/mathiasbynens/unicode-property-aliases) to its canonical property name without applying [loose matching](https://github.com/mathiasbynens/unicode-loose-match). Consider it a strict alternative to loose matching.

## Installation

To use _unicode-match-property_ programmatically, install it as a dependency via [npm](https://www.npmjs.com/):

```bash
$ npm install unicode-match-property
```

Then, `require` it:

```js
const matchProperty = require('unicode-match-property');
```

## API

This module exports a single function named `matchProperty`.

### `matchProperty(value)`

This function takes a string `value` and attempts to match it to a canonical Unicode property name. If there’s a match, it returns the canonical property name. Otherwise, it throws an exception.

```js
// Find the canonical property name:
matchProperty('blk')
// → 'Block'

matchProperty('Block')
// → 'Block'

matchProperty('block') // Note: incorrect casing.
// → throws
```

## Author

| [![twitter/mathias](https://gravatar.com/avatar/24e08a9ea84deb17ae121074d0f17125?s=70)](https://twitter.com/mathias "Follow @mathias on Twitter") |
|---|
| [Mathias Bynens](https://mathiasbynens.be/) |

## License

_unicode-match-property_ is available under the [MIT](https://mths.be/mit) license.
