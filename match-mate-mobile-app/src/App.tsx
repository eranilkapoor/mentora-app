import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store, persistor } from './store';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from './core/theme/ThemeProvider';
import i18n from './i18n'; // 🔥 Import i18n instance
import { StatusBar } from 'react-native';

export default function App() {
  const themeMode = store.getState().settings.theme;
  const lang = store.getState().settings.language;
  const isDarkMode = themeMode === 'dark';

  useEffect(() => {
    i18n.changeLanguage(lang).catch((err) => {
      console.error('Error changing language:', err);
    });
  }, [lang]);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <ThemeProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}
