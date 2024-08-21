import {Event} from '../../constants';

import type {PlaybackState} from '../PlaybackState';
import type {PlaybackActiveTrackChangedEvent} from './PlaybackActiveTrackChangedEvent';
import type {PlaybackErrorEvent} from './PlaybackErrorEvent';
import type {PlaybackMetadataReceivedEvent} from './PlaybackMetadataReceivedEvent';
import type {
	AudioCommonMetadataReceivedEvent,
	AudioMetadataReceivedEvent,
} from './AudioMetadataReceivedEvent';
import type {PlaybackPlayWhenReadyChangedEvent} from './PlaybackPlayWhenReadyChangedEvent';
import type {PlaybackProgressUpdatedEvent} from './PlaybackProgressUpdatedEvent';
import type {PlaybackQueueEndedEvent} from './PlaybackQueueEndedEvent';
import type {PlaybackTrackChangedEvent} from './PlaybackTrackChangedEvent';
import {PlayerErrorEvent} from './PlayerErrorEvent';
import type {RemoteDuckEvent} from './RemoteDuckEvent';
import type {RemoteJumpBackwardEvent} from './RemoteJumpBackwardEvent';
import type {RemoteJumpForwardEvent} from './RemoteJumpForwardEvent';
import type {RemoteSeekEvent} from './RemoteSeekEvent';
import type {RemoteSkipEvent} from './RemoteSkipEvent';

export type EventPayloadByEvent = {
	[Event.PlayerError]: PlayerErrorEvent;
	[Event.PlaybackState]: PlaybackState;
	[Event.PlaybackError]: PlaybackErrorEvent;
	[Event.PlaybackQueueEnded]: PlaybackQueueEndedEvent;
	[Event.PlaybackTrackChanged]: PlaybackTrackChangedEvent;
	[Event.PlaybackActiveTrackChanged]: PlaybackActiveTrackChangedEvent;
	[Event.PlaybackMetadataReceived]: PlaybackMetadataReceivedEvent;
	[Event.PlaybackPlayWhenReadyChanged]: PlaybackPlayWhenReadyChangedEvent;
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
	[Event.MetadataChapterReceived]: AudioMetadataReceivedEvent;
	[Event.MetadataTimedReceived]: AudioMetadataReceivedEvent;
	[Event.MetadataCommonReceived]: AudioCommonMetadataReceivedEvent;
};

// eslint-disable-next-line
type Simplify<T> = {[KeyType in keyof T]: T[KeyType]} & {};

export type EventPayloadByEventWithType = {
	[K in keyof EventPayloadByEvent]: EventPayloadByEvent[K] extends never
		? {type: K}
		: Simplify<EventPayloadByEvent[K] & {type: K}>;
};
