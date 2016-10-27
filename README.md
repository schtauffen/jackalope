# Jackalope
A [SAM](http://sam.js.org/)-patterned [redux](https://github.com/reactjs/redux)-like state management utility utilizing streams


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
import middleware from './middleware'

const J = Jackalope({ state, actions, model }, middleware)

export default J
```


### State
In Jackalope, `state` is assumed to be a pure function which returns the computed state of your app.  
For simple apps, state may be unnessecary and is optional.  
**Note: there is not yet a direct analogy to `nap` in Jackalope; However, through middleware we have other means of deciding when more actions should take place**  

Example:
```js
// src/state.js
const state = (model) => {
  const state = {}

  if (model.count > 0) {
    state.isCounting = true
  } else if (model.count < 1) {
    state.hasLaunched = true
  }

  ...

  return state
}

export default state
```


### Model
`model` is an object which contains your data. It must have a method, `model.present` which can either accept an action and update itself, or reject actions outright.  

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
They can be redux-like (as in the examples here) containing `type` and `payload`, but they don't have to be.  

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

### Using a jackalope instance
**TODO**


## Helpers included in Core
**TODO**


## Composability
SAM apps are meant to be composable. **TODO - More to come**


## Disclaimer
Jackalope has been created mostly to learn about and play with the [SAM pattern](http://sam.js.org/).  
As is, there are no tests or plans for long term support. This may change pending on how useful this implementation is :)


## License
Jackalope is licensed under the [ISC license](https://opensource.org/licenses/ISC)
