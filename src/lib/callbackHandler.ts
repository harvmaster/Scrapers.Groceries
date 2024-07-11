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
        callback(...args)
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