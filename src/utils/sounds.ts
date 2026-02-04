import { Platform } from 'react-native';

export const playCompletionSound = () => {
  if (Platform.OS === 'web') {
    // Create a pleasant completion sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create oscillators for a chord (major triad)
    const playNote = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      // Envelope for smooth sound
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = audioContext.currentTime;

    // Play a pleasant ascending arpeggio (C major chord)
    playNote(523.25, now, 0.3);        // C5
    playNote(659.25, now + 0.1, 0.3);  // E5
    playNote(783.99, now + 0.2, 0.5);  // G5
  }
  // For native platforms, we could use expo-av here
  // For now, only web is implemented
};
