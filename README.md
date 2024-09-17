# react-native-audio-pro

A minimalist and opinionated audio player for React Native, written in TypeScript, with a focus on high audio quality and simple integration.

This is a fork of [react-native-track-player](https://github.com/DoubleSymmetry/react-native-track-player), refined to provide core audio playback functionality using modern standards. We've removed deprecated features and support for older technologies to keep the library lightweight and easy to integrate.

## Usage

To get started with `react-native-audio-pro`, you need to set up the player as soon as possible in your app's lifecycle. This is typically done in your main entry point file (e.g., `index.js`) right after registering your main application component.

### 1. Install and Import

First, ensure you've installed the package:

```bash
npm install react-native-audio-pro
```

or

```bash
yarn add react-native-audio-pro
```

Then, import `AudioPro` in your entry point file.

### 2. Set Up the Player

In your `index.js` (or equivalent), set up the player by calling `AudioPro.setup()` and passing in a background service function. This function handles playback events when your app is in the background.

```javascript
// index.js
import {AppRegistry} from 'react-native';
import AudioPro from 'react-native-audio-pro';
import App from './App';
import {name as appName} from './app.json';
import {backgroundService} from './audio-service'; // Import your background service

AppRegistry.registerComponent(appName, () => App);

// Set up the audio player
AudioPro.setup(backgroundService).catch(error => {
  console.error('Error setting up the audio player:', error);
});
```

### 3. Implement the Background Service

Create a file (e.g., `audio-service.js` or `audio-service.ts`) to define your background service. This service handles playback events like state changes, progress updates, and remote controls.

```javascript
// audio-service.js
import AudioPro, {
  Event,
  State,
  PlaybackState,
  PlaybackErrorEvent,
  PlaybackProgressUpdatedEvent,
  PlaybackQueueEndedEvent,
} from 'react-native-audio-pro';

export const backgroundService = async () => {
  // Handle playback state changes
  AudioPro.addEventListener(Event.PlaybackState, (event: PlaybackState) => {
    console.log('Playback State:', event.state);
    switch (event.state) {
      case State.Playing:
        // Update your state to reflect that playback is playing
        break;
      case State.Paused:
        // Update your state to reflect that playback is paused
        break;
      case State.Stopped:
        // Update your state to reflect that playback has stopped
        break;
      // Handle other states as needed
    }
  });

  // Handle playback progress updates
  AudioPro.addEventListener(
    Event.PlaybackProgressUpdated,
    (event: PlaybackProgressUpdatedEvent) => {
      console.log('Playback Progress:', event.position, '/', event.duration);
      // Update your UI or state with the current playback position
    },
  );

  // Handle playback queue ended
  AudioPro.addEventListener(
    Event.PlaybackQueueEnded,
    (event: PlaybackQueueEndedEvent) => {
      console.log('Playback Queue Ended');
      // Handle the end of the playback queue
    },
  );

  // Handle playback errors
  AudioPro.addEventListener(Event.PlaybackError, (event: PlaybackErrorEvent) => {
    console.error('Playback Error:', event);
    // Handle playback errors
  });

  // Handle remote controls (e.g., from notification controls)
  AudioPro.addEventListener(Event.RemoteNext, () => {
    console.log('Remote Next Pressed');
    // Handle next track action
  });

  AudioPro.addEventListener(Event.RemotePrevious, () => {
    console.log('Remote Previous Pressed');
    // Handle previous track action
  });
};
```

### 4. Load and Control Playback

In your application code (e.g., in a component or a service), you can now use `AudioPro` to load tracks and control playback.

```javascript
// player.js
import AudioPro from 'react-native-audio-pro';

// Define your track
const track = {
  id: 'trackId',
  url: 'https://example.com/audio.mp3', // URL or local file path
  title: 'Track Title',
  artist: 'Track Artist',
  artwork: 'https://example.com/track-artwork.jpg', // URL or local file path
};

// Load the track
AudioPro.load(track)
  .then(() => {
    // Start playback
    return AudioPro.play();
  })
  .catch(error => {
    console.error('Error loading track:', error);
  });
```

### 5. Implement Playback Controls

You can control playback using the following methods:

- **Play:** `AudioPro.play()`
- **Pause:** `AudioPro.pause()`
- **Stop:** `AudioPro.stop()`
- **Seek to Position:** `AudioPro.seekTo(positionInSeconds)`
- **Seek by Offset:** `AudioPro.seekBy(offsetInSeconds)`
- **Set Volume:** `AudioPro.setVolume(volumeLevel)` (volumeLevel between 0 and 1)
- **Set Playback Rate:** `AudioPro.setRate(rate)` (e.g., 1.0 for normal speed)

Example of implementing a play/pause toggle:

```javascript
// Example function to toggle playback
const togglePlayback = async () => {
  const playbackState = await AudioPro.getState();
  if (playbackState === State.Playing) {
    await AudioPro.pause();
  } else {
    await AudioPro.play();
  }
};
```

### 6. Handle Playback State in Your UI

You can update your UI based on playback events by listening to the events you've set up in the background service. For example, you might update a progress bar based on the `PlaybackProgressUpdated` event.

```javascript
// In your component
useEffect(() => {
  const onPlaybackState = (event) => {
    // Update your component state based on playback state
  };

  const onPlaybackProgress = (event) => {
    // Update progress bar or playback position
  };

  // Add event listeners
  const playbackStateListener = AudioPro.addEventListener(
    Event.PlaybackState,
    onPlaybackState,
  );
  const playbackProgressListener = AudioPro.addEventListener(
    Event.PlaybackProgressUpdated,
    onPlaybackProgress,
  );

  // Clean up the event listeners when the component unmounts
  return () => {
    playbackStateListener.remove();
    playbackProgressListener.remove();
  };
}, []);
```

### 7. Update Notification Options (Optional)

You can customize the notification that appears during playback by updating options:

```javascript
AudioPro.updateOptions({
  stopWithApp: false,
  capabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SkipToPrevious],
  notificationCapabilities: [Capability.Play, Capability.Pause],
  compactCapabilities: [Capability.Play, Capability.Pause],
  icon: require('./path/to/icon.png'),
});
```

### 8. Additional Configuration

Refer to the package documentation for more advanced configurations, such as handling multiple tracks, managing playlists, and integrating with external controls.

## Full Example

Here's a basic example combining the setup and playback control:

```javascript
// index.js
import {AppRegistry} from 'react-native';
import AudioPro from 'react-native-audio-pro';
import App from './App';
import {name as appName} from './app.json';
import {backgroundService} from './audio-service';

AppRegistry.registerComponent(appName, () => App);

AudioPro.setup(backgroundService).catch(error => {
  console.error('Error setting up the audio player:', error);
});

// App.js
import React from 'react';
import {View, Button} from 'react-native';
import AudioPro from 'react-native-audio-pro';

const track = {
  id: 'trackId',
  url: 'https://example.com/audio.mp3',
  title: 'Track Title',
  artist: 'Track Artist',
  artwork: 'https://example.com/track-artwork.jpg',
};

const App = () => {
  const playTrack = async () => {
    try {
      await AudioPro.load(track);
      await AudioPro.play();
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  return (
    <View>
      <Button title="Play Track" onPress={playTrack} />
      {/* Add more controls and UI as needed */}
    </View>
  );
};

export default App;
```

## Notes

- **Permissions:** Ensure you have the necessary permissions set up in your `AndroidManifest.xml` and `Info.plist` files for Android and iOS, respectively.
- **Local Files:** When using local audio files, provide the correct file path and ensure the file is included in your project's assets.
- **Event Listeners:** Remember to remove event listeners when they're no longer needed to prevent memory leaks.

## Conclusion

By following these steps, you should be able to integrate `react-native-audio-pro` into your React Native app, allowing for high-quality audio playback with simple and straightforward setup.

If you encounter any issues or have questions, feel free to open an issue on the [GitHub repository](https://github.com/evergrace-co/react-native-audio-pro) or contribute to the project.

Happy coding!
