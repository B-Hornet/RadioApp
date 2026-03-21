import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { db, auth } from '../firebaseConfig';
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

const AUTO_USERNAME_PATTERN = /^user[a-z0-9]{4,10}$/;
const VALID_USERNAME = /^[a-zA-Z0-9_]{3,20}$/;

const UsernameSetupScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (value) => {
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (value.length > 20) return 'Username must be 20 characters or less';
    if (!VALID_USERNAME.test(value)) return 'Letters, numbers, and underscores only';
    if (AUTO_USERNAME_PATTERN.test(value.toLowerCase())) return 'Please choose a more personal username';
    return '';
  };

  const handleConfirm = async () => {
    const trimmed = username.trim();
    const validationError = validate(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Check uniqueness
      const usersRef = collection(db, 'Users');
      const q = query(usersRef, where('username_lower', '==', trimmed.toLowerCase()));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // Make sure it's not the current user's own document
        const isOwnDoc = snapshot.docs.some((d) => d.id === auth.currentUser?.uid);
        if (!isOwnDoc) {
          setError('This username is already taken');
          setIsSubmitting(false);
          return;
        }
      }

      // Write to Firestore
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setError('Not signed in. Please restart the app.');
        setIsSubmitting(false);
        return;
      }

      await setDoc(
        doc(db, 'Users', uid),
        {
          username: trimmed,
          username_lower: trimmed.toLowerCase(),
        },
        { merge: true }
      );

      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (err) {
      console.error('Username setup error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (value) => {
    // Strip spaces
    const cleaned = value.replace(/\s/g, '');
    setUsername(cleaned);
    if (error) setError('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.icon}>{'\uD80C\uDC04'}</Text>
        <Text style={styles.title}>Choose Your Username</Text>
        <Text style={styles.subtitle}>
          This is how you'll appear in chat and across the app.
        </Text>

        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="Enter username"
          placeholderTextColor="#5A6A80"
          value={username}
          onChangeText={handleChange}
          maxLength={20}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleConfirm}
          editable={!isSubmitting}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.hint}>3-20 characters. Letters, numbers, underscores.</Text>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!username.trim() || isSubmitting) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!username.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#E8ECF1" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Username</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#081425',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#0B1628',
    borderRadius: 14,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A2A40',
  },
  icon: {
    fontSize: 32,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E8ECF1',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#8A9AB5',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#0E1D33',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#E8ECF1',
    width: '100%',
    borderWidth: 1,
    borderColor: '#1A2A40',
  },
  inputError: {
    borderColor: '#FF4D4D',
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 12,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  hint: {
    color: '#5A6A80',
    fontSize: 11,
    marginTop: 8,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  confirmButton: {
    backgroundColor: '#3F8CFF',
    borderRadius: 10,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmButtonText: {
    color: '#E8ECF1',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default UsernameSetupScreen;
