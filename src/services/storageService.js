const STORAGE_KEYS = {
  SUGGESTED_DRAWS: 'predeect_suggested_draws',
  ACTUAL_DRAWS: 'predeect_actual_draws',
  HISTORICAL_DATA: 'predeect_historical_data',
  STATS: 'predeect_stats'
};

class StorageService {
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
      return false;
    }
  }

  load(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erreur de chargement:', error);
      return null;
    }
  }

  delete(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Erreur de suppression:', error);
      return false;
    }
  }

  clearAll() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const storageService = new StorageService();
export { STORAGE_KEYS };