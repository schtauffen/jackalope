# Jackalope
A [SAM](http://sam.js.org/)-patterned (redux)[https://github.com/reactjs/redux]-like state management utility utilizing streams


## Installation
`npm install --save @jackalope/core`


## Requirements
Jackalope requires a stream which exposes the fantasy-land compliant `.map` method.  
It has been developed with m.prop from [mithril#rewrite](https://github.com/lhorie/mithril.js/blob/rewrite/docs/prop.md)

Other candidates (**TODO**: check compatability/make compatible with xstream, most, Rx):
* [flyd.stream](https://github.com/paldepind/flyd)


## Usage
```js
import { prop } from 'mithril'
import Jackalope from '@jackalope/core'

import model from './model'
import middleware from './middleware'

const J = Jackalope(m.prop)(model, middleware)

export default J
```

**TODO**: more to come

### Disclaimer:
Jackalope has been created mostly to learn about and play with the [SAM pattern](http://sam.js.org/)
As is, there are no tests or plans for long term support. This may change pending on how useful this implementation is :)
