import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';  // Import PropTypes for validation

const Button = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

// Define PropTypes for the component
Button.propTypes = {
  title: PropTypes.string.isRequired,  // title should be a string and is required
  onPress: PropTypes.func.isRequired,  // onPress should be a function and is required
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1e90ff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Button;

