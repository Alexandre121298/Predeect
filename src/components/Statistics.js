// src/components/Statistics.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const Statistics = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Top 10 et Bottom 10 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Numéros les plus sortis */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2" />
            Top 10 - Numéros les Plus Sortis
          </h2>
          <div className="space-y-2">
            {stats.mostFrequent.map((num, idx) => (
              <div key={num.number} className="flex items-center justify-between p-3 bg-green-50 rounded hover:bg-green-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-green-700 w-8">#{idx + 1}</span>
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    {num.number}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{num.frequency} fois</div>
                  <div className="text-xs text-green-600 font-semibold">{num.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Numéros les moins sortis */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-red-700 mb-4 flex items-center">
            <TrendingDown className="w-6 h-6 mr-2" />
            Top 10 - Numéros les Moins Sortis
          </h2>
          <div className="space-y-2">
            {stats.leastFrequent.map((num, idx) => (
              <div key={num.number} className="flex items-center justify-between p-3 bg-red-50 rounded hover:bg-red-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-red-700 w-8">#{idx + 1}</span>
                  <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    {num.number}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{num.frequency} fois</div>
                  <div className="text-xs text-red-600 font-semibold">{num.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graphique de tous les numéros */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-indigo-900 mb-4">
          Fréquence de tous les numéros (1-49)
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={stats.numbers}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="number" 
              label={{ value: 'Numéros', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: 'Fréquence', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'frequency') return [value, 'Sorties'];
                return value;
              }}
            />
            <Legend />
            <Bar dataKey="frequency" fill="#4F46E5" name="Nombre de sorties" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Statistiques des Numéros Chance */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-indigo-900 mb-4">
          Fréquence des Numéros Chance (1-10)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.chances.map((chance) => (
            <div 
              key={chance.number} 
              className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl font-bold text-orange-700 mb-2">
                {chance.number}
              </div>
              <div className="text-sm text-gray-600 mb-1">
                {chance.frequency} fois
              </div>
              <div className="text-xs text-orange-600 font-semibold">
                {chance.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques supplémentaires */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-2">Total de Tirages</div>
          <div className="text-4xl font-bold">{stats.totalDraws}</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-2">Numéro le + Fréquent</div>
          <div className="text-4xl font-bold">{stats.mostFrequent[0]?.number}</div>
          <div className="text-xs opacity-75 mt-1">
            {stats.mostFrequent[0]?.frequency} sorties ({stats.mostFrequent[0]?.percentage}%)
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-lg shadow-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-2">Numéro le - Fréquent</div>
          <div className="text-4xl font-bold">{stats.leastFrequent[0]?.number}</div>
          <div className="text-xs opacity-75 mt-1">
            {stats.leastFrequent[0]?.frequency} sorties ({stats.leastFrequent[0]?.percentage}%)
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;