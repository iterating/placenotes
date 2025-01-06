import { Platform } from 'react-native';

let storage;
if (Platform.OS === 'web') {
  storage = require('redux-persist/lib/storage').default;
} else {
  storage = require('@react-native-async-storage/async-storage').default;
}

export default storage;
