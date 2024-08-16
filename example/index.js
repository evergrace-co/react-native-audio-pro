import {AppRegistry} from 'react-native';
import TrackPlayer from 'react-native-music-pro';

import App from './src/App';
import {PlaybackService} from './src/services';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
TrackPlayer.registerPlaybackService(() => PlaybackService);
