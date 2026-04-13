import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store, persistor } from '../store';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Loader from '../core/components/Loader';
import MobileWrapper from '../core/components/MobileWrapper';
import ErrorBoundary from '../core/components/ErrorBoundary';

import AppContent from './AppContent';
import AppInitializer from './AppInitializer';

export default function AppProviders(): React.ReactElement {
  const [isHydrated, setHydrated] = useState(false);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate
          persistor={persistor}
          loading={<Loader fullScreen size="large" />}
          onBeforeLift={() => setHydrated(true)}
        >
          <ErrorBoundary>
            <MobileWrapper>
              <AppInitializer>
                <AppContent isHydrated={isHydrated} />
              </AppInitializer>
            </MobileWrapper>
          </ErrorBoundary>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}
