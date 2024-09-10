import {emitter, pause, play, seekBy, seekTo, stop} from './audio-pro';
import {
	RemoteDuckEvent,
	RemoteJumpBackwardEvent,
	RemoteJumpForwardEvent,
	RemoteSeekEvent,
} from './types';
import {Platform} from 'react-native';
import {HandledEvent} from './constants/HandledEvent';

export const handleDefaultEvents = () => {
	// TODO: Integrate all of this natively

	// Duck
	const handleRemoteDuck = (event: RemoteDuckEvent) => {
		// TODO: Ensure this works natively on both platforms, then remove and set default on Options
		if (event.paused || event.permanent) {
			if (event.permanent && Platform.OS === 'android') {
				void stop();
			} else {
				void pause();
			}
		} else {
			void play();
		}
	};
	emitter.addListener(HandledEvent.RemoteDuck, handleRemoteDuck);

	// Play
	const handleRemotePlay = () => play();
	emitter.addListener(HandledEvent.RemotePlay, handleRemotePlay);

	// Pause
	const handleRemotePause = () => pause();
	emitter.addListener(HandledEvent.RemotePause, handleRemotePause);

	// Stop
	const handleRemoteStop = () => stop();
	emitter.addListener(HandledEvent.RemoteStop, handleRemoteStop);

	// Seek
	const handleRemoteSeek = ({position}: RemoteSeekEvent) => seekTo(position);
	emitter.addListener(HandledEvent.RemoteSeek, handleRemoteSeek);

	// Jump forward
	const handleRemoteJumpForward = ({interval}: RemoteJumpForwardEvent) => seekBy(interval);
	emitter.addListener(HandledEvent.RemoteJumpForward, handleRemoteJumpForward);

	// Jump backward
	const handleRemoteJumpBackward = ({interval}: RemoteJumpBackwardEvent) => seekBy(-interval);
	emitter.addListener(HandledEvent.RemoteJumpBackward, handleRemoteJumpBackward);
};
