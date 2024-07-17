type Callback = (...args: any[]) => any

type CallbackGroup = Record<string, Callback>

type CallbackArray = Record<string, Callback[]>

export const createCallbackHandler = <T extends CallbackGroup>(callbacks: T[]): {[K in keyof T]: T[K]} => {
  const handler = {} as CallbackGroup

  const callbackArray: CallbackArray = {}

  callbacks.forEach((callbackGroup) => {
    Object.entries(callbackGroup).forEach(([key, value]) => {
      if (!callbackArray[key]) {
        callbackArray[key] = []
      }

      callbackArray[key].push(value)
    })
  })

  Object.entries(callbackArray).forEach(([key, value]) => {
    handler[key] = (...args: any[]) => {
      value.forEach((callback) => {
        try {
          callback(...args)
        } catch (err) {
          // Do nothing. We don't want to stop the other callbacks from running or stop the main process
          // I can probably create a good handler for this, but its not too important because its easy enough to see when a callback fails
        }
      })
    }
  })

  return handler as {[K in keyof T]: T[K]}
}

export default createCallbackHandler


// const test = {
//   onProduct: () => {}
// }

// const test2 = createCallbackHandler([test])

// test2.onProduct()
// test2.