import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import _throttle from 'lodash.throttle';
import { batchedSubscribe } from 'redux-batched-subscribe';
import createSagaMiddleware from 'redux-saga';
import websocketMiddleware from './middleware';
import orderBookReducer from '../features/order-book/orderBookSlice';
import websocketReducer, {
  websocketSaga,
  websocketMessage,
} from '../features/websocket/websocketSlice';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    websocket: websocketReducer,
    orderBook: orderBookReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActions: [websocketMessage.type] },
    }).concat(sagaMiddleware, websocketMiddleware()),
  enhancers: [
    batchedSubscribe(
      _throttle((notify) => notify(), 350, { leading: false, trailing: true })
    ),
  ],
});

sagaMiddleware.run(websocketSaga);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
