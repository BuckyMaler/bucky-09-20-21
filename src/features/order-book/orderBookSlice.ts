import {
  combineReducers,
  createAction,
  createEntityAdapter,
  createReducer,
  createSelector,
  EntityAdapter,
} from '@reduxjs/toolkit';
import { OrderType } from './constants';
import { Feed } from '../websocket/constants';
import {
  feedUnsubscribed,
  websocketDisconnected,
} from '../websocket/websocketSlice';
import { RootState } from '../../app/store';

const snapshotMessage = createAction<{
  bids: Array<Array<number>>;
  asks: Array<Array<number>>;
}>('orderBook/snapshotMessage');

const deltaMessage = createAction<{
  bids: Array<Array<number>>;
  asks: Array<Array<number>>;
}>('orderBook/deltaMessage');

export interface Order {
  price: number;
  qty: number;
}

const bidsAdapter = createEntityAdapter<Order>({
  selectId: (order) => order.price,
  sortComparer: (a, b) => b.price - a.price,
});

const asksAdapter = createEntityAdapter<Order>({
  selectId: (order) => order.price,
  sortComparer: (a, b) => a.price - b.price,
});

const createOrderReducer = (
  entityAdapter: EntityAdapter<Order>,
  orderType: OrderType
) =>
  createReducer(entityAdapter.getInitialState(), (builder) => {
    builder
      .addCase(snapshotMessage, (state, action) => {
        const orders = prepareOrders(action.payload[orderType]);

        entityAdapter.addMany(state, orders);
      })
      .addCase(deltaMessage, (state, action) => {
        const orders = prepareOrders(action.payload[orderType]);
        const { setOrders, removeOrders } = getUpdateArgs(orders);

        entityAdapter.setMany(state, setOrders);
        entityAdapter.removeMany(state, removeOrders);
        entityAdapter.removeMany(state, state.ids.slice(100));
      })
      .addMatcher(
        (action) =>
          (action.type === feedUnsubscribed.type &&
            action.payload === Feed.Book) ||
          action.type === websocketDisconnected.type,
        (state) => {
          entityAdapter.removeAll(state);
        }
      );
  });

const snapshotReceivedReducer = createReducer(false, (builder) => {
  builder
    .addCase(snapshotMessage, () => true)
    .addMatcher(
      (action) =>
        (action.type === feedUnsubscribed.type &&
          action.payload === Feed.Book) ||
        action.type === websocketDisconnected.type,
      () => false
    );
});

export const { selectAll: selectAllBids } = bidsAdapter.getSelectors(
  (state: RootState) => state.orderBook.bids
);

export const { selectAll: selectAllAsks } = asksAdapter.getSelectors(
  (state: RootState) => state.orderBook.asks
);

export const selectAllBidTotals = createSelector(selectAllBids, getOrderTotals);

export const selectAllAskTotals = createSelector(selectAllAsks, getOrderTotals);

export const selectSpread = createSelector(
  selectAllBids,
  selectAllAsks,
  (bids, asks) => {
    const [topBid] = bids;
    const [topAsk] = asks;

    if (!topBid || !topAsk) {
      return null;
    }

    return {
      difference: topAsk.price - topBid.price,
      percentage: 100 - (topBid.price / topAsk.price) * 100,
    };
  }
);

export const selectSnapshotReceived = (state: RootState) =>
  state.orderBook.snapshotReceived;

function prepareOrders(orders: Array<Array<number>>) {
  return orders.map((order): Order => ({ price: order[0], qty: order[1] }));
}

function getUpdateArgs(orders: Array<Order>) {
  return orders.reduce(
    (acc, cur) => {
      cur.qty <= 0 ? acc.removeOrders.push(cur.price) : acc.setOrders.push(cur);

      return acc;
    },
    { setOrders: [], removeOrders: [] } as {
      setOrders: Array<Order>;
      removeOrders: Array<number>;
    }
  );
}

function getOrderTotals(orders: Array<Order>) {
  return orders.reduce((acc, cur, i) => {
    const total = i === 0 ? cur.qty : acc[i - 1] + cur.qty;

    return acc.concat(total);
  }, [] as Array<number>);
}

export default combineReducers({
  bids: createOrderReducer(bidsAdapter, OrderType.Bids),
  asks: createOrderReducer(asksAdapter, OrderType.Asks),
  snapshotReceived: snapshotReceivedReducer,
});
