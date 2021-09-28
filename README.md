# Order Book

## About

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and built with [TypeScript](https://www.typescriptlang.org/), [React](https://reactjs.org/), and [Redux](https://redux.js.org/).

### Requirements

| Requirement                                           | Support     | Additional Details                                                                                                                                                                                                                                                |
| ----------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A functioning real-time order book                    | **Full**    | This includes displaying price, size, total, the spread, and the depth graph                                                                                                                                                                                      |
| Order levels are sorted by price                      | **Full**    | Bids are sorted [here](https://github.com/BuckyMaler/bucky-09-20-21/blob/master/src/features/order-book/orderBookSlice.ts#L34) and asks are sorted [here](https://github.com/BuckyMaler/bucky-09-20-21/blob/master/src/features/order-book/orderBookSlice.ts#L39) |
| Price levels with a size of 0 are removed             | **Full**    | Order removals and updates are calculated [here](https://github.com/BuckyMaler/bucky-09-20-21/blob/master/src/features/order-book/orderBookSlice.ts#L121)                                                                                                         |
| Users can switch between the BTC and ETH markets      | **Full**    |                                                                                                                                                                                                                                                                   |
| The design mirrors the mockups                        | **Full**    |                                                                                                                                                                                                                                                                   |
| Responsive orientation changes                        | **None**    |                                                                                                                                                                                                                                                                   |
| The websocket disconnects when the app isn't in focus | **Full**    | For improved UX the websocket will only disconnect if the app is out of focus for 30+ seconds                                                                                                                                                                     |
| Users can manually reconnect the websocket            | **Full**    |                                                                                                                                                                                                                                                                   |
| Re-rendering is variably throttled based on device    | **Partial** | Re-rendering is throttled by a constant [here](https://github.com/BuckyMaler/bucky-09-20-21/blob/master/src/app/store.ts#L24)                                                                                                                                     |
| Critical flows are tested                             | **Full**    | Integration tests for `OrderBook` are [here](https://github.com/BuckyMaler/bucky-09-20-21/blob/master/src/features/order-book/containers/OrderBook.test.tsx). In a production codebase I'd include more tests.                                                    |
| The app is publicly hosted                            | **Full**    | [bucky-09-20-21.vercel.app](bucky-09-20-21.vercel.app)                                                                                                                                                                                                            |

### File Structure

Files are organized in "feature folders", with all the Redux logic for a given feature in a single "slice file".

```
src/
├── app/
├── common/
├── features/
├── App.tsx
├── index.tsx
```

| File/Folder | Purpose                                                                       |
| ----------- | ----------------------------------------------------------------------------- |
| `app/`      | Contains store configuration                                                  |
| `common/`   | Contains reusable components, utilities, etc.                                 |
| `features/` | Contains "feature folders" which each contain all functionality for a feature |
| `App.tsx`   | The root component                                                            |
| `index.tsx` | The entry point that renders the component tree                               |

### Store Configuration

The store is composed of 3 slices of state, 2 middlewares, and an enhancer. The slices of state are: [`websocket`](https://github.com/BuckyMaler/bucky-09-20-21/blob/master/src/features/websocket/websocketSlice.ts), [`activeMarket`](https://github.com/BuckyMaler/bucky-09-20-21/blob/master/src/features/activeMarket/activeMarketSlice.ts), and [`orderBook`](https://github.com/BuckyMaler/bucky-09-20-21/blob/master/src/features/order-book/orderBookSlice.ts).

```typescript
{
  websocket: {
    status: null | 'connecting' | 'connected' | 'disconnected';
    feeds: {
      [key: string]:
        | 'subscribe'
        | 'unsubscribe'
        | 'subscribed'
        | 'unsubscribed';
    };
  };
  activeMarket: {
    productId: string;
    displayName: string;
  };
  orderBook: {
    bids: {
      entities: {
        [key: string]: {
          price: number;
          qty: number;
        };
      };
      ids: Array<number>;
    };
    asks: {
      entities: {
        [key: string]: {
          price: number;
          qty: number;
        };
      };
      ids: Array<number>;
    };
    snapshotReceived: boolean;
  };
}
```

The middlewares are a Redux Saga middleware and a [custom middleware](https://github.com/BuckyMaler/bucky-09-20-21/blob/master/src/app/middleware.ts). The custom middleware is used to connect and disconnect the websocket, and to send and receive websocket messages.

The [enhancer](https://github.com/BuckyMaler/bucky-09-20-21/blob/master/src/app/store.ts#L32) leverages [`redux-batched-subscribe`](https://github.com/tappleby/redux-batched-subscribe) and [`lodash.throttle`](https://www.npmjs.com/package/lodash.throttle) to throttle subscription notifications. By throttling subscription notifications, React re-renders that are triggered due to state changes are also throttled.

### References

- [Where should websockets and other persistent connections live?](https://redux.js.org/faq/code-structure#where-should-websockets-and-other-persistent-connections-live)
- [How can I reduce the number of store update events?](https://redux.js.org/faq/performance#how-can-i-reduce-the-number-of-store-update-events)
- [Blogged Answers: A Comparison of Redux Batching Techniques](https://blog.isquaredsoftware.com/2020/01/blogged-answers-redux-batching-techniques/)
- [bitfinexcom/bfx-hf-ui](https://github.com/bitfinexcom/bfx-hf-ui)
- [AdaptiveConsulting/ReactiveTraderCloud](https://github.com/AdaptiveConsulting/ReactiveTraderCloud)

## Development

### Prerequisites

- [node](https://nodejs.org/en/download/)
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

### Running the App

Run the following commands from the project directory.

1. Install the dependencies: `npm install`
2. Start the app: `npm start`
