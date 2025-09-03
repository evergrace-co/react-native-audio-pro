/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
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
