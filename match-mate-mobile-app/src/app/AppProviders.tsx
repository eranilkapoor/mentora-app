import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Loader from '@/core/components/Loader';
import MobileWrapper from '@/core/components/MobileWrapper';
import ErrorBoundary from '@/core/components/ErrorBoundary';

import AppContent from './AppContent';
import AppInitializer from './AppInitializer';
import { persistor, store } from '@/store';

export default function AppProviders(): React.ReactElement {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate
          persistor={persistor}
          loading={
            <Loader fullScreen size="large" loadingText="App loading..." />
          }
        >
          <ErrorBoundary>
            <MobileWrapper>
              <AppInitializer>
                <AppContent />
              </AppInitializer>
            </MobileWrapper>
          </ErrorBoundary>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}
