# unicode-canonical-property-names [![Build status](https://travis-ci.org/mathiasbynens/unicode-canonical-property-names.svg?branch=master)](https://travis-ci.org/mathiasbynens/unicode-canonical-property-names)

_unicode-canonical-property-names_ exports the set of canonical property names in Unicode.

## Installation

To use _unicode-canonical-property-names_, install it as a dependency via [npm](https://www.npmjs.com/):

```bash
$ npm install unicode-canonical-property-names
```

Then, `require` it:

```js
const properties = require('unicode-canonical-property-names');
```

## Example

```js
properties.has('ISO_Comment');
// → true
properties.has('isc');
// → false
```

## Author

| [![twitter/mathias](https://gravatar.com/avatar/24e08a9ea84deb17ae121074d0f17125?s=70)](https://twitter.com/mathias "Follow @mathias on Twitter") |
|---|
| [Mathias Bynens](https://mathiasbynens.be/) |

## License

_unicode-canonical-property-names_ is available under the [MIT](https://mths.be/mit) license.
