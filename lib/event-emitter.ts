/**
 * A simple event emitter without state dependency
 * 
 * if you want an event emitter with state change, use zustand
 */

enum EvtNames {
  ImgLoaded = "imgloaded"
}

function EventEmitter<TEventName extends string>() {
  // map event name => a list of callbacks(listenrs)
  const eventMaps: {
    [key: string]: Array<() => void>
  } = {}

  const emit = (name: TEventName) => {
    eventMaps[name].forEach(listener => listener())
  }
  const addEventListener = (name: TEventName, callback: () => void) => {
    if (eventMaps[name]) {
      eventMaps[name].push(callback)
    } else {
      eventMaps[name] = [callback]
    }
  }
  const removeEventListener = (name: TEventName, callback: () => void) => {
    const listeners = eventMaps[name]
    for (let i = 0; i < listeners.length; i++) {
      if (listeners[i] === callback) {
        listeners.splice(i)
        break
      }
    }
  }

  return {
    emit,
    addEventListener,
    removeEventListener
  }
}

const eventEmitter = EventEmitter<EvtNames>();

export { EvtNames, eventEmitter }

