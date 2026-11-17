import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CLINIC_CONFIG } from '../data/clinicData';
import {
  Navigation,
  Compass,
  Copy,
  Check,
  MapPin,
  ZoomIn,
  ZoomOut,
  X,
  ChevronRight,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ClinicMapProps {
  t: Record<string, string>;
  externalOpen?: boolean;
  onExternalClose?: () => void;
}

export const ClinicMap: React.FC<ClinicMapProps> = ({
  t,
  externalOpen = false,
  onExternalClose,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const zoomLayerRef = useRef<L.LayerGroup | null>(null);

  const isOpen = internalOpen || externalOpen;

  const handleClose = () => {
    setInternalOpen(false);
    onExternalClose?.();
  };

  const { lat, lng } = CLINIC_CONFIG;

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 17,
      minZoom: 14,
      maxZoom: 20,
      scrollWheelZoom: false,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      touchZoom: true,
    });

    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
    }).addTo(map);

    const detailLayerGroup = L.layerGroup().addTo(map);
    zoomLayerRef.current = detailLayerGroup;

    const pinHtml = `
      <div style="position: relative; display: flex; flex-direction: row; align-items: center; gap: 7px; transform: translate(-14px, -28px); pointer-events: none;">
        <div style="
          width: 26px;
          height: 26px;
          flex-shrink: 0;
          background: #059669;
          border: 2px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 3px 8px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 8px; height: 8px; background: #FEF3C7; border-radius: 50%;"></div>
        </div>
        <span style="
          color: #122B22;
          font-size: 12px;
          font-weight: 900;
          white-space: nowrap;
          letter-spacing: -0.01em;
          text-shadow: -1.5px -1.5px 0 #ffffff, 1.5px -1.5px 0 #ffffff, -1.5px 1.5px 0 #ffffff, 1.5px 1.5px 0 #ffffff, 0px 2px 6px rgba(255,255,255,0.95);
        ">
          Life Care Medicine Store and Poly Clinic
        </span>
      </div>
    `;

    const customPinIcon = L.divIcon({
      html: pinHtml,
      className: 'custom-clinic-pin',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    L.marker([lat, lng], { icon: customPinIcon, zIndexOffset: 1000 }).addTo(map);

    const clinicBuildingBounds: [number, number][] = [
      [lat - 0.00035, lng - 0.00045],
      [lat + 0.00035, lng - 0.00045],
      [lat + 0.00035, lng + 0.00045],
      [lat - 0.00035, lng + 0.00045],
    ];

    L.polygon(clinicBuildingBounds, {
      color: '#059669',
      weight: 1.5,
      dashArray: '3, 3',
      opacity: 0.8,
      fillColor: '#10B981',
      fillOpacity: 0.14,
    }).addTo(map);

    const renderZoomDetails = (zoom: number) => {
      detailLayerGroup.clearLayers();

      const createPillIcon = (
        label: string,
        icon: string,
        bg = '#ffffff',
        textColor = '#122B22',
        borderColor = '#A7F3D0'
      ) => {
        return L.divIcon({
          html: `
            <div style="
              background: ${bg};
              color: ${textColor};
              border: 1px solid ${borderColor};
              font-size: 9.5px;
              font-weight: 700;
              padding: 2px 6px;
              border-radius: 6px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.12);
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 4px;
              transform: translate(-50%, -50%);
              pointer-events: none;
            ">
              <span>${icon}</span>
              <span>${label}</span>
            </div>
          `,
          className: 'zoom-pill-label',
          iconSize: [0, 0],
        });
      };

      L.marker([lat + 0.0002, lng - 0.0008], {
        icon: createPillIcon('Main Hospital Road (Ward 12)', '🛣️', '#122B22', '#FEF3C7', '#065F46'),
      }).addTo(detailLayerGroup);

      L.marker([lat - 0.0009, lng - 0.0001], {
        icon: createPillIcon('Hospital Square (Golai Chhak)', '🚦', '#FCFBF7', '#122B22', '#EAE4D3'),
      }).addTo(detailLayerGroup);

      L.marker([lat + 0.0028, lng + 0.0002], {
        icon: createPillIcon('PRM Medical College & Hospital', '🏥', '#ffffff', '#9f1239', '#fecdd3'),
      }).addTo(detailLayerGroup);

      if (zoom >= 17) {
        L.marker([lat + 0.0005, lng - 0.0007], {
          icon: createPillIcon('Jan Aushadhi Kendra', '💊', '#ecfdf5', '#065f46', '#a7f3d0'),
        }).addTo(detailLayerGroup);
      }
    };

    renderZoomDetails(map.getZoom());

    map.on('zoomend', () => {
      renderZoomDetails(map.getZoom());
    });

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 180);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isOpen, lat, lng]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const modalNode = isOpen ? (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 isolate"
      role="dialog"
      aria-modal="true"
      aria-label="Clinic Location Map"
    >
      <div
        className="fixed inset-0 bg-[#122B22]/50 backdrop-blur-xs"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#FCFBF7] border border-[#EAE4D3] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#065F46] to-[#059669] text-white flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-black text-sm sm:text-base flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#FDE68A] shrink-0" />
              <span>{t.locationTitle || 'Clinic Location'}</span>
            </h3>
            <p className="text-[11px] text-emerald-100 truncate">
              Hospital Square, Baripada, Odisha 757001
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close map"
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Leaflet Map Frame */}
        <div className="p-4 space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-[#EAE4D3] shadow-inner bg-[#F7F4EC]">
            <div ref={mapContainerRef} className="w-full h-[300px] sm:h-[340px] z-0" />

            {/* Zoom Controls */}
            <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1">
              <button
                type="button"
                onClick={handleZoomIn}
                aria-label="Zoom in"
                className="w-8 h-8 rounded-xl bg-white hover:bg-[#ECFDF5] text-[#122B22] shadow-md flex items-center justify-center border border-[#EAE4D3] cursor-pointer active:scale-95"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                aria-label="Zoom out"
                className="w-8 h-8 rounded-xl bg-white hover:bg-[#ECFDF5] text-[#122B22] shadow-md flex items-center justify-center border border-[#EAE4D3] cursor-pointer active:scale-95"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom GPS Coords Bar */}
            <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between bg-[#122B22]/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] shadow-md">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#6EE7B7]" />
                <span className="font-mono text-[#D1FAE5] font-semibold">
                  {lat.toFixed(6)}° N, {lng.toFixed(6)}° E
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyCoords}
                className="flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white text-[9px] font-bold px-2 py-0.5 rounded-md transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-[#6EE7B7]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy GPS</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full active:scale-98 rounded-2xl py-3 px-4 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all text-center cursor-pointer bg-gradient-to-r from-[#059669] to-[#D97706] text-white"
          >
            <Navigation className="w-4 h-4" />
            <span>Open Directions in Google Maps</span>
          </a>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <section id="clinic-map-section" className="mx-4 my-2">
      {/* Single Clean Button to Open Interactive Map */}
      <button
        type="button"
        onClick={() => setInternalOpen(true)}
        className="w-full rounded-2xl p-3.5 bg-white border border-[#EAE4D3] hover:border-[#A7F3D0] shadow-xs hover:shadow-md flex items-center justify-between gap-3 text-left transition-all active:scale-99 cursor-pointer group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#059669] to-[#10B981] text-white flex items-center justify-center shrink-0 shadow-xs">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="font-black text-xs sm:text-sm text-[#122B22] block leading-tight group-hover:text-[#059669] transition-colors">
              Open Clinic Location Map
            </span>
            <span className="text-[11px] font-medium text-[#4B6358] block truncate mt-0.5">
              Hospital Square, Baripada · Tap to view map & GPS
            </span>
          </div>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-[11px] font-black flex items-center gap-1 shrink-0">
          <span>View Map</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </button>

      {typeof document !== 'undefined' && modalNode
        ? createPortal(modalNode, document.body)
        : modalNode}
    </section>
  );
};
