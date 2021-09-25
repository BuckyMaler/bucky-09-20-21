import { render, RenderOptions } from '@testing-library/react';
import { FC, ReactElement } from 'react';
import { Provider } from 'react-redux';
import { AppStore } from './app/store';

const customRender = (
  ui: ReactElement,
  store: AppStore,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper: FC = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

export * from '@testing-library/react';
export { customRender as render };
