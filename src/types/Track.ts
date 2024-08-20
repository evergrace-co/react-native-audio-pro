import type { TrackMetadataBase } from './TrackMetadataBase';

export interface Track extends TrackMetadataBase {
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers?: { [key: string]: any };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export type AddTrack = Track & {
  url: string;
  artwork: string;
  title: string;
};
