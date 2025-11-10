# React Native Audio Pro

Modern, background-capable audio playback for React Native — built for podcasts, audiobooks, and long-form media. Works out of the box with background playback, lock screen controls, and clean hooks-based state. Under the hood: Android uses Media3 (not old-school ExoPlayer), giving you up-to-date media session support without any of the legacy baggage. iOS uses AVFoundation, Apple's native audio engine for professional-grade media playback. Supports static remote files on iOS and Android.

[![npm version](https://img.shields.io/npm/v/react-native-audio-pro?logo=npm&logoColor=white&labelColor=grey&color=blue)](https://www.npmjs.com/package/react-native-audio-pro)
[![website](https://img.shields.io/badge/website-rnap.dev-grey?logo=google-chrome&logoColor=white&color=blue)](https://rnap.dev)
[![GitHub](https://img.shields.io/badge/evergrace--co-react--native--audio--pro-grey?logo=github&logoColor=white&labelColor=grey&color=blue)](https://github.com/evergrace-co/react-native-audio-pro)

## Table of Contents

- [✅️ Core Features](#-core-features)
- [🔧 Add-On Features](#-add-on-features)
- [⚙️ Requirements](#%EF%B8%8F-requirements)
- [🚀 Installation](#-installation)
- [📚 API Overview](#-api-overview)
- [⚡️ React Hook](#%EF%B8%8F-react-hook)
- [🧩 Types](#-types)
- [⚡️ useAudioPro Hook Example](#%EF%B8%8F-useaudiopro-hook-example)
- [📦 API Usage Example](#-api-usage-example)
- [⚠️ Event Listeners and React Lifecycle](#%EF%B8%8F-important-event-listeners-and-react-lifecycle)
- [📱 Example App](#-example-app)

## ✅ Core Features

These are fully supported, maintained features and the foundation of the library:

- 🎵 **Remote Audio File Playback** — Play MP3 and other audio files over HTTP(S)
- 📱 **Background Playback** — Works with screen locked or app backgrounded
- 🔒 **Lock Screen Controls** — Media control support on Android and iOS
- 🖼 **Artwork Support** — Display album art on lock screen and media controls (JPEG, PNG, etc.)
- 🪟 **Notification Center Integration** — Android media session support
- ⚙️ **Imperative API** — Functions like `play`, `pause`, `resume`, `stop`, etc.
- 🧭 **Progress Tracking** — Emits position/duration updates at configurable intervals
- 🔊 **Volume Control** — Real-time control of audio volume
- 🕘 **Start Time Support** — Begin playback from a specific position
- 🪪 **HTTP Headers** — Pass custom headers for audio and artwork URLs
- 💡 **Native Foundations** — Powered by Media3 (Android) and AVFoundation (iOS)
- 🧩 **Fully Typed API** — First-class TypeScript support

## 🔧 Add-On Features

React Native Audio Pro also includes a few optional capabilities that support more advanced or specialized use cases. These are included in the library but may not receive the same level of maintenance priority as the core feature set.

- 🎚 **Ambient Audio API** — A simple secondary player for background or layered audio playback
- 📂 **Local Files via File Path** — Supports full `file://` paths (e.g. using `react-native-fs`)
- 🚦 **Autoplay + Timers** — Supports `autoPlay` and `startTimeMs`. For stop-at logic, use progress events in your app

## ⚙️ Requirements

- **TypeScript:** 5.0 or higher
- **React Native:** 0.72 or higher
- **iOS:** iOS 17.0 or higher
- **Android:** Android 8.0 (API 26) or higher

## 🚀 Installation

```bash
npm install react-native-audio-pro
```

or

```bash
yarn add react-native-audio-pro
```

### 🍎 iOS Installation

Install the CocoaPods dependencies:

```bash
npx pod-install
```

#### Enable Background Modes

1. Open your project settings in Xcode.
2. Go to **Signing & Capabilities**.
3. Add **Background Modes** and enable **Audio, AirPlay, and Picture in Picture**.

### 🤖 Android Installation

> **Note:** This library requires Android 8.0 (API 26)+ and `compileSdkVersion = 35` and `targetSdkVersion = 35` to support the latest Media3 features. While Media3 APIs are supported from API 21+, our focus is on API 28+.

#### Gradle Configuration

In `android/build.gradle`:

```gradle
buildscript {
    ext {
        minSdkVersion = 26
        compileSdkVersion = 35
        targetSdkVersion = 35
        // ...
    }
}
```

### 📦 Expo Installation

> **Note:** React Native Audio Pro requires a development build when using Expo, as it contains native code that cannot run in Expo Go.

1. Install the required Expo package:
    ```bash
    npx expo install expo-build-properties
    ```
2. **For iOS, enable Background Modes in your `app.json`:**
    ```json
    {
    	"expo": {
    		"ios": {
    			"infoPlist": {
    				"UIBackgroundModes": ["audio"]
    			}
    		}
    	}
    }
    ```
3. **For Android, update your plugins array in `app.json`:**
    ```json
    plugins: [
      [
        "expo-build-properties",
        {
          "android": {
            "minSdkVersion": 26,
            "compileSdkVersion": 35,
            "targetSdkVersion": 35,
          },
        },
      ],
    ]
    ```
4. The last step is to [create a development build](https://docs.expo.dev/develop/development-builds/create-a-build/).

## 📚 API Overview

React Native Audio Pro supports various audio file formats including MP3, AAC, and WAV, delivered over HTTPS.

### 🛠 Methods

| Method | Description | Return Value |
| --- | --- | --- |
| **play(track: AudioProTrack, options?: AudioProPlayOptions)** | Loads and starts playing the specified track. | `void` |
| **pause()** | Pauses the current playback. | `void` |
| **resume()** | Resumes playback if paused. | `void` |
| **stop()** | Stops playback and resets position to `0` while keeping the current track loaded; use `clear()` to unload it. | `void` |
| **clear()** | Fully resets the player to the `IDLE` state and tears down the native player instance. | `void` |
| **seekTo(positionMs: number)** | Seeks to a specific position (in milliseconds). | `void` |
| **seekForward(amountMs?: number)** | Seeks forward by the specified milliseconds (default: 30 seconds). | `void` |
| **seekBack(amountMs?: number)** | Seeks backward by the specified milliseconds (default: 30 seconds). | `void` |
| **configure(options: AudioProSetupOptions)** | Sets playback options. Takes effect the next time `play()` is called. | `void` |
| **setProgressInterval(ms: number)** | Sets the `PROGRESS` event frequency (in ms). Takes effect the next time `play()` is called. | `void` |
| **getProgressInterval()** | Returns the current progress interval in milliseconds. | `number` |
| **getTimings()** | Returns the current playback position and total duration in milliseconds. | `{ position: number, duration: number }` |
| **getState()** | Returns the current playback state. | `AudioProState` |
| **getPlayingTrack()** | Returns the current track, or `null` if none is loaded. | `AudioProTrack \| null` |
| **setPlaybackSpeed(speed: number)** | Sets the playback speed rate (0.25 to 2.0). Normal speed is `1.0`. | `void` |
| **getPlaybackSpeed()** | Returns the current playback speed rate. | `number` |
| **setVolume(volume: number)** | Sets the playback volume from `0.0` to `1.0`. Does not affect the system volume. | `void` |
| **getVolume()** | Returns the current relative volume (`0.0` to `1.0`). | `number` |
| **getError()** | Returns the last error that occurred, or `null` if no error has occurred. | `AudioProPlaybackErrorPayload \| null` |

### ⚡️ React Hook

The `useAudioPro` hook provides real-time access to the audio player state within your React components.

```typescript jsx
const { state, position, duration, playingTrack, playbackSpeed, volume, error } = useAudioPro();
```

To subscribe to only the specific piece of state your component needs (and avoid unnecessary re-renders), you can pass a selector function:

```typescript jsx
// Only re-renders when the playing track changes
const playingTrack = useAudioPro((s) => s.playingTrack);
```

| Value             | Description                                                    | Type                                   |
| ----------------- | -------------------------------------------------------------- | -------------------------------------- |
| **state**         | Current playback state of the audio player.                    | `AudioProState`                        |
| **position**      | Current playback position in milliseconds.                     | `number`                               |
| **duration**      | Total duration of the current track in milliseconds.           | `number`                               |
| **playingTrack**  | Currently playing track object, or null if no track is loaded. | `AudioProTrack \| null`                |
| **playbackSpeed** | Current playback speed rate (0.25 to 2.0).                     | `number`                               |
| **volume**        | Current playback volume (0.0 to 1.0).                          | `number`                               |
| **error**         | Last error that occurred, or null if no error has occurred.    | `AudioProPlaybackErrorPayload \| null` |

### 🎧 Event Listeners

| Method | Description | Return Value |
| --- | --- | --- |
| **addEventListener(callback: AudioProEventCallback)** | Listens for playback events (e.g., state changes, track ended, errors, progress). | `EmitterSubscription` — call `.remove()` to unsubscribe. |

### 🧱 Enums

#### AudioProState

| State | Description |
| --- | --- |
| `IDLE` | The default state on app launch. Represents a player with no loaded track and fully cleared media sessions. |
| `STOPPED` | Playback is stopped but the track remains loaded. Position is reset to 0, and media session controls remain visible. |
| `LOADING` | A track is being loaded or buffered and is not yet ready for playback. |
| `PLAYING` | A track is currently playing. |
| `PAUSED` | Playback is paused at the current position. |
| `ERROR` | An error occurred during playback. Check `AudioPro.getError()` for details. |

#### AudioProEventType

| Event                    | Description                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| `STATE_CHANGED`          | Emitted when the player's state changes (e.g., from LOADING to PLAYING).                      |
| `PROGRESS`               | Emitted approximately once per second during playback with current position and duration.     |
| `TRACK_ENDED`            | Emitted when a track completes playback naturally.                                            |
| `SEEK_COMPLETE`          | Emitted when a seek operation completes. Payload includes `triggeredBy` (`USER` or `SYSTEM`). |
| `PLAYBACK_SPEED_CHANGED` | Emitted when the playback speed is changed.                                                   |
| `REMOTE_NEXT`            | Emitted when the user presses the "Next" button on lock screen controls.                      |
| `REMOTE_PREV`            | Emitted when the user presses the "Previous" button on lock screen controls.                  |
| `PLAYBACK_ERROR`         | Emitted when a playback error occurs.                                                         |

#### AudioProContentType

| Type     | Description                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------- |
| `MUSIC`  | Optimized for music playback. Use for songs or music-heavy audio content. This is the default. |
| `SPEECH` | Optimized for spoken word content. Use for podcasts, audiobooks, or speech-heavy content.      |

> Ambient-specific event enums are documented in the [Ambient Audio Guide](docs/ambient-audio.md#ambient-type-reference).

### 🔔 Lock Screen Controls

Both iOS and Android support lock screen and notification controls for play/pause, seek, and track navigation (next/previous).

**Configuration options:**

```typescript
AudioPro.configure({
	contentType: AudioProContentType.MUSIC,
	showNextPrevControls: true, // Hide next/previous buttons
	showSkipControls: false, // Show skip/seek forward/back buttons (default: true)
	skipIntervalMs: 30000, // Number of milliseconds for skip forward/back controls (default: 30000)
});
```

- `showNextPrevControls` — Show next/previous buttons for playlist navigation (default: `true`).
  If enabled, lock screen and notification controls will include Next and Previous.
  If your app only plays single tracks, set to `false`.
- `showSkipControls` — Show skip/seek forward/backward buttons (default: `false`).
  If enabled, lock screen and notification controls will include skip forward/backward (seek) buttons.
- `skipIntervalMs` — The interval (in milliseconds) used for skip forward/back controls.
  If not set, defaults to 30000 (30 seconds).

> ⚠️ **Only one set of controls can be active at a time.**
> If both `showNextPrevControls` and `showSkipControls` are set to `true`, only Next/Prev controls will be shown (Skip controls will be ignored).

**Example:**

```typescript
AudioPro.configure({
	contentType: AudioProContentType.SPEECH,
	showNextPrevControls: false,
	showSkipControls: true, // Only show skip/seek buttons
	skipIntervalMs: 15000, // 15 second skip
});
```

**iOS note:**
Due to platform constraints, iOS only supports showing either Next/Prev or Skip controls, not both.
Android supports both options but will prioritize Next/Prev if both are enabled.

For a full breakdown of ambient audio helper methods, explore the [Ambient Audio Guide](docs/ambient-audio.md#ambient-audio-methods-stateless-fire-and-forget).

### 🧩 Types

<details>
<summary><b>Track and Configuration Types</b></summary>

```typescript
type AudioProTrack = {
	id: string;
	url: string; // the media url (mp3, m4a) - https://, or file://
	title: string;
	artwork: string; // the image url (jpg, png) - https://, or file://
	album?: string;
	artist?: string;
};

type AudioProSetupOptions = {
	contentType?: AudioProContentType; // MUSIC or SPEECH
	debug?: boolean; // Verbose logging
	debugIncludesProgress?: boolean; // Include PROGRESS events in debug logs (default: false)
	progressIntervalMs?: number; // Frequency (in ms) for PROGRESS events (default: 1000ms)
	showNextPrevControls?: boolean; // Show next/previous buttons (default: true)
	showSkipControls?: boolean; // Show skip/seek forward/back buttons (default: true)
	skipIntervalMs?: number; // Interval in milliseconds for skip forward/back controls (default: 30000)
};

type AudioProPlayOptions = {
	autoPlay?: boolean; // Whether to start playback immediately (default: true)
	headers?: AudioProHeaders; // Custom HTTP headers for audio and artwork requests
	startTimeMs?: number; // Optional position in milliseconds to start playback from, even if autoPlay is false.
};
```

</details>

<details>
<summary><b>Event Types</b></summary>

```typescript
// Unified event structure
interface AudioProEvent {
	type: AudioProEventType;
	track: AudioProTrack | null; // Required for all events except REMOTE_NEXT and REMOTE_PREV
	payload?: {
		state?: AudioProState;
		position?: number;
		duration?: number;
		error?: string;
		errorCode?: number;
		speed?: number;
	};
}

// Note: Command events (REMOTE_NEXT, REMOTE_PREV) don't update state and don't require track information.

// Event payload examples
interface AudioProStateChangedPayload {
	state: AudioProState;
	position: number;
	duration: number;
}

interface AudioProTrackEndedPayload {
	position: number;
	duration: number;
}

interface AudioProPlaybackErrorPayload {
	error: string;
	errorCode?: number;
}

interface AudioProPlaybackSpeedChangedPayload {
	speed: number;
}
```

</details>

> Ambient event payloads and play options are covered in the [Ambient Audio Guide](docs/ambient-audio.md#ambient-type-reference).

<details>
<summary><b>About contentType</b></summary>

Use `AudioProContentType.SPEECH` for podcasts or audiobooks, `AudioProContentType.MUSIC` for songs or music-heavy audio. This optimizes playback behavior like audio focus and routing. Defaults to `AudioProContentType.MUSIC`.

</details>

<details>
<summary><b>About debug options</b></summary>

- `debug`: When set to `true`, enables verbose logging of all audio events. Useful for development and troubleshooting.
- `debugIncludesProgress`: When set to `true`, includes PROGRESS events in debug logs. PROGRESS events occur every second during playback and can flood the logs, making it harder to see other important events. Defaults to `false`.
    </details>

<details>
<summary><b>About progressIntervalMs</b></summary>

- `progressIntervalMs`: Controls the frequency (in milliseconds) at which PROGRESS events are emitted from native to TypeScript.
- Default: 1000ms (1 second)
- Allowed range: 100ms to 10000ms
- Can be set via `configure()` or `setProgressInterval()`
- Changes take effect on the next call to `play()`
- Useful for making the UI more responsive for short or high-precision audio playback
    </details>

### Handling Remote Events

To handle next and previous track events from lock screen controls:

```typescript
import { AudioPro, AudioProEventType } from 'react-native-audio-pro';

// Set up listeners outside React components (see warning section below)
const subscription = AudioPro.addEventListener((event) => {
	switch (event.type) {
		case AudioProEventType.REMOTE_NEXT:
			// Handle next track button press
			console.log('User pressed Next button');
			// Load and play next track
			break;

		case AudioProEventType.REMOTE_PREV:
			// Handle previous track button press
			console.log('User pressed Previous button');
			// Load and play previous track
			break;

		case AudioProEventType.STATE_CHANGED:
			// Handle state changes
			console.log('State changed to:', event.payload?.state);
			break;
	}
});

// Later, when you want to remove the listener
subscription.remove();
```

## ⚡️ useAudioPro Hook Example

The `useAudioPro` hook gives you real-time access to the playback state, current position, total duration, and the currently playing track via the `playingTrack` property.

```typescript jsx
import { useAudioPro } from 'react-native-audio-pro';

const AudioStatus = () => {
  const { state, position, duration, playingTrack, playbackSpeed, volume, error } = useAudioPro();

  return (
    <View>
      <Text>Playback State: {state}</Text>
      <Text>Current Position: {position}ms</Text>
      <Text>Total Duration: {duration}ms</Text>
      <Text>Playback Speed: {playbackSpeed}x</Text>
      <Text>Volume: {Math.round(volume * 100)}%</Text>
      {error && (
        <View style={{ backgroundColor: '#ffeeee', padding: 10, borderRadius: 5 }}>
          <Text style={{ color: 'red' }}>Error: {error.error}</Text>
          <Text style={{ color: 'red' }}>Code: {error.errorCode}</Text>
        </View>
      )}
      {playingTrack && (
        <View>
          <Text>Track ID: {playingTrack.id}</Text>
          <Text>Now Playing: {playingTrack.title}</Text>
          <Text>Artist: {playingTrack.artist}</Text>
        </View>
      )}
    </View>
  );
};

export default AudioStatus;
```

## 📦 API Usage Example

```typescript
import { AudioPro, AudioProContentType } from 'react-native-audio-pro';

// Optional: Set playback config
AudioPro.configure({
	contentType: AudioProContentType.MUSIC,
	debug: __DEV__,
});

const track = {
	id: 'track-001',
	url: 'https://example.com/audio.mp3',
	title: 'My Track',
	artwork: 'https://example.com/artwork.jpg',
	artist: 'Artist Name',
};

// Load and play the track
AudioPro.play(track);

// Or load without auto-playing (prepare only)
AudioPro.play(track, { autoPlay: false });

// Control playback
AudioPro.pause();
AudioPro.resume();
AudioPro.seekTo(60);

// Adjust playback speed (1.0 is normal speed)
AudioPro.setPlaybackSpeed(1.5); // 1.5x speed for faster playback
AudioPro.setPlaybackSpeed(0.8); // 0.8x speed for slower playback

// Control volume (independent of device volume)
AudioPro.setVolume(0.5); // 50% volume
AudioPro.setVolume(1.0); // 100% volume (default)

// Get current state without using the hook
const { position, duration } = AudioPro.getTimings();
const state = AudioPro.getState();
const playingTrack = AudioPro.getPlayingTrack();
const speed = AudioPro.getPlaybackSpeed();
const volume = AudioPro.getVolume();
const error = AudioPro.getError();
console.log(
	`Currently playing: ${playingTrack?.title} (${position}/${duration}ms) - State: ${state} - Speed: ${speed}x - Volume: ${Math.round(volume * 100)}%`,
);
```

## 🔊 Ambient Audio

The dedicated ambient player, usage examples, and helper API reference now live in the [Ambient Audio Guide](docs/ambient-audio.md).

## ⚠️ Important: Event Listeners and React Lifecycle

When React Native apps go to the background, React may unmount your components or even your entire app. To ensure continuous audio playback and event handling, **always set up audio event listeners outside the React component lifecycle**.

> [!NOTE]
> If you're using Expo Router, you'll need to create a custom entry point before following the steps below. See [Expo's documentation](https://docs.expo.dev/router/installation/#custom-entry-point-to-initialize-and-load) for more information.

### Example Setup Pattern

```javascript
// index.js - App Entry Point
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { setupAudio } from './audioSetup';

// Register the React component
AppRegistry.registerComponent(appName, () => App);

// Initialize audio logic OUTSIDE of React lifecycle
setupAudio();
```

```javascript
// audioSetup.js example
import { AudioPro, AudioProEventType, AudioProContentType } from 'react-native-audio-pro';

export function setupAudio() {
	// Configure audio settings
	AudioPro.configure({
		contentType: AudioProContentType.MUSIC,
		debug: __DEV__,
		debugIncludesProgress: false,
		progressIntervalMs: 1000,
		showNextPrevControls: true, // Show next/previous buttons on lock screen (default)
	});

	// Set up event listeners that persist for the app's lifetime
	AudioPro.addEventListener((event) => {
		switch (event.type) {
			case AudioProEventType.TRACK_ENDED:
				// Auto-play next track when current track ends
				const nextTrack = determineNextTrack();
				if (nextTrack) {
					AudioPro.play(nextTrack);
				}
				break;

			case AudioProEventType.REMOTE_NEXT:
				// Handle next button press from lock screen/notification
				const nextTrackFromRemote = determineNextTrack();
				AudioPro.play(nextTrackFromRemote);
				break;
		}
	});
}

function determineNextTrack() {
	/* Your logic here */
}
```

## 📱 Example App

A complete working example for iOS and Android is provided in the [`example/`](./example) folder.

It demonstrates how to use `react-native-audio-pro` in a real React Native app, including:

- Track metadata (title, artist, artwork)
- Play/Pause/Seek/Skip controls
- Progress slider
- Event listeners set up outside the React lifecycle

### To run the example:

- Clone this repo and run the below commands

```bash
yarn install
yarn example start
```

And in a new terminal window/pane:

```bash
yarn example ios
# or
yarn example android
```

**OR** open the `./example/ios` folder in XCode, or the `./example/android` folder in Android Studio and run the app on a simulator or physical device.

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
