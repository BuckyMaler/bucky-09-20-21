import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

interface Market {
  productId: string;
  displayName: string;
}

export const Markets: Array<Market> = [
  {
    productId: 'PI_XBTUSD',
    displayName: 'BTC/USD',
  },
  {
    productId: 'PI_ETHUSD',
    displayName: 'ETH/USD',
  },
];

const initialState = Markets[0];

export const activeMarketSlice = createSlice({
  name: 'activeMarket',
  initialState,
  reducers: {
    setActiveMarket: (_, action: PayloadAction<Market>) =>
      Markets.find((market) => market.productId !== action.payload.productId),
  },
});

export const { setActiveMarket } = activeMarketSlice.actions;

export const selectActiveMarket = (state: RootState) => state.activeMarket;

export default activeMarketSlice.reducer;
