// src/components/Generator.js
import React from 'react';
import { Shuffle, Calendar, Sparkles } from 'lucide-react';
import { lotoService } from '../services/lotoService';

const Generator = ({ onGenerate, lastDraw }) => {
  const handleGenerate = () => {
    const newDraw = lotoService.generateRandomDraw();
    onGenerate(newDraw);
  };

  const nextDrawDate = lotoService.getNextDrawDate();

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {/* En-tête */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-indigo-100 p-4 rounded-full">
            <Sparkles className="w-12 h-12 text-indigo-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-indigo-900 mb-2">
          Générateur de Tirage Aléatoire
        </h2>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Calendar className="w-5 h-5" />
          <span>Prochain tirage : <strong>{nextDrawDate}</strong></span>
        </div>
      </div>

      {/* Bouton de génération */}
      <div className="flex justify-center mb-8">
        <button
          onClick={handleGenerate}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-3"
        >
          <Shuffle className="w-6 h-6" />
          Générer un Nouveau Tirage
        </button>
      </div>

      {/* Dernier tirage suggéré */}
      {lastDraw && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border-2 border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-indigo-900">
              Dernier Tirage Suggéré
            </h3>
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {lastDraw.date}
            </div>
          </div>

          {/* Numéros principaux */}
          <div className="mb-6">
            <div className="text-sm font-semibold text-gray-700 mb-3">
              5 Numéros
            </div>
            <div className="flex gap-3 justify-center">
              {lastDraw.numbers.map((num, idx) => (
                <div
                  key={num}
                  className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg animate-bounce"
                  style={{ animationDelay: `${idx * 0.1}s`, animationDuration: '1s', animationIterationCount: '1' }}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>

          {/* Numéro Chance */}
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-3 text-center">
              Numéro Chance
            </div>
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
                {lastDraw.chance}
              </div>
            </div>
          </div>

          {/* Timestamp */}
          {lastDraw.timestamp && (
            <div className="mt-4 text-center text-xs text-gray-500">
              Généré le {new Date(lastDraw.timestamp).toLocaleString('fr-FR')}
            </div>
          )}
        </div>
      )}

      {!lastDraw && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Shuffle className="w-16 h-16 mx-auto opacity-50" />
          </div>
          <p className="text-gray-500">
            Aucun tirage généré pour le moment.<br />
            Cliquez sur le bouton ci-dessus pour commencer !
          </p>
        </div>
      )}

      {/* Informations */}
      <div className="mt-8 bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Information</h4>
        <p className="text-sm text-blue-800">
          Les tirages sont générés de manière totalement aléatoire. 
          Ils sont automatiquement sauvegardés dans l'historique pour vous permettre de suivre vos prédictions.
        </p>
      </div>

      {/* Jours de tirage */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">📅 Jours de Tirage</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 text-center border-2 border-indigo-200">
            <div className="font-bold text-indigo-600">Lundi</div>
            <div className="text-xs text-gray-600 mt-1">20h15</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border-2 border-indigo-200">
            <div className="font-bold text-indigo-600">Mercredi</div>
            <div className="text-xs text-gray-600 mt-1">20h15</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border-2 border-indigo-200">
            <div className="font-bold text-indigo-600">Samedi</div>
            <div className="text-xs text-gray-600 mt-1">20h15</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;