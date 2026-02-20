import { syncService } from './syncService';

class DrawSchedulerService {
  constructor() {
    this.intervalId = null;
    this.syncInProgress = false;
    this.onSyncComplete = null;

    this.drawDays = [1, 3, 6]; // Monday, Wednesday, Saturday
    this.triggerHour = 22;
    this.triggerMinuteWindow = 10;
    this.lastSyncKey = 'predeect_last_scheduled_sync_date';
  }

  start(onSyncComplete) {
    if (this.intervalId) {
      return;
    }

    this.onSyncComplete = onSyncComplete;

    this.checkAndSync();
    this.intervalId = setInterval(() => {
      this.checkAndSync();
    }, 60 * 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async checkAndSync() {
    if (this.syncInProgress) {
      return;
    }

    const now = new Date();
    if (!this.isDrawWindow(now)) {
      return;
    }

    const dateKey = this.getDateKey(now);
    const lastSyncedDate = localStorage.getItem(this.lastSyncKey);
    if (lastSyncedDate === dateKey) {
      return;
    }

    this.syncInProgress = true;

    try {
      const result = await syncService.forceSync();

      if (result?.success) {
        localStorage.setItem(this.lastSyncKey, dateKey);
      }

      if (typeof this.onSyncComplete === 'function') {
        this.onSyncComplete(result);
      }
    } catch (error) {
      console.error('[Scheduler] Scheduled sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  isDrawWindow(date) {
    const isDrawDay = this.drawDays.includes(date.getDay());
    const isDrawHour = date.getHours() === this.triggerHour;
    const inMinuteWindow = date.getMinutes() < this.triggerMinuteWindow;

    return isDrawDay && isDrawHour && inMinuteWindow;
  }

  getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

export const drawSchedulerService = new DrawSchedulerService();
