import type {TrackMetadataBase} from './TrackMetadataBase';

export type NowPlayingMetadata = TrackMetadataBase & {
	elapsedTime?: number;
};
