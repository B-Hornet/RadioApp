import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

const RadioPlayer = ({ onPlay, onPause }) => {
  return (
    <View style={styles.container}>
      <Text>Radio Player</Text>
      <Button title="Play" onPress={onPlay} />
      <Button title="Pause" onPress={onPause} />
    </View>
  );
};

RadioPlayer.propTypes = {
  onPlay: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
});

export default RadioPlayer;

