# react-native-audio-pro

A React Native module for playing MP3 audio files from remote URLs on Android and iOS. Designed for audiobook and podcast apps, it supports background playback with lock screen and notification controls.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Platform-Specific Setup](#platform-specific-setup)
  - [Android](#android)
  - [iOS](#ios)
- [Usage](#usage)
  - [Importing the Module](#importing-the-module)
  - [Playing Audio](#playing-audio)
  - [Handling Events](#handling-events)
  - [Seeking](#seeking)
- [API Reference](#api-reference)
  - [Methods](#methods)
  - [Events](#events)
  - [Enums](#enums)
- [Types](#types)

---

## Features

- **Stream MP3 Audio**: Play MP3 audio files from remote URLs with minimal buffering for quick playback.
- **Background Playback**: Continue playing audio even when the app is in the background.
- **Lock Screen Controls**: Control playback from the lock screen and notification center.
- **Event Handling**: Receive detailed playback status updates via event listeners.
- **Seek Functionality**: Seek to specific positions in the audio track.
- **TypeScript Support**: Fully typed for TypeScript with enums and interfaces.

---

## Requirements

- **React Native**: 0.60 or higher
- **Android**: Android 13 (API Level 33) or higher
- **iOS**: iOS 15.0 or higher

---

## Installation

Using npm:

```bash
npm install react-native-audio-pro
```

Using Yarn:

```bash
yarn add react-native-audio-pro
```

---

## Platform-Specific Setup

### Android

1. **Gradle Configuration**:

   Ensure that your `build.gradle` files are set to use SDK version 33 or higher.

   ```gradle
   // File: android/build.gradle
   buildscript {
       ext {
           minSdkVersion = 33
           compileSdkVersion = 33
           targetSdkVersion = 33
           // ...
       }
       // ...
   }
   ```

2. **Permissions**:

   Add the following permissions to your `AndroidManifest.xml`:

   ```xml
   <!-- File: android/app/src/main/AndroidManifest.xml -->
   <manifest xmlns:android="http://schemas.android.com/apk/res/android"
       package="com.yourapp">

       <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
       <uses-permission android:name="android.permission.WAKE_LOCK" />

       <application
           android:name=".MainApplication"
           android:label="@string/app_name"
           android:icon="@mipmap/ic_launcher"
           android:allowBackup="false">
           <!-- ... -->
       </application>
   </manifest>
   ```

3. **ProGuard Rules** (if using ProGuard):

   Add the following rules to your ProGuard configuration:

   ```proguard
   # File: android/app/proguard-rules.pro
   -keep class com.google.android.exoplayer2.** { *; }
   -dontwarn com.google.android.exoplayer2.**
   ```

### iOS

1. **Enable Background Modes**:

   In Xcode, select your project, then go to **Signing & Capabilities**. Add **Background Modes** and check **Audio, AirPlay, and Picture in Picture**.

2. **Swift Version**:

   Ensure that your project supports Swift. If not, create an empty Swift file and a bridging header when prompted.

3. **iOS Deployment Target**:

   Set the deployment target to **iOS 15.0** or higher in your project settings.

---

## Usage

### Importing the Module

```typescript
// File: App.tsx
import AudioPro, { EventNames } from 'react-native-audio-pro';
```

### Playing Audio

```typescript
// File: App.tsx
import React from 'react';
import { View, Button } from 'react-native';
import AudioPro from 'react-native-audio-pro';

const App: React.FC = () => {
  const handlePlay = async () => {
    try {
      await AudioPro.play('https://example.com/audio.mp3');
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  return (
    <View>
      <Button title="Play Audio" onPress={handlePlay} />
    </View>
  );
};

export default App;
```

### Handling Events

```typescript
// File: App.tsx
import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
import AudioPro, { EventNames } from 'react-native-audio-pro';

const App: React.FC = () => {
  useEffect(() => {
    const onPlay = () => {
      console.log('Playback started');
    };

    const onPause = () => {
      console.log('Playback paused');
    };

    AudioPro.addEventListener(EventNames.ON_PLAY, onPlay);
    AudioPro.addEventListener(EventNames.ON_PAUSE, onPause);

    return () => {
      AudioPro.removeEventListener(EventNames.ON_PLAY, onPlay);
      AudioPro.removeEventListener(EventNames.ON_PAUSE, onPause);
    };
  }, []);

  // ... rest of the component
};

export default App;
```

### Seeking

```typescript
// File: App.tsx
import React from 'react';
import { View, Button } from 'react-native';
import AudioPro from 'react-native-audio-pro';

const App: React.FC = () => {
  const handleSeekTo = async () => {
    await AudioPro.seekTo(60); // Seek to 1 minute
  };

  const handleSeekBy = async () => {
    await AudioPro.seekBy(15); // Seek forward by 15 seconds
  };

  return (
    <View>
      <Button title="Seek to 1:00" onPress={handleSeekTo} />
      <Button title="Seek Forward 15s" onPress={handleSeekBy} />
    </View>
  );
};

export default App;
```

---

## API Reference

### Methods

#### `play(url: string, headers?: Headers): Promise<void>`

Starts streaming the audio from the provided URL.

- **url**: The URL of the MP3 audio file (must be HTTPS).
- **headers**: Optional HTTP headers for authenticated streams.

#### `pause(): Promise<void>`

Pauses the audio playback.

#### `resume(): Promise<void>`

Resumes the audio playback.

#### `stop(): Promise<void>`

Stops the audio playback and releases resources.

#### `seekTo(seconds: number): Promise<void>`

Seeks to a specific time in the audio track.

- **seconds**: The position in seconds to seek to.

#### `seekBy(seconds: number): Promise<void>`

Seeks forward or backward by a specific amount of time.

- **seconds**: The number of seconds to seek by (negative values seek backward).

#### `addEventListener(eventName: EventNames, listener: (...args: any[]) => void): void`

Adds an event listener for playback events.

- **eventName**: The event to listen for (use `EventNames` enum).
- **listener**: The callback function to handle the event.

#### `removeEventListener(eventName: EventNames, listener: (...args: any[]) => void): void`

Removes a previously added event listener.

---

### Events

Use the `EventNames` enum to subscribe to the following events:

- `ON_PLAY`: Emitted when playback starts or resumes.
- `ON_PAUSE`: Emitted when playback is paused.
- `ON_BUFFERING`: Emitted when buffering starts or ends.
- `ON_LOADING`: Emitted when the player is loading the track.
- `ON_ERROR`: Emitted when an error occurs.
- `ON_FINISHED`: Emitted when the track finishes playing.
- `ON_DURATION_RECEIVED`: Emitted when the track duration is available.
- `ON_SEEK`: Emitted when a seek operation completes.
- `ON_SKIP_TO_NEXT`: Emitted when the user requests to skip to the next track.
- `ON_SKIP_TO_PREVIOUS`: Emitted when the user requests to skip to the previous track.

---

### Enums

#### `EventNames`

An enum of available event names for event listeners.

```typescript
export enum EventNames {
  ON_PLAY = 'onPlay',
  ON_PAUSE = 'onPause',
  ON_SKIP_TO_NEXT = 'onSkipToNext',
  ON_SKIP_TO_PREVIOUS = 'onSkipToPrevious',
  ON_BUFFERING = 'onBuffering',
  ON_LOADING = 'onLoading',
  ON_ERROR = 'onError',
  ON_FINISHED = 'onFinished',
  ON_DURATION_RECEIVED = 'onDurationReceived',
  ON_SEEK = 'onSeek',
}
```

---

## Types

#### `Headers`

Type definition for HTTP headers used in the `play` method.

```typescript
type Headers = { [key: string]: string };
```

---

## Additional Notes

- **HTTPS Requirement**: The `play` method requires audio URLs to use HTTPS for secure streaming.
- **Custom Headers**: Support for custom HTTP headers allows for authenticated streams.
- **Background Playback**: Ensure that background modes are properly configured on both Android and iOS to support background playback.
- **Event Handling**: It's recommended to remove event listeners when they are no longer needed to prevent memory leaks.

---

## Troubleshooting

- **Playback Doesn't Start**: Check that the audio URL is correct and uses HTTPS. Also, ensure that the required permissions and capabilities are set up.
- **Events Not Emitting**: Verify that event listeners are properly added and that the event names match the `EventNames` enum.
- **App Crashes on Android**: Ensure that the `minSdkVersion` is set to 33 or higher and that all dependencies are correctly installed.

---

## License

This project is licensed under the MIT License.

---

**Note**: This library focuses on playing a single audio track at a time and does not support playlist management or queue functionality.

---

Feel free to open issues or submit pull requests for bug fixes and improvements.

Happy coding!
