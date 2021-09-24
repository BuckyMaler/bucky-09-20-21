# Order Book

## About

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and built with [TypeScript](https://www.typescriptlang.org/), [React](https://reactjs.org/), and [Redux](https://redux.js.org/).

## Requirements

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

## Development

### Prerequisites

- [node](https://nodejs.org/en/download/)
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

### Running the App

Run the following commands from the project directory.

1. Install the dependencies: `npm install`
2. Start the app: `npm start`
