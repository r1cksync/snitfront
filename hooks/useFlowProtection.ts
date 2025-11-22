import { useEffect } from 'react';

export function useNotificationBlocker(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    // Request notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Block notifications by intercepting them
    const originalNotification = window.Notification;
    let blockedCount = 0;

    if (enabled) {
      // Override Notification constructor
      (window as any).Notification = function(title: string, options?: NotificationOptions) {
        blockedCount++;
        console.log(`[Flow Protector] Blocked notification: ${title}`);
        // Don't create the actual notification
        return {
          close: () => {},
          addEventListener: () => {},
        };
      };
    }

    return () => {
      // Restore original Notification
      window.Notification = originalNotification;
      if (blockedCount > 0) {
        console.log(`[Flow Protector] Total notifications blocked: ${blockedCount}`);
      }
    };
  }, [enabled]);
}

export function useDistractionBlocker(enabled: boolean, distractionSites: string[]) {
  useEffect(() => {
    if (!enabled || distractionSites.length === 0) return;

    // This is a client-side warning system
    // For actual blocking, you'd need a browser extension
    const checkUrl = () => {
      const currentUrl = window.location.href;
      const isDistraction = distractionSites.some(site => currentUrl.includes(site));
      
      if (isDistraction) {
        const shouldLeave = confirm(
          '⚠️ Flow State Protected\n\n' +
          'You\'re visiting a distraction site while in flow mode.\n' +
          'Do you want to leave and return to your flow session?'
        );
        
        if (shouldLeave) {
          window.history.back();
        }
      }
    };

    // Check on mount and on navigation
    checkUrl();
    window.addEventListener('popstate', checkUrl);

    return () => {
      window.removeEventListener('popstate', checkUrl);
    };
  }, [enabled, distractionSites]);
}
