import _throttle from 'lodash.throttle';

// This was lifted from `redux-batched-subscribe` because
// support for batching specific actions needed to be added
// and the package isn't actively maintained. Changes were
// made to the `notifyListenersBatched` and `dispatch`
// functions. The original source code is linked below:
// https://github.com/tappleby/redux-batched-subscribe/blob/master/src/index.js
export function batchedSubscribe() {
  let currentListeners = [];
  let nextListeners = currentListeners;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.');
    }

    let isSubscribed = true;

    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      const index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    };
  }

  function notifyListeners() {
    const listeners = (currentListeners = nextListeners);
    for (let i = 0; i < listeners.length; i++) {
      listeners[i]();
    }
  }

  const batch = _throttle(() => notifyListeners(), 350, {
    leading: false,
    trailing: true,
  });

  function notifyListenersBatched() {
    batch();
  }

  return (next) =>
    (...args) => {
      const store = next(...args);
      const subscribeImmediate = store.subscribe;

      function dispatch(...dispatchArgs) {
        const res = store.dispatch(...dispatchArgs);
        const { type: actionType } = dispatchArgs[0];
        if (/\/(websocket|delta)Message$/.test(actionType)) {
          notifyListenersBatched();
        } else {
          notifyListeners();
        }
        return res;
      }

      return {
        ...store,
        dispatch,
        subscribe,
        subscribeImmediate,
      };
    };
}
