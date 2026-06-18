import 'react-native-reanimated';

import { registerRootComponent } from 'expo';

import App from './src/App';
import {
  initErrorReporting,
  wrapWithErrorReporter,
} from './src/core/utils/errorReporter';

initErrorReporting();

registerRootComponent(wrapWithErrorReporter(App));
