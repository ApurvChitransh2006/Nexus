const notificationAudio = new Audio('/notification.mp3');
notificationAudio.preload = 'auto';

let ringtoneAudio = null;

export function playNotificationSound() {
  try {
    notificationAudio.currentTime = 0;
    const playPromise = notificationAudio.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }
  } catch {
    // Autoplay may be blocked until user interaction
  }
}

export function startRingtone() {
  try {
    stopRingtone();
    ringtoneAudio = new Audio('/ringtone.mp3');
    ringtoneAudio.loop = true;
    ringtoneAudio.preload = 'auto';
    const playPromise = ringtoneAudio.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }
  } catch {
    // Autoplay may be blocked until user interaction
  }
}

export function stopRingtone() {
  if (!ringtoneAudio) return;
  ringtoneAudio.pause();
  ringtoneAudio.currentTime = 0;
  ringtoneAudio = null;
}
