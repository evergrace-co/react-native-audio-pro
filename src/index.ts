import { NativeModules, NativeEventEmitter } from 'react-native';

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

type Headers = { [key: string]: string };

interface AudioProModule {
  play(url: string, headers?: Headers): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
  seekTo(seconds: number): Promise<void>;
  seekBy(seconds: number): Promise<void>;
  addEventListener(eventName: EventNames, listener: (...args: any[]) => void): void;
  removeEventListener(eventName: EventNames, listener: (...args: any[]) => void): void;
}

const { RNAudioPro } = NativeModules;
const eventEmitter = new NativeEventEmitter(RNAudioPro);

const AudioPro: AudioProModule = {
  play: async (url, headers = {}) => {
    await RNAudioPro.play(url, headers);
  },
  pause: async () => {
    await RNAudioPro.pause();
  },
  resume: async () => {
    await RNAudioPro.resume();
  },
  stop: async () => {
    await RNAudioPro.stop();
  },
  seekTo: async (seconds) => {
    await RNAudioPro.seekTo(seconds);
  },
  seekBy: async (seconds) => {
    await RNAudioPro.seekBy(seconds);
  },
  addEventListener: (eventName, listener) => {
    eventEmitter.addListener(eventName, listener);
  },
  removeEventListener: (eventName, listener) => {
    eventEmitter.removeListener(eventName, listener);
  },
};

export default AudioPro;
