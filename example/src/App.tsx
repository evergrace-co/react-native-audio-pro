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

    AudioPro.addEventListener(EventNames.ON_PLAY, onPlay);
    AudioPro.addEventListener(EventNames.ON_PAUSE, onPause);

    return () => {
      AudioPro.removeEventListener(EventNames.ON_PLAY, onPlay);
      AudioPro.removeEventListener(EventNames.ON_PAUSE, onPause);
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
