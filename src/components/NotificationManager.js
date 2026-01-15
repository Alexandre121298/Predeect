// src/components/NotificationManager.js
import React, { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, TestTube } from 'lucide-react';

const NotificationManager = () => {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    // Vérifier si les notifications sont supportées
    if (!('Notification' in window)) {
      setSupported(false);
      return;
    }

    // Charger les préférences
    const notifEnabled = localStorage.getItem('notifications_enabled') === 'true';
    setEnabled(notifEnabled);

    // Planifier les notifications si activées
    if (notifEnabled && permission === 'granted') {
      scheduleNotifications();
    }

    // Cleanup
    return () => {
      const intervalId = localStorage.getItem('notification_interval');
      if (intervalId) {
        clearInterval(parseInt(intervalId));
      }
    };
  }, [permission]);

  // Demander la permission
  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        setEnabled(true);
        localStorage.setItem('notifications_enabled', 'true');
        scheduleNotifications();
        
        // Notification de confirmation
        sendNotification(
          'Notifications Activées ! 🎉',
          'Vous recevrez des rappels les jours de tirage',
          '/'
        );
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
    }
  };

  // Désactiver les notifications
  const disableNotifications = () => {
    setEnabled(false);
    localStorage.setItem('notifications_enabled', 'false');
    clearScheduledNotifications();
  };

  // Activer les notifications
  const enableNotifications = () => {
    setEnabled(true);
    localStorage.setItem('notifications_enabled', 'true');
    scheduleNotifications();
  };

  // Planifier les notifications pour les jours de tirage
  const scheduleNotifications = useCallback(() => {
    // Vérifier toutes les heures
    const checkTime = () => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      const minute = now.getMinutes();

      // Lundi (1), Mercredi (3), Samedi (6)
      const isDrawDay = [1, 3, 6].includes(day);
      
      // Notification à 10h00
      if (isDrawDay && hour === 10 && minute < 5) {
        const hasNotifiedToday = localStorage.getItem('notif_morning_' + now.toDateString());
        if (!hasNotifiedToday) {
          sendNotification(
            'Jour de Tirage Loto ! 🎰',
            'C\'est aujourd\'hui ! Générez vos numéros chanceux.',
            '/generate'
          );
          localStorage.setItem('notif_morning_' + now.toDateString(), 'true');
        }
      }

      // Rappel à 19h00 (1h avant la limite)
      if (isDrawDay && hour === 19 && minute < 5) {
        const hasNotifiedEvening = localStorage.getItem('notif_evening_' + now.toDateString());
        if (!hasNotifiedEvening) {
          sendNotification(
            'Dernière Heure ! ⏰',
            'Plus qu\'une heure pour jouer au Loto',
            '/generate'
          );
          localStorage.setItem('notif_evening_' + now.toDateString(), 'true');
        }
      }
    };

    // Vérifier immédiatement
    checkTime();
    
    // Puis toutes les 5 minutes
    const intervalId = setInterval(checkTime, 300000); // 5 minutes
    localStorage.setItem('notification_interval', intervalId.toString());
  }, []);

  // Arrêter les vérifications
  const clearScheduledNotifications = () => {
    const intervalId = localStorage.getItem('notification_interval');
    if (intervalId) {
      clearInterval(parseInt(intervalId));
      localStorage.removeItem('notification_interval');
    }
  };

  // Envoyer une notification
  const sendNotification = (title, body, url) => {
    if (!supported || Notification.permission !== 'granted') {
      return;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: '/logo192.png',
        badge: '/logo192.png',
        vibrate: [200, 100, 200],
        tag: 'predeect-' + Date.now(),
        requireInteraction: false,
        data: { url }
      });

      // Clic sur la notification
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        if (url) {
          window.location.hash = url;
        }
        notification.close();
      };

      // Auto-fermeture après 10 secondes
      setTimeout(() => {
        notification.close();
      }, 10000);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
    }
  };

  // Test de notification
  const testNotification = () => {
    sendNotification(
      'Test de Notification 🔔',
      'Si vous voyez ceci, les notifications fonctionnent parfaitement !',
      '/'
    );
  };

  // Si les notifications ne sont pas supportées
  if (!supported) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          🔔 Notifications
        </h3>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">
            ⚠️ Les notifications ne sont pas supportées par votre navigateur.
          </p>
          <p className="text-sm text-yellow-700 mt-2">
            Essayez avec Chrome, Firefox, Safari ou Edge.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
        <Bell className="w-6 h-6 mr-2" />
        Notifications
      </h3>

      {/* Permission non demandée */}
      {permission === 'default' && (
        <div>
          <p className="text-gray-600 mb-4">
            Activez les notifications pour être rappelé automatiquement les jours de tirage du Loto.
          </p>
          <button
            onClick={requestPermission}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Bell className="w-5 h-5" />
            Activer les Notifications
          </button>
        </div>
      )}

      {/* Permission accordée */}
      {permission === 'granted' && (
        <div className="space-y-4">
          {/* Statut */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {enabled ? (
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              ) : (
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              )}
              <span className="font-medium text-gray-700">
                {enabled ? 'Notifications actives' : 'Notifications désactivées'}
              </span>
            </div>
            <button
              onClick={enabled ? disableNotifications : enableNotifications}
              className={`font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors ${
                enabled 
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {enabled ? (
                <>
                  <BellOff className="w-4 h-4" />
                  Désactiver
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  Activer
                </>
              )}
            </button>
          </div>

          {/* Bouton de test */}
          <button
            onClick={testNotification}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <TestTube className="w-5 h-5" />
            Tester une Notification
          </button>

          {/* Informations */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              📅 Vous serez notifié :
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Lundi, Mercredi, Samedi à <strong>10h00</strong>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Rappel à <strong>19h00</strong> (1h avant la limite)
              </li>
            </ul>
          </div>

          {/* Note importante */}
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800">
              💡 <strong>Note :</strong> Les notifications fonctionnent uniquement si l'application est ouverte dans un onglet. 
              Pour recevoir des notifications même quand l'app est fermée, installez Predeect comme application (PWA).
            </p>
          </div>
        </div>
      )}

      {/* Permission refusée */}
      {permission === 'denied' && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-start gap-3">
            <BellOff className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900 mb-2">
                Notifications bloquées
              </p>
              <p className="text-sm text-red-800 mb-3">
                Pour réactiver les notifications, suivez ces étapes :
              </p>
              <ol className="text-sm text-red-800 space-y-1 list-decimal list-inside">
                <li>Cliquez sur l'icône 🔒 ou ⓘ dans la barre d'adresse</li>
                <li>Trouvez "Notifications"</li>
                <li>Changez le paramètre en "Autoriser"</li>
                <li>Rechargez la page</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManager;