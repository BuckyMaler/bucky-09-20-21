import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { batchedSubscribe } from './enhancers';
import websocketMiddleware from './middleware';
import activeMarketReducer from '../features/activeMarket/activeMarketSlice';
import orderBookReducer from '../features/order-book/orderBookSlice';
import websocketReducer, {
  websocketSaga,
  websocketMessage,
} from '../features/websocket/websocketSlice';

export function initStore() {
  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer: {
      websocket: websocketReducer,
      activeMarket: activeMarketReducer,
      orderBook: orderBookReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // Objects of type `MessageEvent` aren't serializable. `websocketMessage`
        // is safe to ignore because it's not used as a case statement for any
        // reducers.
        serializableCheck: { ignoredActions: [websocketMessage.type] },
      }).concat(sagaMiddleware, websocketMiddleware()),
    enhancers: process.env.NODE_ENV !== 'test' ? [batchedSubscribe()] : [],
  });

  sagaMiddleware.run(websocketSaga);

  return store;
}

let store: AppStore;

export type AppStore = ReturnType<typeof initStore>;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
