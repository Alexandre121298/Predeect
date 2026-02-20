// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Shuffle, History, Database, Settings } from 'lucide-react';
import Statistics from './components/Statistics';
import Generator from './components/Generator';
import HistoryView from './components/HistoryView';
import CSVImporter from './components/CSVImporter';
import NotificationManager from './components/NotificationManager';
import { storageService, STORAGE_KEYS } from './services/storageService';
import { syncService } from './services/syncService';
import { drawSchedulerService } from './services/drawSchedulerService';
import QuickAddDraw from './components/QuickAddDraw';

const App = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [suggestedDraws, setSuggestedDraws] = useState([]);
  const [actualDraws, setActualDraws] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [hasHistoricalData, setHasHistoricalData] = useState(false);

  // Charger les données au démarrage
  useEffect(() => {
    let isMounted = true;

    const refreshAfterSync = (result, source) => {
      if (!isMounted || !result) {
        return;
      }

      if (result.success && !result.skipped && result.newDrawsCount > 0) {
        const updatedAt = new Date().toISOString();
        console.log('[' + source + '] ' + result.newDrawsCount + ' nouveau(x) tirage(s) synchronise(s)');
        storageService.save('last_update', updatedAt);
        setLastUpdate(updatedAt);
        loadData();
      }
    };

    loadData();

    // Synchronisation automatique au demarrage
    syncService.autoSync().then(result => {
      refreshAfterSync(result, 'AutoSync');
    }).catch(error => {
      console.error('Erreur de synchronisation automatique:', error);
    });

    drawSchedulerService.start((result) => {
      refreshAfterSync(result, 'ScheduledSync');
    });

    return () => {
      isMounted = false;
      drawSchedulerService.stop();
    };
  }, []);

//   const handleSyncComplete = (result) => {
//   if (result.newDrawsCount > 0) {
//     // Recharger les données
//     loadData();
    
//     // Afficher une notification (optionnel)
//     console.log(`${result.newDrawsCount} nouveau(x) tirage(s) ajouté(s)`);
//   }
// };

const loadData = useCallback(() => {
    // Charger les statistiques
    const savedStats = storageService.load(STORAGE_KEYS.STATS);
    if (savedStats) {
      setStats(savedStats);
      setHasHistoricalData(true);
    } else {
      // Générer des stats de démo si pas de données
      const demoStats = generateDemoStats();
      setStats(demoStats);
    }

    // Charger les tirages suggérés
    const suggested = storageService.load(STORAGE_KEYS.SUGGESTED_DRAWS);
    if (suggested) setSuggestedDraws(suggested);

    // Charger les résultats réels
    const actual = storageService.load(STORAGE_KEYS.ACTUAL_DRAWS);
    if (actual) setActualDraws(actual);

    // Date de dernière mise à jour
    const lastUpd = storageService.load('last_update');
    if (lastUpd) setLastUpdate(lastUpd);
  }, []);

  const generateDemoStats = () => {
    const numberStats = [];
    
    for (let i = 1; i <= 49; i++) {
      numberStats.push({
        number: i,
        frequency: Math.floor(Math.random() * 150) + 50,
        percentage: (Math.random() * 3 + 1).toFixed(2)
      });
    }
    
    numberStats.sort((a, b) => b.frequency - a.frequency);
    
    const chanceStats = [];
    for (let i = 1; i <= 10; i++) {
      chanceStats.push({
        number: i,
        frequency: Math.floor(Math.random() * 200) + 100,
        percentage: (Math.random() * 12 + 8).toFixed(2)
      });
    }
    
    chanceStats.sort((a, b) => b.frequency - a.frequency);
    
    return {
      numbers: numberStats,
      chances: chanceStats,
      totalDraws: 0,
      mostFrequent: numberStats.slice(0, 10),
      leastFrequent: numberStats.slice(-10)
    };
  };

  const handleImportComplete = (draws, newStats) => {
    setStats(newStats);
    setHasHistoricalData(true);
    setLastUpdate(new Date().toISOString());
    storageService.save('last_update', new Date().toISOString());
  };

  const handleGenerateDraw = (draw) => {
    const updatedDraws = [draw, ...suggestedDraws];
    setSuggestedDraws(updatedDraws);
    storageService.save(STORAGE_KEYS.SUGGESTED_DRAWS, updatedDraws);
  };

  const handleAddActualDraw = (draw) => {
    const updatedDraws = [draw, ...actualDraws];
    setActualDraws(updatedDraws);
    storageService.save(STORAGE_KEYS.ACTUAL_DRAWS, updatedDraws);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-indigo-900 mb-2">
                🎰 Predeect
              </h1>
              <p className="text-gray-600">
                Prédictions et statistiques Loto
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Database className="w-4 h-4" />
                <span>
                  {hasHistoricalData 
                    ? `${stats?.totalDraws || 0} tirages analysés`
                    : 'Données de démonstration'
                  }
                </span>
              </div>
              {lastUpdate && (
                <p className="text-xs text-gray-400 mt-1">
                  Mis à jour: {new Date(lastUpdate).toLocaleString('fr-FR')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Message d'import si pas de données */}
        {!hasHistoricalData && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Données de démonstration</strong> - 
                  Importez le fichier CSV de la FDJ pour obtenir de vraies statistiques
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-5 h-5 inline mr-2" />
              Statistiques
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'generate'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Shuffle className="w-5 h-5 inline mr-2" />
              Générer
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <History className="w-5 h-5 inline mr-2" />
              Historique
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-5 h-5 inline mr-2" />
              Paramètres
            </button>
          </div>
        </div>

        {/* Contenu */}
        {activeTab === 'stats' && stats && (
          <Statistics stats={stats} />
        )}

        {activeTab === 'generate' && (
          <Generator 
            onGenerate={handleGenerateDraw}
            lastDraw={suggestedDraws[0]}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            suggestedDraws={suggestedDraws}
            actualDraws={actualDraws}
            onAddActual={handleAddActualDraw}
          />
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* <SyncButton onSyncComplete={handleSyncComplete} /> */}
            <QuickAddDraw onDrawAdded={loadData} />
            <CSVImporter onImportComplete={handleImportComplete} />
            <NotificationManager />
            
            {/* Section de réinitialisation */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-red-700 mb-4">
                Zone Dangereuse
              </h3>
              <p className="text-gray-600 mb-4">
                Supprimer toutes les données de l'application
              </p>
              <button
                onClick={() => {
                  if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les données ?')) {
                    storageService.clearAll();
                    window.location.reload();
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Réinitialiser l'Application
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;