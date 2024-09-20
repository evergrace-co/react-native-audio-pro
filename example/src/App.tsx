import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
import AudioPro, { EventNames } from 'react-native-audio-pro';

const App: React.FC = () => {
  useEffect(() => {
    const onPlay = () => {
      console.log('Playback started');
    };

    const onPause = () => {
      console.log('Playback paused');
    };

    const onPlayListener = AudioPro.addEventListener(
      EventNames.ON_PLAY,
      onPlay
    );
    const onPauseListener = AudioPro.addEventListener(
      EventNames.ON_PAUSE,
      onPause
    );

    return () => {
      onPlayListener.remove();
      onPauseListener.remove();
    };
  }, []);

  const handlePlay = async () => {
    try {
      await AudioPro.play('https://example.com/audio.mp3');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View>
      <Button title="Play Audio" onPress={handlePlay} />
    </View>
  );
};

export default App;
