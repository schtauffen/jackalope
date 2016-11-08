# Jackalope
A modular and microscopic [SAM](http://sam.js.org/)-patterned container  
It draws inspiration from [redux](https://github.com/reactjs/redux)  


## Installation
`npm install --save @jackalope/core`


## Usage

Jackalope adheres to the SAM pattern, which can be summarized by the formula:  
`V = S(vm(M.present(A(M))), nap(M, A))` ([source](https://www.infoq.com/articles/no-more-mvc-frameworks))  

You can read about SAM here: [http://sam.js.org/](http://sam.js.org/)  

```js
// src/jack.js
import Jackalope from '@jackalope/core'

import state from './state'
import actions from './actions'
import model from './model'

const J = Jackalope({ state, actions, model }/*, middleware */)
```


### State
In Jackalope, `state` is a function that receives model as its first parameter. If the function does not specify arguments, or specifies more than 1, it will also receive actions bound automatically during instatiation as the second parameter.

Example:
```js
// src/state.js
const state = (model, actions) => {
  const representation = 'Oops, you\'ve stumbled upon an impossible state'

  if (model.count > 0) {
    representation = view.counting(model, actions)
  } else if (model.count < 1) {
    representation = view.launching(model, actions)
  }

  ...

  view.render(representation)
  nap(model, actions)
}

export default state
```


### Model
`model` is an object which contains your data. It must have a method, `model.present` which can either accept an action and update itself, or reject actions outright.  
`model.present` is assumed to have curried form `state => action => { ... }`.

**IMPORTANT** : `model.present` is the only function allowed to mutate `model` in the SAM pattern.

Example:
```js
// src/model.js
const model = {
  count: 10,
  ...
}

model.present = (state) => (action) => {
  if (action.started) {
    model.started = true
  }

  if (action.aborted) {
    model.aborted = true
  }

  ...
  
  state(model)
}

export default model
```


### Actions
`actions` should be a function which accepts `present` (as in, `model.present`) as its only parameter.  
It should return an object with functions that present proposals to the model.  

```js
// src/actions.js
const actions = present => ({
  start: function () {
    present({ started: true })
  },

  abort: function () {
    present({ aborted: true })
  },

  ...

})

export default actions
```

### Jackalope Core
[https://github.com/schtauffen/jackalope/tree/master/core](https://github.com/schtauffen/jackalope/tree/master/core)

## Extending Jackalope
**TODO - more information coming**

## Composability
SAM apps are meant to be composable.  
**TODO - More to come**


## Disclaimer
Jackalope has been created mostly to learn about and play with the [SAM pattern](http://sam.js.org/).  
As is, there are no tests or plans for long term support. This may change pending on how useful this implementation is :)


## License
Jackalope is licensed under the [ISC license](https://opensource.org/licenses/ISC)
