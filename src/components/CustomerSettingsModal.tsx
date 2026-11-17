import React, { useState, useEffect } from 'react';
import {
  X,
  BellRing,
  MapPin,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestMobileNotificationPermission,
  dispatchMobileNotification,
} from '../services/notifications';
import { CLINIC_CONFIG, calculateDistanceKm } from '../data/clinicData';

interface CustomerSettingsModalProps {
  open: boolean;
  onClose: () => void;
  onNotificationPermissionChange?: (perm: NotificationPermission | 'unsupported') => void;
  onRefreshCloudData?: () => Promise<void>;
  isAppInstalled: boolean;
  onInstallPwa: () => void;
}

export const CustomerSettingsModal: React.FC<CustomerSettingsModalProps> = ({
  open,
  onClose,
  onNotificationPermissionChange,
  onRefreshCloudData,
  isAppInstalled,
  onInstallPwa,
}) => {
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | 'unsupported'>(() =>
    getNotificationPermission()
  );
  const [locationState, setLocationState] = useState<
    'prompt' | 'granted' | 'denied' | 'unsupported'
  >('prompt');
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setNotifPerm(getNotificationPermission());
    setStatusMsg(null);
    setLocError(null);

    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setLocationState('unsupported');
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((res) => {
          setLocationState(res.state);
        })
        .catch(() => {});
    }
  }, [open]);

  if (!open) return null;

  const handleEnableNotifications = async () => {
    const res = await requestMobileNotificationPermission();
    setNotifPerm(res);
    onNotificationPermissionChange?.(res);
    if (res === 'granted') {
      setStatusMsg('Mobile notifications enabled.');
      await dispatchMobileNotification(
        'Life Care Alerts Enabled',
        'You will receive doctor visit alerts and clinic updates here.'
      );
    } else if (res === 'denied') {
      setStatusMsg('Notifications are blocked in browser settings.');
    }
  };

  const handleTestNotification = async () => {
    const ok = await dispatchMobileNotification(
      'Life Care Poly Clinic',
      'Mobile notifications are active on your device.'
    );
    setStatusMsg(ok ? 'Test alert sent to your device.' : 'Enable browser alerts to test.');
  };

  const handleAllowLocation = () => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setLocationState('unsupported');
      return;
    }
    setLocLoading(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocLoading(false);
        setLocationState('granted');
        const dist = calculateDistanceKm(
          pos.coords.latitude,
          pos.coords.longitude,
          CLINIC_CONFIG.lat,
          CLINIC_CONFIG.lng
        );
        setDistanceKm(dist);
        try {
          localStorage.setItem('lifecare_location_allowed', 'true');
        } catch {
          // ignore
        }
      },
      (err) => {
        setLocLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationState('denied');
          setLocError('Location blocked. Allow location access in browser site settings.');
        } else {
          setLocError('Unable to read GPS coordinates right now.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSync = async () => {
    if (!onRefreshCloudData) return;
    setSyncing(true);
    try {
      await onRefreshCloudData();
      setStatusMsg('Latest clinic data synced.');
    } catch {
      setStatusMsg('Could not reach cloud right now.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-700 to-emerald-700 text-white flex items-center justify-between">
          <div>
            <h3 className="font-black text-base tracking-tight">Settings</h3>
            <p className="text-[11px] text-teal-100">Permissions & App Preferences</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="min-h-[40px] min-w-[40px] rounded-xl hover:bg-white/20 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
          {statusMsg && (
            <div className="px-3.5 py-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* 1. Mobile Notifications */}
          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">
                    Mobile Notifications
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {!isNotificationSupported()
                      ? 'Not supported on this browser'
                      : notifPerm === 'granted'
                      ? 'Allowed on this device'
                      : notifPerm === 'denied'
                      ? 'Blocked in browser settings'
                      : 'Get doctor & clinic alerts'}
                  </p>
                </div>
              </div>

              {notifPerm === 'granted' ? (
                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black cursor-pointer shrink-0"
                >
                  Test Alert
                </button>
              ) : (
                isNotificationSupported() &&
                notifPerm !== 'denied' && (
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black cursor-pointer shrink-0"
                  >
                    Allow
                  </button>
                )
              )}
            </div>
          </div>

          {/* 2. Location Access */}
          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">
                    Location Access (GPS)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {locationState === 'unsupported'
                      ? 'GPS not supported on this device'
                      : locationState === 'granted'
                      ? distanceKm !== null
                        ? `${distanceKm} km from Life Care Clinic`
                        : 'Allowed on this device'
                      : locationState === 'denied'
                      ? 'Blocked in browser site settings'
                      : 'Enable for clinic distance & directions'}
                  </p>
                </div>
              </div>

              {locationState !== 'unsupported' && locationState !== 'denied' && (
                <button
                  type="button"
                  onClick={handleAllowLocation}
                  disabled={locLoading}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-[11px] font-black cursor-pointer shrink-0 flex items-center gap-1"
                >
                  {locLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>{locationState === 'granted' ? 'Check Distance' : 'Allow'}</span>
                </button>
              )}
            </div>
            {locError && (
              <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{locError}</span>
              </p>
            )}
          </div>

          {/* 3. Live Cloud Sync */}
          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-900">Sync Clinic Data</h4>
                <p className="text-[11px] text-slate-500">Refresh doctors, offers & updates</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white text-[11px] font-black cursor-pointer shrink-0"
            >
              {syncing ? 'Syncing...' : 'Refresh'}
            </button>
          </div>

          {/* 4. Install App (Only if not already installed) */}
          {!isAppInstalled && (
            <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">Install App</h4>
                  <p className="text-[11px] text-emerald-800">Add to your phone home screen</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onInstallPwa}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-black cursor-pointer shrink-0"
              >
                Install
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
