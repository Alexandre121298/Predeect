// src/components/SyncButton.js
import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { syncService } from '../services/syncService';

const SyncButton = ({ onSyncComplete }) => {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    // Charger les infos de la dernière sync
    updateLastSyncInfo();
  }, []);

  const updateLastSyncInfo = () => {
    const syncInfo = syncService.getLastSyncInfo();
    setLastSync(syncInfo);
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage('Synchronisation en cours...');
    setMessageType('info');

    try {
      const result = await syncService.forceSync();
      
      if (result.success) {
        if (result.newDrawsCount > 0) {
          setMessage(`✅ ${result.newDrawsCount} nouveau(x) tirage(s) ajouté(s) !`);
          setMessageType('success');
          
          // Notifier le parent pour recharger les données
          if (onSyncComplete) {
            onSyncComplete(result);
          }
        } else {
          setMessage('✅ Vous êtes déjà à jour !');
          setMessageType('success');
        }
      } else {
        setMessage(`❌ Erreur: ${result.error || 'Synchronisation échouée'}`);
        setMessageType('error');
      }

      // Mettre à jour les infos de dernière sync
      updateLastSyncInfo();

    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      setMessage('❌ Erreur de connexion');
      setMessageType('error');
    } finally {
      setSyncing(false);
      
      // Effacer le message après 5 secondes
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
  };

  const formatLastSyncDate = () => {
    if (!lastSync) return 'Jamais synchronisé';
    
    const now = new Date();
    const syncDate = lastSync.date;
    const diffMs = now - syncDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} minute(s)`;
    if (diffHours < 24) return `Il y a ${diffHours} heure(s)`;
    return `Il y a ${diffDays} jour(s)`;
  };

  const getMessageStyle = () => {
    switch (messageType) {
      case 'success':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'error':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'info':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-indigo-600" />
            Synchronisation Automatique
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Récupérer automatiquement les derniers tirages du Loto
          </p>
        </div>
      </div>

      {/* Informations de dernière synchronisation */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700">
              Dernière synchronisation
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {formatLastSyncDate()}
            </div>
            {lastSync?.latestDrawDate && (
              <div className="text-xs text-gray-500 mt-1">
                Dernier tirage : {lastSync.latestDrawDate}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bouton de synchronisation */}
      <button
        onClick={handleSync}
        disabled={syncing}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Synchronisation en cours...' : 'Synchroniser Maintenant'}
      </button>

      {/* Message de résultat */}
      {message && (
        <div className={`mt-4 p-3 rounded-lg ${getMessageStyle()} flex items-start gap-2`}>
          {messageType === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
          {messageType === 'error' && <XCircle className="w-5 h-5 flex-shrink-0" />}
          <div className="text-sm flex-1">{message}</div>
        </div>
      )}

      {/* Informations supplémentaires */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          ℹ️ Comment ça marche ?
        </h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• La synchronisation se fait automatiquement toutes les 12 heures</li>
          <li>• Les nouveaux tirages sont ajoutés automatiquement</li>
          <li>• Les statistiques sont recalculées à chaque sync</li>
          <li>• Vous pouvez forcer une sync manuelle avec ce bouton</li>
        </ul>
      </div>
    </div>
  );
};

export default SyncButton;