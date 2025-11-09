# Ambient Audio Guide

React Native Audio Pro includes a completely isolated ambient audio system that can play background sounds independently from the main audio player. Use it for ambient loops, lightweight background beds, or secondary effects that should not interfere with the main transport.

> ⚠️ **Background behavior:** Ambient audio usually continues playing when the app is backgrounded, but this is not guaranteed. For reliable background playback, keep a main track playing concurrently (for example via `AudioPro.play()`).

## Ambient Audio API

```typescript
import { AudioPro } from 'react-native-audio-pro';

// Play ambient audio
AudioPro.ambientPlay({
	url: 'https://example.com/ambient.mp3',
	loop: true, // Optional, defaults to true
});

AudioPro.ambientPause(); // Pause ambient playback
AudioPro.ambientResume(); // Resume ambient playback
AudioPro.ambientStop(); // Stop and clean up ambient playback
AudioPro.ambientSeekTo(30000); // Seek to 30 seconds

AudioPro.ambientSetVolume(0.5); // 50% volume

// Listen for ambient audio events
const subscription = AudioPro.addAmbientListener((event) => {
	switch (event.type) {
		case 'AMBIENT_TRACK_ENDED':
			console.log('Ambient track ended');
			break;
		case 'AMBIENT_ERROR':
			console.error('Ambient error:', event.payload?.error);
			break;
	}
});

// Later, remove the listener
subscription.remove();
```

## Ambient Audio Methods (Stateless Fire-and-Forget)

> 🧠 Ambient playback is designed to be stateless, simple, and minimal for background sounds, ambient loops, or lightweight audio tasks.

| Method | Description | Return Value |
| --- | --- | --- |
| **ambientPlay(options: AmbientAudioPlayOptions)** | Plays a lightweight ambient audio track, isolated from the main player. Accepts a remote or local `url` and an optional `loop` flag (default: `true`). | `void` |
| **ambientStop()** | Stops the ambient audio playback. | `void` |
| **ambientPause()** | Pauses ambient audio playback (no-op if already paused or not playing). | `void` |
| **ambientResume()** | Resumes ambient audio playback if paused (no-op if already playing or no active track). | `void` |
| **ambientSeekTo(positionMs: number)** | Seeks to the specified position (in milliseconds) in the ambient track (if supported). Silently ignored if unsupported or if no active ambient track. | `void` |
| **ambientSetVolume(volume: number)** | Sets the volume of ambient audio playback from `0.0` (mute) to `1.0` (full output). | `void` |
| **addAmbientListener(callback: AudioProAmbientEventCallback)** | Listens for ambient audio events (e.g., track ended, errors). | `EmitterSubscription` — call `.remove()` to unsubscribe. |

## Key Features

- Completely isolated from the main audio player
- Continues playing even when the main player is stopped or cleared
- Minimal, stateless API that favors simple background loops
- Ambient audio loops by default
- Event handling for track end and error scenarios
- Supports both remote URLs and `file://` paths

## Ambient Type Reference

> For core player event enums and playback configuration types, see the main README.

### AudioProAmbientEventType

| Event | Description |
| --- | --- |
| `AMBIENT_TRACK_ENDED` | Emitted when an ambient track completes playback naturally (when `loop` is set to `false`). |
| `AMBIENT_ERROR` | Emitted when an error occurs during ambient audio playback. |

### Ambient Audio Types

```typescript
interface AudioProAmbientEvent {
	type: AudioProAmbientEventType;
	payload?: {
		error?: string;
	};
}

interface AmbientAudioPlayOptions {
	url: string;
	loop?: boolean;
}
```
