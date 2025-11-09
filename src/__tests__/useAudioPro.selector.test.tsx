/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useEffect, useState } from 'react';

import renderer, { act } from 'react-test-renderer';

jest.mock('../internalStore', () => jest.requireActual('../internalStore'));

import { internalStore } from '../internalStore';
import { useAudioPro } from '../useAudioPro';

describe('useAudioPro selector', () => {
	afterEach(() => {
		act(() => {
			internalStore.setState({ position: 0, trackPlaying: null });
		});
	});

	it('does not re-render when unrelated state changes', () => {
		let renderCount = 0;
		const Test = () => {
			renderCount++;
			// Only subscribe to the playing track
			useAudioPro((s) => s.trackPlaying);
			return null;
		};

		let testRenderer: renderer.ReactTestRenderer;
		act(() => {
			testRenderer = renderer.create(<Test />);
		});

		expect(renderCount).toBe(1);

		act(() => {
			internalStore.setState({ position: 1000 });
		});
		// position change should not trigger re-render
		expect(renderCount).toBe(1);

		act(() => {
			internalStore.setState({
				trackPlaying: {
					id: '1',
					url: 'https://example.com',
					title: 'Test',
					artwork: 'https://example.com/art.jpg',
				},
			});
		});
		// track change should trigger re-render
		expect(renderCount).toBe(2);

		act(() => {
			testRenderer!.unmount();
		});
	});
});

describe('useAudioPro snapshot stability', () => {
	afterEach(() => {
		act(() => {
			internalStore.setState({
				position: 0,
				duration: 0,
				playbackSpeed: 1,
				volume: 1,
				trackPlaying: null,
			});
		});
	});

	it('preserves reference across unrelated re-renders', () => {
		const snapshots: unknown[] = [];
		let renderCount = 0;
		let forceParentRender: (() => void) | undefined;

		const TestComponent = () => {
			renderCount++;
			const snapshot = useAudioPro();

			useEffect(() => {
				snapshots.push(snapshot);
			}, [snapshot]);

			return null;
		};

		const Parent = () => {
			const [, setTick] = useState(0);
			forceParentRender = () => setTick((value) => value + 1);
			return <TestComponent />;
		};

		let testRenderer: renderer.ReactTestRenderer;
		act(() => {
			testRenderer = renderer.create(<Parent />);
		});

		expect(renderCount).toBe(1);
		expect(snapshots).toHaveLength(1);

		act(() => {
			forceParentRender?.();
		});

		expect(renderCount).toBe(2);
		expect(snapshots).toHaveLength(1);

		act(() => {
			internalStore.setState({ position: 1234 });
		});

		expect(renderCount).toBe(3);
		expect(snapshots).toHaveLength(2);
		expect(snapshots[0]).not.toBe(snapshots[1]);

		act(() => {
			testRenderer!.unmount();
		});
	});
});
