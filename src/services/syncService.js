// src/services/syncService.js
import { storageService, STORAGE_KEYS } from './storageService';
import { lotoService } from './lotoService';

class SyncService {
  constructor() {
    // En production, utilisez votre domaine Vercel
    this.API_URL = window.location.origin;
    this.lastSyncKey = 'predeect_last_sync';
    this.lastDrawKey = 'predeect_last_draw_date';
  }

  // Vérifier s'il y a de nouveaux tirages
  async checkForNewDraws() {
    try {
      console.log('🔄 [Sync] Vérification des nouveaux tirages...');

      const response = await fetch(`${this.API_URL}/api/fetch-latest-draw`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_CRON_SECRET || ''}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur API');
      }

      const data = await response.json();
      
      console.log(`📥 [Sync] ${data.count} tirages reçus de l'API`);

      if (data.success && data.allDraws && data.allDraws.length > 0) {
        const newDraws = await this.mergeNewDraws(data.allDraws);
        return {
          success: true,
          newDrawsCount: newDraws.length,
          newDraws: newDraws,
          latestDraw: data.latestDraw
        };
      }

      return {
        success: true,
        newDrawsCount: 0,
        newDraws: [],
        message: 'Aucun nouveau tirage'
      };

    } catch (error) {
      console.error('❌ [Sync] Erreur de synchronisation:', error);
      return {
        success: false,
        error: error.message,
        newDrawsCount: 0
      };
    }
  }

  // Fusionner les nouveaux tirages avec les existants
  async mergeNewDraws(newDraws) {
    console.log(`🔀 [Sync] Fusion de ${newDraws.length} tirages...`);

    // Récupérer les tirages existants
    const existingDraws = storageService.load(STORAGE_KEYS.HISTORICAL_DATA) || [];
    console.log(`📊 [Sync] ${existingDraws.length} tirages existants en local`);
    
    // Créer un Set des dates existantes pour une recherche rapide
    const existingDates = new Set(existingDraws.map(d => d.date));
    
    // Filtrer pour ne garder que les vraiment nouveaux tirages
    const reallyNewDraws = newDraws.filter(draw => !existingDates.has(draw.date));
    
    if (reallyNewDraws.length === 0) {
      console.log('✅ [Sync] Aucun nouveau tirage à ajouter');
      
      // Marquer quand même la synchronisation
      this.markSyncComplete(newDraws[0]?.date);
      
      return [];
    }

    console.log(`➕ [Sync] ${reallyNewDraws.length} nouveau(x) tirage(s) trouvé(s)`);
    reallyNewDraws.forEach(draw => {
      console.log(`   📅 ${draw.date} - ${draw.numbers.join(', ')} + Chance: ${draw.chance}`);
    });

    // Combiner les nouveaux avec les existants
    const allDraws = [...reallyNewDraws, ...existingDraws];

    // Trier par date (plus récent en premier)
    allDraws.sort((a, b) => {
      const dateA = a.date.split('/').reverse().join('');
      const dateB = b.date.split('/').reverse().join('');
      return dateB.localeCompare(dateA);
    });

    // Sauvegarder les tirages mis à jour
    storageService.save(STORAGE_KEYS.HISTORICAL_DATA, allDraws);
    console.log(`💾 [Sync] ${allDraws.length} tirages sauvegardés`);

    // Recalculer les statistiques
    console.log('📊 [Sync] Recalcul des statistiques...');
    const stats = lotoService.calculateStats(allDraws);
    storageService.save(STORAGE_KEYS.STATS, stats);

    // Marquer la synchronisation comme complète
    this.markSyncComplete(newDraws[0]?.date);

    return reallyNewDraws;
  }

  // Marquer la synchronisation comme complète
  markSyncComplete(latestDrawDate) {
    const syncInfo = {
      timestamp: new Date().toISOString(),
      latestDrawDate: latestDrawDate,
      success: true
    };
    
    localStorage.setItem(this.lastSyncKey, JSON.stringify(syncInfo));
    
    if (latestDrawDate) {
      localStorage.setItem(this.lastDrawKey, latestDrawDate);
    }
  }

  // Récupérer les informations de la dernière synchronisation
  getLastSyncInfo() {
    try {
      const syncInfoStr = localStorage.getItem(this.lastSyncKey);
      if (!syncInfoStr) return null;
      
      const syncInfo = JSON.parse(syncInfoStr);
      return {
        ...syncInfo,
        date: new Date(syncInfo.timestamp)
      };
    } catch (error) {
      return null;
    }
  }

  // Vérifier si une synchronisation est nécessaire
  needsSync() {
    const lastSync = this.getLastSyncInfo();
    
    if (!lastSync) {
      console.log('🆕 [Sync] Première synchronisation nécessaire');
      return true;
    }

    const now = new Date();
    const hoursSinceLastSync = (now - lastSync.date) / (1000 * 60 * 60);
    
    // Synchroniser si la dernière sync date de plus de 12 heures
    if (hoursSinceLastSync > 12) {
      console.log(`⏰ [Sync] Dernière sync il y a ${hoursSinceLastSync.toFixed(1)}h - Synchronisation nécessaire`);
      return true;
    }

    console.log(`✅ [Sync] Dernière sync il y a ${hoursSinceLastSync.toFixed(1)}h - Pas besoin de synchroniser`);
    return false;
  }

  // Synchronisation automatique au démarrage
  async autoSync() {
    if (!this.needsSync()) {
      return {
        success: true,
        skipped: true,
        message: 'Synchronisation non nécessaire'
      };
    }

    console.log('🔄 [Sync] Lancement de la synchronisation automatique...');
    return await this.checkForNewDraws();
  }

  // Forcer une synchronisation manuelle
  async forceSync() {
    console.log('🔄 [Sync] Synchronisation manuelle forcée');
    return await this.checkForNewDraws();
  }
}

export const syncService = new SyncService();