// src/components/HistoryView.js
import React from 'react';
import { Calendar, Trash2 } from 'lucide-react';
import { storageService, STORAGE_KEYS } from '../services/storageService';

const HistoryView = ({ suggestedDraws, onUpdate }) => {
  
  const handleDelete = (drawId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce tirage ?')) {
      const updatedDraws = suggestedDraws.filter(draw => draw.id !== drawId);
      storageService.save(STORAGE_KEYS.SUGGESTED_DRAWS, updatedDraws);
      if (onUpdate) onUpdate();
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer TOUS les tirages générés ?')) {
      storageService.save(STORAGE_KEYS.SUGGESTED_DRAWS, []);
      if (onUpdate) onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-indigo-900">Mes Prédictions</h2>
            <p className="text-gray-600 mt-1">
              Historique de tous vos tirages générés
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-indigo-600">
              {suggestedDraws.length}
            </div>
            <div className="text-sm text-gray-600">
              {suggestedDraws.length > 1 ? 'Tirages' : 'Tirage'}
            </div>
          </div>
        </div>

        {suggestedDraws.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleDeleteAll}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer tout l'historique
            </button>
          </div>
        )}
      </div>

      {/* Liste des tirages */}
      {suggestedDraws.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Calendar className="w-16 h-16 mx-auto opacity-50" />
          </div>
          <p className="text-gray-500 text-lg mb-2">Aucun tirage généré</p>
          <p className="text-sm text-gray-400">
            Allez dans l'onglet "Générer" pour créer vos premiers tirages
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            {suggestedDraws.map((draw) => (
              <div 
                key={draw.id} 
                className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-5 border-2 border-indigo-200 hover:border-indigo-300 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold">{draw.date}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(draw.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1"
                    title="Supprimer ce tirage"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Numéros principaux */}
                <div className="mb-3">
                  <div className="text-xs text-gray-600 mb-2 font-medium">
                    5 Numéros
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {draw.numbers.map((num) => (
                      <div 
                        key={num} 
                        className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Numéro Chance */}
                <div>
                  <div className="text-xs text-gray-600 mb-2 font-medium">
                    Numéro Chance
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                      {draw.chance}
                    </div>
                    {draw.timestamp && (
                      <span className="text-xs text-gray-500">
                        Généré le {new Date(draw.timestamp).toLocaleString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistiques globales */}
      {suggestedDraws.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            📊 Statistiques
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {suggestedDraws.length}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Total de tirages
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {suggestedDraws[0]?.date || '-'}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Dernier tirage
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(() => {
                  // Calculer le numéro le plus joué
                  const allNumbers = suggestedDraws.flatMap(d => d.numbers);
                  const freq = {};
                  allNumbers.forEach(n => freq[n] = (freq[n] || 0) + 1);
                  const mostPlayed = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
                  return mostPlayed ? mostPlayed[0] : '-';
                })()}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                N° le plus joué
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {(() => {
                  // Calculer la chance la plus jouée
                  const allChances = suggestedDraws.map(d => d.chance);
                  const freq = {};
                  allChances.forEach(c => freq[c] = (freq[c] || 0) + 1);
                  const mostPlayed = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
                  return mostPlayed ? mostPlayed[0] : '-';
                })()}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Chance la plus jouée
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;