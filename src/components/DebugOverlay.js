import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';

const MAX_LOGS = 50;
const { width } = Dimensions.get('window');

// Global log store
let _logs = [];
let _listeners = [];

const addLog = (level, message, data) => {
  const entry = {
    id: Date.now() + Math.random(),
    timestamp: new Date().toLocaleTimeString(),
    level,
    message: typeof message === 'string' ? message : JSON.stringify(message),
    data: data ? (typeof data === 'string' ? data : JSON.stringify(data, null, 2)) : null,
  };
  _logs = [entry, ..._logs].slice(0, MAX_LOGS);
  _listeners.forEach((fn) => fn([..._logs]));
};

// Override console methods to capture logs
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
};

export const enableDebugLogging = () => {
  console.log = (...args) => {
    originalConsole.log(...args);
    addLog('log', args[0], args.length > 1 ? args.slice(1) : null);
  };
  console.warn = (...args) => {
    originalConsole.warn(...args);
    addLog('warn', args[0], args.length > 1 ? args.slice(1) : null);
  };
  console.error = (...args) => {
    originalConsole.error(...args);
    addLog('error', args[0], args.length > 1 ? args.slice(1) : null);
  };

  // Capture unhandled JS errors
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    addLog('error', `${isFatal ? 'FATAL: ' : ''}${error.message}`, error.stack);
    if (originalHandler) originalHandler(error, isFatal);
  });
};

// Manual log helpers for use anywhere
export const debugLog = (msg, data) => addLog('log', msg, data);
export const debugWarn = (msg, data) => addLog('warn', msg, data);
export const debugError = (msg, data) => addLog('error', msg, data);

const levelColors = {
  log: '#AAAAAA',
  warn: '#FFD60A',
  error: '#FF3B30',
};

const DebugOverlay = () => {
  const [logs, setLogs] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listener = (newLogs) => setLogs(newLogs);
    _listeners.push(listener);
    return () => {
      _listeners = _listeners.filter((fn) => fn !== listener);
    };
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: expanded ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const panelHeight = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  const errorCount = logs.filter((l) => l.level === 'error').length;
  const warnCount = logs.filter((l) => l.level === 'warn').length;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Toggle button */}
      <TouchableOpacity
        style={[
          styles.toggleButton,
          errorCount > 0 && styles.toggleButtonError,
          errorCount === 0 && warnCount > 0 && styles.toggleButtonWarn,
        ]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.toggleText}>
          {expanded ? 'Hide' : 'Debug'}{' '}
          {errorCount > 0 && `(${errorCount}E)`}
          {warnCount > 0 && ` ${warnCount}W`}
        </Text>
      </TouchableOpacity>

      {/* Log panel */}
      <Animated.View style={[styles.panel, { height: panelHeight }]}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Debug Console</Text>
          <TouchableOpacity
            onPress={() => {
              _logs = [];
              setLogs([]);
            }}
          >
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.logList} showsVerticalScrollIndicator={true}>
          {logs.length === 0 ? (
            <Text style={styles.emptyText}>No logs yet</Text>
          ) : (
            logs.map((entry) => (
              <View key={entry.id} style={styles.logEntry}>
                <View style={styles.logHeader}>
                  <View
                    style={[
                      styles.levelDot,
                      { backgroundColor: levelColors[entry.level] },
                    ]}
                  />
                  <Text style={[styles.logLevel, { color: levelColors[entry.level] }]}>
                    {entry.level.toUpperCase()}
                  </Text>
                  <Text style={styles.logTime}>{entry.timestamp}</Text>
                </View>
                <Text style={styles.logMessage} numberOfLines={3}>
                  {entry.message}
                </Text>
                {entry.data && (
                  <Text style={styles.logData} numberOfLines={5}>
                    {entry.data}
                  </Text>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 4,
  },
  toggleButtonError: {
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(60, 10, 10, 0.9)',
  },
  toggleButtonWarn: {
    borderColor: '#FFD60A',
    backgroundColor: 'rgba(60, 50, 10, 0.9)',
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  panel: {
    width: width - 16,
    backgroundColor: 'rgba(15, 15, 15, 0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  panelTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  clearText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '600',
  },
  logList: {
    flex: 1,
    paddingHorizontal: 8,
  },
  emptyText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 20,
  },
  logEntry: {
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  levelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  logLevel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  logTime: {
    fontSize: 10,
    color: '#666',
  },
  logMessage: {
    color: '#DDD',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 16,
  },
  logData: {
    color: '#888',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
    lineHeight: 14,
  },
});

export default DebugOverlay;
