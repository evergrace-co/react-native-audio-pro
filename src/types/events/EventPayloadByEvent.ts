import {Event} from '../../constants';

import type {PlaybackState} from '../PlaybackState';
import type {PlaybackActiveTrackChangedEvent} from './PlaybackActiveTrackChangedEvent';
import type {PlaybackErrorEvent} from './PlaybackErrorEvent';
import type {PlaybackProgressUpdatedEvent} from './PlaybackProgressUpdatedEvent';
import type {PlaybackQueueEndedEvent} from './PlaybackQueueEndedEvent';
import type {PlayerErrorEvent} from './PlayerErrorEvent';
import type {RemoteSkipEvent} from './RemoteSkipEvent';
import {RemoteJumpForwardEvent} from './RemoteJumpForwardEvent';
import {RemoteJumpBackwardEvent} from './RemoteJumpBackwardEvent';
import {RemoteSeekEvent} from './RemoteSeekEvent';
import {RemoteDuckEvent} from './RemoteDuckEvent';

export type EventPayloadByEvent = {
	[Event.PlayerError]: PlayerErrorEvent;
	[Event.PlaybackState]: PlaybackState;
	[Event.PlaybackError]: PlaybackErrorEvent;
	[Event.PlaybackQueueEnded]: PlaybackQueueEndedEvent;
	[Event.PlaybackActiveTrackChanged]: PlaybackActiveTrackChangedEvent;
	[Event.PlaybackProgressUpdated]: PlaybackProgressUpdatedEvent;
	[Event.RemotePlay]: never;
	[Event.RemotePause]: never;
	[Event.RemoteStop]: never;
	[Event.RemoteSkip]: RemoteSkipEvent;
	[Event.RemoteNext]: never;
	[Event.RemotePrevious]: never;
	[Event.RemoteJumpForward]: RemoteJumpForwardEvent;
	[Event.RemoteJumpBackward]: RemoteJumpBackwardEvent;
	[Event.RemoteSeek]: RemoteSeekEvent;
	[Event.RemoteDuck]: RemoteDuckEvent;
};

// eslint-disable-next-line
type Simplify<T> = {[KeyType in keyof T]: T[KeyType]} & {};

export type EventPayloadByEventWithType = {
	[K in keyof EventPayloadByEvent]: EventPayloadByEvent[K] extends never
		? {type: K}
		: Simplify<EventPayloadByEvent[K] & {type: K}>;
};
