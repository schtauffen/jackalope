# Jackalope
A modular and microscopic [SAM](http://sam.js.org/)-patterned container
It is also inspired in parts by [redux](https://github.com/reactjs/redux)


## Installation
`npm install --save @jackalope/core`


## Usage

Jackalope adheres to the SAM pattern, which can be summarized by the formula:  
`V = S(vm(M.present(A(M))), nap(M, A))`  

You can read about SAM here: [http://sam.js.org/](http://sam.js.org/)  

```js
// src/jack.js
import Jackalope from '@jackalope/core'

import state from './state'
import actions from './actions'
import model from './model'

const J = Jackalope({ state, actions, model })
```


### State
In Jackalope, `state` is assumed to have curried form `actions => model => { ... }`.  
State is responsible for rendering and determing automatic actions, if any.  
For simple apps, state may be unnessecary and is optional.  

Example:
```js
// src/state.js
const state = (actions) => (model) => {
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
`model.present` is assumed to have curried form `display => action => { ... }`  

**IMPORTTANT** : `model.present` is the only function allowed to mutate model in the SAM pattern.

Example:
```js
// src/model.js
const model = {}

model.present = (action) => {
  if (action.type === 'SET_COUNT' && typeof action.payload === 'number') {
    model.count = action.payload
  }

  if (action.type === 'COUNT_DOWN') {
    model.count = model.count - 1
  }

  ...
}

export default model
```


### Actions
`actions` should be an object containing pure functions that return instructions for how to update the model.  
They can be redux-like (as in the following example) containing `type` and `payload`, but they don't have to be.  

```js
// src/actions.js
const actions = {}

actions.setCount = (n) => ({
  type: 'SET_COUNT',
  payload: 10,
})

...

export default actions
```

### Jackalope Core
[https://github.com/schtauffen/jackalope/tree/master/core](https://github.com/schtauffen/jackalope/tree/master/core)

## Extending Jackalope
**TODO - information coming**

## Composability
SAM apps are meant to be composable. **TODO - More to come**


## Disclaimer
Jackalope has been created mostly to learn about and play with the [SAM pattern](http://sam.js.org/).  
As is, there are no tests or plans for long term support. This may change pending on how useful this implementation is :)


## License
Jackalope is licensed under the [ISC license](https://opensource.org/licenses/ISC)
