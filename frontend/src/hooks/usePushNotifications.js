import { useState, useEffect } from 'react';

// Utility to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const subscribeToPush = async (token, BASE_URL) => {
    if (!token) return false;
    if (!('serviceWorker' in navigator)) {
        console.warn('Service Worker not supported');
        return false;
    }
    if (!('PushManager' in window)) {
        console.warn('PushManager not supported');
        return false;
    }

    let perm = Notification.permission;
    if (perm === 'default') {
      try {
        perm = await Notification.requestPermission();
        setPermission(perm);
      } catch (e) {
          console.error(e);
      }
    }

    if (perm === 'denied') {
        alert('You have blocked notifications in your browser settings. Please enable them first.');
        return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
          console.error("VITE_VAPID_PUBLIC_KEY is not defined");
          return false;
      }

      // Strip quotes if any, and trim whitespace
      const sanitizedVapidKey = vapidPublicKey.replace(/^["'](.+)["']$/, '$1').trim();
      const convertedVapidKey = urlBase64ToUint8Array(sanitizedVapidKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      const apiUrl = BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subscription)
      });

      if (response.ok) {
        setIsSubscribed(true);
        alert('Push notifications successfully enabled!');
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Server failed to save subscription: ${response.status} - ${errorData.message || errorData.error || 'Unknown Error'}`);
        return false;
      }
    } catch (err) {
      console.error('Failed to subscribe to push notifications:', err);
      alert(`Failed to subscribe: ${err.message}`);
      return false;
    }
  };

  return { permission, isSubscribed, subscribeToPush };
}
