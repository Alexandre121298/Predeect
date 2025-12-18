// src/components/HistoryView.js
import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { lotoService } from '../services/lotoService';

const HistoryView = ({ suggestedDraws, actualDraws, onAddActual }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    numbers: ['', '', '', '', ''],
    chance: ''
  });

  const handleAddDraw = () => {
    // Validation
    const nums = formData.numbers.map(n => parseInt(n));
    const chance = parseInt(formData.chance);

    if (nums.some(n => isNaN(n) || n < 1 || n > 49)) {
      alert('Les numéros doivent être entre 1 et 49');
      return;
    }

    if (isNaN(chance) || chance < 1 || chance > 10) {
      alert('Le numéro chance doit être entre 1 et 10');
      return;
    }

    if (!formData.date) {
      alert('Veuillez entrer une date');
      return;
    }

    const newDraw = {
      id: Date.now(),
      date: formData.date,
      numbers: nums.sort((a, b) => a - b),
      chance: chance,
      actual: true
    };

    onAddActual(newDraw);
    setShowAddModal(false);
    setFormData({ date: '', numbers: ['', '', '', '', ''], chance: '' });
  };

  const handleNumberChange = (index, value) => {
    const newNumbers = [...formData.numbers];
    newNumbers[index] = value;
    setFormData({ ...formData, numbers: newNumbers });
  };

  // Comparer les tirages
  const getComparison = (suggested, actual) => {
    if (!suggested || !actual) return null;
    
    const matchingNumbers = suggested.numbers.filter(num => 
      actual.numbers.includes(num)
    ).length;
    
    const matchingChance = suggested.chance === actual.chance;

    return { matchingNumbers, matchingChance };
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-indigo-900">Historique des Tirages</h2>
            <p className="text-gray-600 mt-1">
              Comparez vos prédictions avec les résultats réels
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Ajouter un Résultat
          </button>
        </div>
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Ajouter un Résultat Réel
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date du tirage
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  5 Numéros (1-49)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {formData.numbers.map((num, idx) => (
                    <input
                      key={idx}
                      type="number"
                      min="1"
                      max="49"
                      value={num}
                      onChange={(e) => handleNumberChange(idx, e.target.value)}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500"
                      placeholder={idx + 1}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro Chance (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.chance}
                  onChange={(e) => setFormData({ ...formData, chance: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddDraw}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des tirages */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Tirages suggérés */}
        <div>
          <h3 className="text-lg font-bold text-indigo-700 mb-4 flex items-center">
            <span className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></span>
            Mes Prédictions ({suggestedDraws.length})
          </h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {suggestedDraws.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg">
                <p className="text-gray-500">Aucune prédiction encore</p>
                <p className="text-sm text-gray-400 mt-2">
                  Générez un tirage dans l'onglet "Générer"
                </p>
              </div>
            ) : (
              suggestedDraws.map((draw) => (
                <div key={draw.id} className="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200">
                  <div className="text-sm text-gray-600 mb-3 font-medium">
                    {draw.date}
                  </div>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {draw.numbers.map((num) => (
                      <div key={num} className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow">
                        {num}
                      </div>
                    ))}
                    <div className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow">
                      {draw.chance}
                    </div>
                  </div>
                  
                  {/* Vérifier s'il y a un résultat correspondant */}
                  {actualDraws.find(a => a.date === draw.date) && (
                    <div className="mt-3 pt-3 border-t border-indigo-300">
                      {(() => {
                        const actual = actualDraws.find(a => a.date === draw.date);
                        const comp = getComparison(draw, actual);
                        return (
                          <div className="flex items-center justify-between">
                            <div className="text-xs">
                              <span className="font-semibold">Résultat: </span>
                              {comp.matchingNumbers} numéro{comp.matchingNumbers > 1 ? 's' : ''} trouvé{comp.matchingNumbers > 1 ? 's' : ''}
                              {comp.matchingChance && ' + Chance ✨'}
                            </div>
                            {comp.matchingNumbers >= 2 || comp.matchingChance ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Résultats réels */}
        <div>
          <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center">
            <span className="w-3 h-3 bg-green-600 rounded-full mr-2"></span>
            Résultats Réels ({actualDraws.length})
          </h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {actualDraws.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg">
                <p className="text-gray-500">Aucun résultat enregistré</p>
                <p className="text-sm text-gray-400 mt-2">
                  Cliquez sur "Ajouter un Résultat"
                </p>
              </div>
            ) : (
              actualDraws.map((draw) => (
                <div key={draw.id} className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                  <div className="text-sm text-gray-600 mb-3 font-medium">
                    {draw.date}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {draw.numbers.map((num) => (
                      <div key={num} className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow">
                        {num}
                      </div>
                    ))}
                    <div className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow">
                      {draw.chance}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Statistiques de prédiction */}
      {suggestedDraws.length > 0 && actualDraws.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            📊 Statistiques de Prédiction
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {suggestedDraws.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Prédictions faites
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {actualDraws.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Résultats vérifiés
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {(() => {
                  let matches = 0;
                  suggestedDraws.forEach(s => {
                    const actual = actualDraws.find(a => a.date === s.date);
                    if (actual) {
                      const comp = getComparison(s, actual);
                      if (comp.matchingNumbers >= 2) matches++;
                    }
                  });
                  return matches;
                })()}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Prédictions gagnantes
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;