// src/components/QuickAddDraw.js
import React, { useState } from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import { storageService, STORAGE_KEYS } from '../services/storageService';
import { lotoService } from '../services/lotoService';

const QuickAddDraw = ({ onDrawAdded }) => {
  const [date, setDate] = useState('');
  const [numbers, setNumbers] = useState(['', '', '', '', '']);
  const [chance, setChance] = useState('');
  const [message, setMessage] = useState('');

  const handleNumberChange = (index, value) => {
    const newNumbers = [...numbers];
    newNumbers[index] = value;
    setNumbers(newNumbers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const nums = numbers.map(n => parseInt(n));
    const chanceNum = parseInt(chance);

    if (nums.some(n => isNaN(n) || n < 1 || n > 49)) {
      setMessage('❌ Les numéros doivent être entre 1 et 49');
      return;
    }

    if (isNaN(chanceNum) || chanceNum < 1 || chanceNum > 10) {
      setMessage('❌ Le numéro chance doit être entre 1 et 10');
      return;
    }

    if (!date) {
      setMessage('❌ Veuillez entrer une date');
      return;
    }

    try {
      // Créer le nouveau tirage
      const newDraw = {
        date: date.split('-').reverse().join('/'), // YYYY-MM-DD → DD/MM/YYYY
        numbers: nums.sort((a, b) => a - b),
        chance: chanceNum
      };

      // Récupérer les tirages existants
      const existingDraws = storageService.load(STORAGE_KEYS.HISTORICAL_DATA) || [];
      
      // Vérifier si ce tirage existe déjà
      const exists = existingDraws.some(d => d.date === newDraw.date);
      if (exists) {
        setMessage('⚠️ Ce tirage existe déjà');
        return;
      }

      // Ajouter le nouveau tirage
      const allDraws = [newDraw, ...existingDraws];
      
      // Trier par date
      allDraws.sort((a, b) => {
        const dateA = a.date.split('/').reverse().join('');
        const dateB = b.date.split('/').reverse().join('');
        return dateB.localeCompare(dateA);
      });

      // Sauvegarder
      storageService.save(STORAGE_KEYS.HISTORICAL_DATA, allDraws);

      // Recalculer les stats
      const stats = lotoService.calculateStats(allDraws);
      storageService.save(STORAGE_KEYS.STATS, stats);

      setMessage('✅ Tirage ajouté avec succès !');
      
      // Réinitialiser le formulaire
      setDate('');
      setNumbers(['', '', '', '', '']);
      setChance('');

      // Notifier le parent
      if (onDrawAdded) onDrawAdded();

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erreur lors de l\'ajout');
    }
  };

  // Pré-remplir avec la date d'aujourd'hui
  const setToday = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    setDate(dateStr);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5" />
        Ajout Rapide d'un Tirage
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date du tirage
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            <button
              type="button"
              onClick={setToday}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
            >
              Aujourd'hui
            </button>
          </div>
        </div>

        {/* 5 Numéros */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            5 Numéros (1-49)
          </label>
          <div className="grid grid-cols-5 gap-2">
            {numbers.map((num, idx) => (
              <input
                key={idx}
                type="number"
                min="1"
                max="49"
                value={num}
                onChange={(e) => handleNumberChange(idx, e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={idx + 1}
                required
              />
            ))}
          </div>
        </div>

        {/* Numéro Chance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numéro Chance (1-10)
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={chance}
            onChange={(e) => setChance(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Numéro Chance"
            required
          />
        </div>

        {/* Bouton Submit */}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Ajouter ce Tirage
        </button>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
            message.includes('✅') 
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.includes('✅') && <CheckCircle className="w-4 h-4" />}
            {message}
          </div>
        )}
      </form>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800">
          💡 <strong>Astuce :</strong> Consultez les résultats sur{' '}
          <a 
            href="https://www.fdj.fr/jeux-de-tirage/loto/resultats" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-blue-900"
          >
            fdj.fr
          </a>
          {' '}et ajoutez-les manuellement ici après chaque tirage.
        </p>
      </div>
    </div>
  );
};

export default QuickAddDraw;