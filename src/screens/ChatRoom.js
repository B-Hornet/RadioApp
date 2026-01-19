// File: src/screens/ChatRoom.js
// ChatRoom screen with video player and live chat functionality

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import PropTypes from 'prop-types';
import VideoPlayer, { PlayerState } from '../components/VideoPlayer';
import { getPlaybackUrlForStream, PlaybackMode } from '../services/cloudflareStreamService';

/**
 * ChatRoom Screen Component
 *
 * Displays a live video stream with an integrated chat interface.
 * Receives stream data via navigation params.
 */
const ChatRoom = ({ route, navigation }) => {
  // Get stream data from navigation params
  const streamData = route?.params?.stream;

  // State
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [playerState, setPlayerState] = useState(PlayerState.IDLE);
  const [error, setError] = useState(null);

  // Refs
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  /**
   * Initialize chat connection
   */
  useEffect(() => {
    if (!streamData) {
      setError('No stream data provided');
      return;
    }

    // Set navigation title
    navigation.setOptions({
      title: streamData.title || 'Live Stream',
    });

    // Simulate chat connection (replace with actual Firebase/WebSocket connection)
    const connectChat = async () => {
      try {
        // TODO: Connect to Firebase Realtime Database for chat
        // const chatRef = database.ref(`chats/${streamData.id}`);
        // chatRef.on('child_added', (snapshot) => {
        //   const message = snapshot.val();
        //   setMessages(prev => [...prev, { id: snapshot.key, ...message }]);
        // });

        setIsConnected(true);

        // Add welcome message
        setMessages([
          {
            id: 'system-1',
            text: `Welcome to ${streamData.title || 'the stream'}!`,
            username: 'System',
            timestamp: Date.now(),
            isSystem: true,
          },
        ]);
      } catch (err) {
        console.error('Chat connection error:', err);
        setError('Failed to connect to chat');
      }
    };

    connectChat();

    // Cleanup on unmount
    return () => {
      // TODO: Disconnect from Firebase
      // chatRef.off();
      setIsConnected(false);
    };
  }, [streamData, navigation]);

  /**
   * Handle video player state changes
   */
  const handlePlayerStateChange = useCallback((state) => {
    setPlayerState(state);
  }, []);

  /**
   * Handle video player errors
   */
  const handlePlayerError = useCallback((err) => {
    console.error('Video player error in ChatRoom:', err);

    // Show user-friendly error
    if (err.friendlyMessage) {
      Alert.alert(
        'Playback Error',
        err.friendlyMessage,
        [
          { text: 'OK' },
          {
            text: 'Go Back',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  }, [navigation]);

  /**
   * Send a chat message
   */
  const sendMessage = useCallback(() => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      text: inputMessage.trim(),
      username: 'You', // TODO: Get from auth
      timestamp: Date.now(),
      isSystem: false,
    };

    // TODO: Send to Firebase
    // database.ref(`chats/${streamData.id}`).push(newMessage);

    // Optimistically add to local state
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [inputMessage]);

  /**
   * Render a chat message
   */
  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.isSystem && styles.systemMessage,
      ]}
    >
      <Text
        style={[
          styles.username,
          item.isSystem && styles.systemUsername,
        ]}
      >
        {item.username}
      </Text>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  /**
   * Render empty chat state
   */
  const renderEmptyChat = () => (
    <View style={styles.emptyChatContainer}>
      <Text style={styles.emptyChatText}>
        No messages yet. Be the first to chat!
      </Text>
    </View>
  );

  /**
   * Render error state
   */
  if (error || !streamData) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorIcon}>!</Text>
        <Text style={styles.errorTitle}>Unable to Load Stream</Text>
        <Text style={styles.errorText}>
          {error || 'Stream data not available'}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Video Player */}
        <View style={styles.videoContainer}>
          <VideoPlayer
            streamData={streamData}
            autoPlay={true}
            muted={false}
            showControls={true}
            onError={handlePlayerError}
            onStateChange={handlePlayerStateChange}
            style={styles.videoPlayer}
          />

          {/* Stream info overlay */}
          <View style={styles.streamInfoOverlay}>
            <View style={styles.streamInfo}>
              {streamData.isLive && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveIndicator} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
              {streamData.viewerCount !== undefined && (
                <Text style={styles.viewerCount}>
                  {streamData.viewerCount} watching
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Stream Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.streamTitle} numberOfLines={1}>
            {streamData.title || 'Live Stream'}
          </Text>
          <Text style={styles.streamerName} numberOfLines={1}>
            {streamData.streamerName || 'Unknown Streamer'}
          </Text>
        </View>

        {/* Chat Section */}
        <View style={styles.chatContainer}>
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <Text style={styles.chatHeaderText}>Live Chat</Text>
            <View
              style={[
                styles.connectionIndicator,
                isConnected ? styles.connected : styles.disconnected,
              ]}
            />
          </View>

          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            ListEmptyComponent={renderEmptyChat}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }}
          />

          {/* Message Input */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Send a message..."
              placeholderTextColor="#888"
              value={inputMessage}
              onChangeText={setInputMessage}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              maxLength={200}
              editable={isConnected}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputMessage.trim() || !isConnected) && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!inputMessage.trim() || !isConnected}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

ChatRoom.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      stream: PropTypes.object,
    }),
  }),
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    setOptions: PropTypes.func.isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  keyboardAvoid: {
    flex: 1,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  streamInfoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  streamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff0000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 4,
  },
  liveText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  viewerCount: {
    color: '#fff',
    fontSize: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  titleContainer: {
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  streamTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  streamerName: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 2,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  chatHeaderText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connected: {
    backgroundColor: '#4CAF50',
  },
  disconnected: {
    backgroundColor: '#ff4444',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 12,
    flexGrow: 1,
  },
  emptyChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyChatText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#252525',
    borderRadius: 8,
  },
  systemMessage: {
    backgroundColor: 'rgba(30, 144, 255, 0.2)',
    borderLeftWidth: 3,
    borderLeftColor: '#1e90ff',
  },
  username: {
    color: '#1e90ff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  systemUsername: {
    color: '#1e90ff',
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#1a1a1a',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#252525',
    borderRadius: 20,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 14,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#1e90ff',
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    fontSize: 60,
    color: '#ff4444',
    marginBottom: 20,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#1e90ff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatRoom;
