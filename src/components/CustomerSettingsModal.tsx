import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  BellRing,
  MapPin,
  RefreshCw,
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
}

export const CustomerSettingsModal: React.FC<CustomerSettingsModalProps> = ({
  open,
  onClose,
  onNotificationPermissionChange,
  onRefreshCloudData,
}) => {
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | 'unsupported'>(() =>
    getNotificationPermission()
  );
  const [locationState, setLocationState] = useState<
    'prompt' | 'granted' | 'denied' | 'unsupported'
  >('prompt');
  const [locationPrefAllowed, setLocationPrefAllowed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('lifecare_location_allowed') === 'true';
    } catch {
      return false;
    }
  });
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
          if (res.state === 'granted') {
            setLocationPrefAllowed(true);
          }
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
    setLocationPrefAllowed(true);
    try {
      localStorage.setItem('lifecare_location_allowed', 'true');
    } catch {
      // ignore
    }

    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setLocationState('unsupported');
      setStatusMsg('Clinic location preference saved for Baripada.');
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
        setStatusMsg(`GPS location allowed (${dist} km from clinic).`);
      },
      (err) => {
        setLocLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationState('denied');
          setLocError(
            'Browser blocked GPS prompt. Tap the lock/site icon near your browser URL bar to allow Location, then tap Retry.'
          );
        } else {
          setLocError('Could not fetch GPS coordinates right now. Try again outdoors.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleDisableLocation = () => {
    setLocationPrefAllowed(false);
    setDistanceKm(null);
    setLocError(null);
    try {
      localStorage.setItem('lifecare_location_allowed', 'false');
    } catch {
      // ignore
    }
    setStatusMsg('Location access preference turned off.');
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

  const content = (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 isolate">
      <div
        className="fixed inset-0 bg-[#122B22]/45 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md bg-[#FCFBF7] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#EAE4D3] overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#065F46] via-[#059669] to-[#10B981] text-white flex items-center justify-between">
          <div>
            <h3 className="font-black text-base tracking-tight">Settings</h3>
            <p className="text-[11px] text-emerald-100">Notifications, Location & Sync</p>
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

        <div className="p-4 space-y-3 max-h-[78vh] overflow-y-auto bg-[#FCFBF7]">
          {statusMsg && (
            <div className="px-3.5 py-2.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#122B22] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* 1. Mobile Notifications */}
          <div className="p-3.5 rounded-2xl border border-[#EAE4D3] bg-white shadow-xs space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#122B22]">
                    Mobile Notifications
                  </h4>
                  <p className="text-[11px] text-[#4B6358]">
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
                  className="px-3 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-[11px] font-black cursor-pointer shrink-0"
                >
                  Test Alert
                </button>
              ) : (
                isNotificationSupported() &&
                notifPerm !== 'denied' && (
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#059669] to-[#10B981] text-white text-[11px] font-black cursor-pointer shrink-0"
                  >
                    Allow
                  </button>
                )
              )}
            </div>
          </div>

          {/* 2. Location Access */}
          <div className="p-3.5 rounded-2xl border border-[#EAE4D3] bg-white shadow-xs space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#122B22]">
                    Location Access (GPS)
                  </h4>
                  <p className="text-[11px] text-[#4B6358]">
                    {locationState === 'granted'
                      ? distanceKm !== null
                        ? `${distanceKm} km from Life Care Clinic`
                        : 'GPS allowed on this device'
                      : locationState === 'denied'
                      ? locationPrefAllowed
                        ? 'Permission blocked in browser — tap Retry'
                        : 'Tap Allow Location to enable clinic distance'
                      : locationState === 'unsupported'
                      ? locationPrefAllowed
                        ? 'Baripada Clinic Location Active'
                        : 'Allow clinic area for directions'
                      : 'Enable for clinic distance & directions'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={locationState === 'granted' || locationPrefAllowed}
                onClick={() => {
                  if (locationState === 'granted' || locationPrefAllowed) {
                    handleDisableLocation();
                  } else {
                    handleAllowLocation();
                  }
                }}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer shrink-0 ${
                  locationState === 'granted' || locationPrefAllowed
                    ? 'bg-[#059669]'
                    : 'bg-stone-200'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                    locationState === 'granted' || locationPrefAllowed
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleAllowLocation}
                disabled={locLoading}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#059669] to-[#D97706] hover:brightness-105 disabled:opacity-60 text-white text-[11px] font-black cursor-pointer flex items-center justify-center gap-1.5"
              >
                {locLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {locationState === 'granted'
                    ? 'Refresh GPS Distance'
                    : locationState === 'denied'
                    ? 'Retry Allow Location'
                    : 'Allow Location'}
                </span>
              </button>

              {(locationState === 'granted' || locationPrefAllowed) && (
                <button
                  type="button"
                  onClick={handleDisableLocation}
                  className="py-2 px-3 rounded-xl border border-[#EAE4D3] bg-[#F7F4EC] hover:bg-stone-200 text-[#4B6358] text-[11px] font-bold cursor-pointer"
                >
                  Turn Off
                </button>
              )}
            </div>

            {locError && (
              <p className="text-[11px] text-rose-600 font-semibold flex items-start gap-1.5 leading-snug">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{locError}</span>
              </p>
            )}
          </div>

          {/* 3. Live Cloud Sync */}
          <div className="p-3.5 rounded-2xl border border-[#EAE4D3] bg-white shadow-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-[#122B22]">Sync Clinic Data</h4>
                <p className="text-[11px] text-[#4B6358]">Refresh doctors, offers & updates</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="px-3 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] disabled:opacity-60 text-white text-[11px] font-black cursor-pointer shrink-0"
            >
              {syncing ? 'Syncing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};
