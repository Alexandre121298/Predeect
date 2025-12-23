import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { lotoService } from '../services/lotoService';
import { storageService, STORAGE_KEYS } from '../services/storageService';

const CSVImporter = ({ onImportComplete }) => {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [importStats, setImportStats] = useState(null);
  const [files, setFiles] = useState([]);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
    setError(null);
    setSuccess(false);
  };

  const handleImport = async () => {
    if (files.length === 0) {
      setError('Veuillez sélectionner au moins un fichier CSV');
      return;
    }

    setImporting(true);
    setError(null);
    setSuccess(false);

    try {
      let allDraws = [];
      const fileResults = [];

      for (const file of files) {
        try {
          console.log(`Import de ${file.name}...`);
          const draws = await lotoService.parseCSV(file);
          
          if (draws.length > 0) {
            allDraws = allDraws.concat(draws);
            fileResults.push({
              name: file.name,
              count: draws.length,
              success: true
            });
          } else {
            fileResults.push({
              name: file.name,
              count: 0,
              success: false,
              error: 'Aucune donnée valide trouvée'
            });
          }
        } catch (err) {
          console.error(`Erreur avec ${file.name}:`, err);
          fileResults.push({
            name: file.name,
            count: 0,
            success: false,
            error: err.message
          });
        }
      }

      if (allDraws.length === 0) {
        throw new Error('Aucune donnée valide trouvée dans les fichiers');
      }

      allDraws.sort((a, b) => {
        const dateA = a.date.split('/').reverse().join('');
        const dateB = b.date.split('/').reverse().join('');
        return dateB.localeCompare(dateA);
      });

      const uniqueDraws = [];
      const seenDates = new Set();
      
      for (const draw of allDraws) {
        if (!seenDates.has(draw.date)) {
          uniqueDraws.push(draw);
          seenDates.add(draw.date);
        }
      }

      storageService.save(STORAGE_KEYS.HISTORICAL_DATA, uniqueDraws);
      const stats = lotoService.calculateStats(uniqueDraws);
      storageService.save(STORAGE_KEYS.STATS, stats);

      setSuccess(true);
      setImportStats({
        totalFiles: files.length,
        successfulFiles: fileResults.filter(f => f.success).length,
        totalDraws: uniqueDraws.length,
        fileResults
      });

      onImportComplete(uniqueDraws, stats);
    } catch (err) {
      console.error('Erreur globale:', err);
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setError(null);
    setSuccess(false);
    setImportStats(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
        <FileText className="w-6 h-6 mr-2" />
        Importer les Données Historiques
      </h2>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">📋 Instructions</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Téléchargez les fichiers CSV depuis la FDJ</li>
          <li>Vous pouvez sélectionner <strong>plusieurs fichiers</strong> à la fois</li>
          <li>L'application détecte automatiquement le format de chaque fichier</li>
          <li>Les doublons sont automatiquement supprimés</li>
        </ol>
      </div>

      <div className="mb-4">
        <a 
          href="https://www.fdj.fr/jeux-de-tirage/loto/historique"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 underline font-medium"
        >
          🔗 Télécharger depuis FDJ.fr
        </a>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          id="csv-upload"
          disabled={importing}
          multiple
        />
        <label
          htmlFor="csv-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <span className="text-gray-600 font-medium">
            {files.length === 0 
              ? 'Cliquez pour sélectionner des fichiers CSV'
              : `${files.length} fichier(s) sélectionné(s)`
            }
          </span>
          <span className="text-xs text-gray-500 mt-2">
            Vous pouvez sélectionner plusieurs fichiers à la fois
          </span>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Fichiers sélectionnés :</h3>
          <div className="space-y-1">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <FileText className="w-4 h-4" />
                <span>{file.name}</span>
                <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {importing ? 'Import en cours...' : 'Importer les fichiers'}
            </button>
            <button
              onClick={clearFiles}
              disabled={importing}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg disabled:bg-gray-100"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-red-700">Erreur d'import</div>
              <div className="text-sm text-red-600 mt-1">{error}</div>
            </div>
          </div>
        </div>
      )}

      {success && importStats && (
        <div className="mt-4 space-y-3">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-700">
                Import réussi !
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="bg-white rounded p-3 text-center">
                <div className="text-2xl font-bold text-indigo-600">{importStats.totalFiles}</div>
                <div className="text-xs text-gray-600">Fichiers traités</div>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{importStats.successfulFiles}</div>
                <div className="text-xs text-gray-600">Réussis</div>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">{importStats.totalDraws}</div>
                <div className="text-xs text-gray-600">Tirages importés</div>
              </div>
            </div>

            <div className="space-y-1">
              {importStats.fileResults.map((result, idx) => (
                <div key={idx} className={`text-sm p-2 rounded ${result.success ? 'bg-green-100' : 'bg-orange-100'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.name}</span>
                    {result.success ? (
                      <span className="text-green-700">{result.count} tirages ✓</span>
                    ) : (
                      <span className="text-orange-700">{result.error} ⚠️</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {importStats.totalFiles !== importStats.successfulFiles && (
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                Certains fichiers n'ont pas pu être importés. Les données des autres fichiers ont bien été sauvegardées.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CSVImporter;