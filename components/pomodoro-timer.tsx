import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { PomodoroSession, TimerMode, TimerSettings } from '@/types/pomodoro';
import {
  cancelAllNotifications,
  scheduleNotification,
  setupNotifications,
} from '@/utils/notifications';
import {
  formatTime,
  getCurrentDate,
  getLast7DaysStats
} from '@/utils/stats';
import {
  getPomodoroSessions,
  getSettings,
  savePomodoroSession,
  saveSettings,
} from '@/utils/storage';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>({
    workDuration: 25,
    breakDuration: 5,
  });
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationIdRef = useRef<string | null>(null);

  // Load settings and sessions on mount
  useEffect(() => {
    const loadData = async () => {
      await setupNotifications();
      const savedSettings = await getSettings();
      const savedSessions = await getPomodoroSessions();

      setSettings(savedSettings);
      setSessions(savedSessions);
      setTimeLeft(savedSettings.workDuration * 60);
    };

    loadData();
  }, []);

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    const duration = newMode === 'work' ? settings.workDuration : settings.breakDuration;
    setTimeLeft(duration * 60);
  }, [settings.workDuration, settings.breakDuration]);

  // Timer logic
  const handleTimerComplete = useCallback(async () => {
    setIsRunning(false);

    // Haptic feedback
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Save session
    const session: PomodoroSession = {
      id: Date.now().toString(),
      mode,
      duration: mode === 'work' ? settings.workDuration * 60 : settings.breakDuration * 60,
      completedAt: new Date().toISOString(),
      date: getCurrentDate(),
    };
    await savePomodoroSession(session);
    const updatedSessions = await getPomodoroSessions();
    setSessions(updatedSessions);

    // Send notification
    const nextMode = mode === 'work' ? 'break' : 'work';
    await scheduleNotification(
      'Pomodoro Timer',
      mode === 'work'
        ? '🎉 Work session complete! Time for a break.'
        : '💪 Break is over! Ready to work?',
      0
    );

    // Switch mode
    switchMode(nextMode);
  }, [mode, settings.workDuration, settings.breakDuration, switchMode]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Keep screen awake
      activateKeepAwakeAsync();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      deactivateKeepAwake();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, handleTimerComplete]);

  const handleStartPause = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (isRunning) {
      // Cancel scheduled notification
      if (notificationIdRef.current) {
        await cancelAllNotifications();
      }
    } else {
      // Schedule notification for when timer completes
      const notificationId = await scheduleNotification(
        'Pomodoro Timer',
        mode === 'work'
          ? 'Work session complete!'
          : 'Break is over!',
        timeLeft
      );
      notificationIdRef.current = notificationId;
    }

    setIsRunning(!isRunning);
  };

  const handleReset = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsRunning(false);
    await cancelAllNotifications();
    const duration = mode === 'work' ? settings.workDuration : settings.breakDuration;
    setTimeLeft(duration * 60);
  };

  const handleSaveSettings = async (newSettings: TimerSettings) => {
    await saveSettings(newSettings);
    setSettings(newSettings);

    // Update current timer if not running
    if (!isRunning) {
      const duration = mode === 'work' ? newSettings.workDuration : newSettings.breakDuration;
      setTimeLeft(duration * 60);
    }

    setShowSettings(false);
  };

  const progress = mode === 'work'
    ? 1 - (timeLeft / (settings.workDuration * 60))
    : 1 - (timeLeft / (settings.breakDuration * 60));

  const stats = getLast7DaysStats(sessions);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <LinearGradient
        colors={mode === 'work' ? ['#2E3192', '#1BFFFF'] : ['#F7971E', '#FFD200']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {mode === 'work' ? '🧠 Focus Mode' : '🌿 Relax Mode'}
          </Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => setShowStats(!showStats)} style={styles.iconButton}>
              <Text style={styles.icon}>📈</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.iconButton}>
              <Text style={styles.icon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Timer Card */}
        <View style={styles.timerCard}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          <Text style={styles.modeText}>
            {mode === 'work' ? '💼 Focus Time' : '☕ Break Time'}
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        {/* Control Buttons */}
        <View style={styles.controls}>
          <TouchableOpacity style={[styles.btn, styles.reset]} onPress={handleReset}>
            <Text style={styles.btnText}> Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.start]}
            onPress={handleStartPause}
          >
            <Text style={styles.btnText}>
              {isRunning ? '⏸️ Pause' : '▶️ Start'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mode Switcher */}
        <View style={styles.modeSwitch}>
          <TouchableOpacity
            onPress={() => !isRunning && switchMode('work')}
            style={[styles.switchButton, mode === 'work' && styles.activeSwitch]}
            disabled={isRunning}
          >
            <Text style={[styles.switchText, mode === 'work' && styles.switchTextActive]}>Work</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => !isRunning && switchMode('break')}
            style={[styles.switchButton, mode === 'break' && styles.activeSwitch]}
            disabled={isRunning}
          >
            <Text style={[styles.switchText, mode === 'break' && styles.switchTextActive]}>Break</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        {showStats && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>📊 Productivity Overview</Text>

            {/* Header của bảng */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, { flex: 1.5, fontWeight: 'bold' }]}>📅 Date</Text>
              <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>💼 Sessions</Text>
              <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>⏱️ Duration (min)</Text>
            </View>

            {/* Dòng dữ liệu */}
            {stats.slice(-7).map((s, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>
                  {new Date(s.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{s.workSessions}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{s.totalWorkTime}</Text>
              </View>
            ))}

            {/* Danh sách phiên gần nhất */}
            <Text style={[styles.statsSubtitle, { marginTop: 16 }]}>🕒 Recent Sessions</Text>
            <View style={styles.sessionList}>
              {sessions.slice(0, 5).map((s) => (
                <View key={s.id} style={styles.sessionItem}>
                  <Text style={styles.sessionIcon}>{s.mode === 'work' ? '💼' : '☕'}</Text>
                  <Text style={styles.sessionText}>
                    {s.mode === 'work' ? 'Work' : 'Break'} — {Math.round(s.duration / 60)} min
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </LinearGradient>

      <Modal
        visible={showSettings}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Settings</Text>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Work Duration (minutes)</Text>
              <TextInput
                style={styles.settingInput}
                keyboardType="number-pad"
                value={settings.workDuration.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 1;
                  setSettings({ ...settings, workDuration: value });
                }}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Break Duration (minutes)</Text>
              <TextInput
                style={styles.settingInput}
                keyboardType="number-pad"
                value={settings.breakDuration.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 1;
                  setSettings({ ...settings, breakDuration: value });
                }}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowSettings(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => handleSaveSettings(settings)}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );


}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flexGrow: 1 },
  gradient: { flex: 1, padding: 20 },
  header: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButtons: { flexDirection: 'row', gap: 10 },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 20 },
  timerCard: {
    marginTop: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 50,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  timerText: {
    fontSize: 72,
    color: '#fff',
    fontWeight: 'bold',
  },
  modeText: { fontSize: 20, color: '#fff', opacity: 0.8, marginTop: 8 },
  progressBarContainer: {
    width: '80%',
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: 30,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  controls: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  btn: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  start: { backgroundColor: '#fff' },
  reset: { backgroundColor: 'rgba(255,255,255,0.25)' },
  btnText: { fontSize: 18, fontWeight: '600', color: '#333' },
  modeSwitch: {
    flexDirection: 'row',
    marginTop: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
  },
  switchButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 25,
  },
  activeSwitch: { backgroundColor: '#fff' },
  switchText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  switchTextActive: { color: '#444' },
  // statsCard: {
  //   marginTop: 40,
  //   backgroundColor: 'rgba(255,255,255,0.12)',
  //   borderRadius: 20,
  //   padding: 20,
  // },
  // statsTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  // sessionList: { marginTop: 10 },
  // sessionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  // sessionIcon: { fontSize: 22, marginRight: 8 },
  // sessionText: { color: '#fff', fontSize: 15 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  settingItem: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  settingInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#667eea',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  statsCard: {
    backgroundColor: '#2E2E2E',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#444',
  },
  tableCell: {
    color: '#fff',
    textAlign: 'center',
  },
  sessionList: {
    marginTop: 8,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  sessionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  sessionText: {
    color: '#fff',
  },
});
