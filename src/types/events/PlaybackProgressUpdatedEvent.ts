import type {Progress} from '../Progress';

export type PlaybackProgressUpdatedEvent = Progress & {
	track: number;
};
