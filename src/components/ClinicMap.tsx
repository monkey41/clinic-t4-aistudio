import React, { useEffect, useRef, useState } from 'react';
import { DarkColorOption } from '../types';
import { CLINIC_CONFIG, getThemePalette } from '../data/clinicData';
import { Navigation, Compass, Copy, Check, MapPin, ZoomIn, ZoomOut } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ClinicMapProps {
  t: Record<string, string>;
  isDark?: boolean;
  darkColor?: DarkColorOption;
}

export const ClinicMap: React.FC<ClinicMapProps> = ({
  t,
  isDark = false,
  darkColor = 'ocean',
}) => {
  const [copied, setCopied] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(17);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const zoomLayerRef = useRef<L.LayerGroup | null>(null);
  const p = getThemePalette(isDark, darkColor);

  const { lat, lng } = CLINIC_CONFIG;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet map with zoom support up to level 20
    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 17,
      minZoom: 14,
      maxZoom: 20,
      scrollWheelZoom: false, // Prevents page scroll hijacking
      zoomControl: false,     // Custom controls provided
      attributionControl: false,
      dragging: !L.Browser.touch, // Touch devices start with dragging disabled so 1 finger scrolls page
      touchZoom: true,
    });

    mapInstanceRef.current = map;

    // Double-touch (two-finger) drag handler for mobile touch devices
    const container = mapContainerRef.current;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        map.dragging.enable();
      } else {
        map.dragging.disable();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        if (!map.dragging.enabled()) {
          map.dragging.enable();
        }
      } else {
        if (map.dragging.enabled()) {
          map.dragging.disable();
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        map.dragging.disable();
      }
    };

    const handleMouseDown = () => {
      map.dragging.enable();
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('mousedown', handleMouseDown);

    // Standard OpenStreetMap tiles showing authentic building geometry and roads
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
    }).addTo(map);

    // Dynamic layer group for zoom-sensitive buildings and roads
    const detailLayerGroup = L.layerGroup().addTo(map);
    zoomLayerRef.current = detailLayerGroup;

    // Custom location pin with clinic name attached to the right in plain text (no rectangle)
    const pinHtml = `
      <div style="position: relative; display: flex; flex-direction: row; align-items: center; gap: 7px; transform: translate(-14px, -28px); pointer-events: none;">
        <div style="
          width: 26px;
          height: 26px;
          flex-shrink: 0;
          background: rgba(15, 118, 110, 0.85);
          border: 2px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 3px 8px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 8px; height: 8px; background: #ffffff; border-radius: 50%;"></div>
        </div>
        <span style="
          color: #042f2e;
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

    // Outline of CarePlus Pharmacy & Clinic building (Transparent styling)
    const clinicBuildingBounds: [number, number][] = [
      [lat - 0.00035, lng - 0.00045],
      [lat + 0.00035, lng - 0.00045],
      [lat + 0.00035, lng + 0.00045],
      [lat - 0.00035, lng + 0.00045],
    ];

    L.polygon(clinicBuildingBounds, {
      color: 'rgba(15, 118, 110, 0.65)',
      weight: 1.5,
      dashArray: '3, 3',
      opacity: 0.75,
      fillColor: '#14b8a6',
      fillOpacity: 0.12, // Transparent footprint so map roads beneath show cleanly
    }).addTo(map);

    // Outline of PRM Medical College & District Hospital campus directly opposite
    const hospitalCampusBounds: [number, number][] = [
      [lat + 0.0008, lng - 0.0028],
      [lat + 0.0042, lng - 0.0025],
      [lat + 0.0045, lng + 0.0024],
      [lat + 0.0010, lng + 0.0026],
    ];

    L.polygon(hospitalCampusBounds, {
      color: '#e11d48',
      weight: 2,
      dashArray: '5, 5',
      opacity: 0.8,
      fillColor: '#f43f5e',
      fillOpacity: 0.1,
    }).addTo(map);

    // Road Polylines
    // 1. Main Hospital Road (Ward 12)
    L.polyline(
      [
        [lat - 0.0035, lng + 0.0001],
        [lat + 0.0035, lng - 0.0001],
      ],
      { color: '#334155', weight: 6, opacity: 0.45 }
    ).addTo(map);

    // Function to render zoom-dependent roads & building names
    const renderZoomDetails = (zoom: number) => {
      detailLayerGroup.clearLayers();

      const createPillIcon = (label: string, icon: string, bg = '#ffffff', textColor = '#0f172a', borderColor = '#cbd5e1') => {
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
              box-shadow: 0 2px 6px rgba(0,0,0,0.15);
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

      // BASE ROAD & LANDMARK LABELS (Always visible)
      L.marker([lat + 0.0002, lng - 0.0008], {
        icon: createPillIcon('Main Hospital Road (Ward 12)', '🛣️', '#0f172a', '#fde68a', '#334155'),
      }).addTo(detailLayerGroup);

      L.marker([lat - 0.0009, lng - 0.0001], {
        icon: createPillIcon('Hospital Square (Golai Chhak)', '🚦', '#ffffff', '#0f172a', '#94a3b8'),
      }).addTo(detailLayerGroup);

      L.marker([lat + 0.0028, lng + 0.0002], {
        icon: createPillIcon('PRM Medical College & Hospital', '🏥', '#ffffff', '#9f1239', '#fecdd3'),
      }).addTo(detailLayerGroup);

      // MEDIUM ZOOM (>= 17): Key Hospital Wings & Nearby Infrastructure
      if (zoom >= 17) {
        // Emergency & Trauma Care Unit
        const emergencyBounds: [number, number][] = [
          [lat + 0.0012, lng - 0.0016],
          [lat + 0.0018, lng - 0.0016],
          [lat + 0.0018, lng - 0.0009],
          [lat + 0.0012, lng - 0.0009],
        ];
        L.polygon(emergencyBounds, { color: '#dc2626', weight: 1.5, fillColor: '#ef4444', fillOpacity: 0.25 }).addTo(detailLayerGroup);
        L.marker([lat + 0.0015, lng - 0.0012], {
          icon: createPillIcon('Emergency & Trauma Wing', '🚨', '#fee2e2', '#991b1b', '#fca5a5'),
        }).addTo(detailLayerGroup);

        // Jan Aushadhi Generic Pharmacy
        L.marker([lat + 0.0005, lng - 0.0007], {
          icon: createPillIcon('Jan Aushadhi Kendra', '💊', '#ecfdf5', '#065f46', '#a7f3d0'),
        }).addTo(detailLayerGroup);

        // Red Cross Blood Bank & Lab
        const bloodBankBounds: [number, number][] = [
          [lat + 0.0011, lng + 0.0009],
          [lat + 0.0016, lng + 0.0009],
          [lat + 0.0016, lng + 0.0017],
          [lat + 0.0011, lng + 0.0017],
        ];
        L.polygon(bloodBankBounds, { color: '#b91c1c', weight: 1.5, fillColor: '#dc2626', fillOpacity: 0.2 }).addTo(detailLayerGroup);
        L.marker([lat + 0.0013, lng + 0.0013], {
          icon: createPillIcon('Red Cross Blood Bank', '🩸', '#fff1f2', '#be123c', '#fecdd3'),
        }).addTo(detailLayerGroup);

        // Station Road Link
        L.polyline([[lat - 0.0009, lng - 0.0001], [lat - 0.0022, lng - 0.0020]], { color: '#475569', weight: 4, dashArray: '4, 4' }).addTo(detailLayerGroup);
        L.marker([lat - 0.0017, lng - 0.0013], {
          icon: createPillIcon('Station Road Link', '🛤️', '#f8fafc', '#334155', '#e2e8f0'),
        }).addTo(detailLayerGroup);
      }

      // HIGH ZOOM (>= 18): Buildings, Speciality Departments & Wards
      if (zoom >= 18) {
        // Super Specialty OPD Complex
        const opdBounds: [number, number][] = [
          [lat + 0.0024, lng - 0.0022],
          [lat + 0.0033, lng - 0.0022],
          [lat + 0.0033, lng - 0.0012],
          [lat + 0.0024, lng - 0.0012],
        ];
        L.polygon(opdBounds, { color: '#2563eb', weight: 1.5, fillColor: '#3b82f6', fillOpacity: 0.2 }).addTo(detailLayerGroup);
        L.marker([lat + 0.0028, lng - 0.0017], {
          icon: createPillIcon('Super-Specialty OPD Complex', '🏬', '#eff6ff', '#1e40af', '#bfdbfe'),
        }).addTo(detailLayerGroup);

        // Mother & Child Healthcare (MCH) Wing
        const mchBounds: [number, number][] = [
          [lat + 0.0017, lng + 0.0012],
          [lat + 0.0025, lng + 0.0012],
          [lat + 0.0025, lng + 0.0022],
          [lat + 0.0017, lng + 0.0022],
        ];
        L.polygon(mchBounds, { color: '#7c3aed', weight: 1.5, fillColor: '#8b5cf6', fillOpacity: 0.2 }).addTo(detailLayerGroup);
        L.marker([lat + 0.0021, lng + 0.0017], {
          icon: createPillIcon('MCH Maternal & Child Wing', '👶', '#f5f3ff', '#5b21b6', '#ddd6fe'),
        }).addTo(detailLayerGroup);

        // Ambulance Entry Bay
        L.marker([lat + 0.0009, lng - 0.0003], {
          icon: createPillIcon('Ambulance Gate & Ramp', '🚑', '#fef2f2', '#991b1b', '#fca5a5'),
        }).addTo(detailLayerGroup);

        // College Road Avenue
        L.polyline([[lat + 0.0008, lng], [lat + 0.0038, lng + 0.0002]], { color: '#64748b', weight: 4, dashArray: '3, 3' }).addTo(detailLayerGroup);
        L.marker([lat + 0.0022, lng + 0.0004], {
          icon: createPillIcon('Campus Central Avenue', '🌳', '#f8fafc', '#334155', '#cbd5e1'),
        }).addTo(detailLayerGroup);
      }

      // MAXIMUM DETAIL ZOOM (>= 19): Academic blocks, hostels & ward offices
      if (zoom >= 19) {
        // Academic & Auditorium Block
        L.marker([lat + 0.0038, lng + 0.0006], {
          icon: createPillIcon('Medical College Auditorium & Lecture Halls', '🎓', '#ffffff', '#0f172a', '#94a3b8'),
        }).addTo(detailLayerGroup);

        // Ward 12 Municipal Dispensary
        L.marker([lat - 0.0009, lng + 0.0012], {
          icon: createPillIcon('Ward 12 Municipal Health Office', '🏛️', '#f8fafc', '#1e293b', '#cbd5e1'),
        }).addTo(detailLayerGroup);

        // Doctors Residence & Quarters
        L.marker([lat + 0.0036, lng - 0.0018], {
          icon: createPillIcon('Doctors Quarters & Staff Hostels', '🏡', '#f1f5f9', '#475569', '#cbd5e1'),
        }).addTo(detailLayerGroup);

        // CarePlus Parking & Patient Drop-off
        L.marker([lat - 0.0003, lng + 0.0007], {
          icon: createPillIcon('Pharmacy Parking & Drop-off', '🅿️', '#ecfdf5', '#065f46', '#a7f3d0'),
        }).addTo(detailLayerGroup);
      }
    };

    // Initial render of details
    renderZoomDetails(map.getZoom());

    // Listen to zoom changes and dynamically update roads and building names
    map.on('zoomend', () => {
      const zoom = map.getZoom();
      setCurrentZoom(zoom);
      renderZoomDetails(zoom);
    });

    // Invalidate size on mount to ensure clean render
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('mousedown', handleMouseDown);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [lat, lng]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <section id="clinic-map-section" className="mx-4 my-4 scroll-mt-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div>
          <h3 className={`font-extrabold text-sm tracking-tight flex items-center gap-1.5 ${p.heading}`}>
            <span>📍</span> {t.locationTitle || 'Clinic Location & Neighborhood Map'}
          </h3>
          <p className={`text-[11px] font-medium ${p.subtext}`}>
            Explore surrounding hospital wings, emergency gate & roads
          </p>
        </div>

        {/* Double touch guidance pill */}
        <div className={`hidden xs:flex items-center gap-1 border px-2 py-0.5 rounded-lg text-[10px] font-bold ${p.badge}`}>
          <span>✌️ Two-finger drag</span>
        </div>
      </div>

      {/* Map Container */}
      <div className={`relative rounded-3xl overflow-hidden border shadow-sm bg-slate-100 ${p.card}`}>
        <div
          ref={mapContainerRef}
          className="w-full h-[280px] sm:h-[320px] z-0"
          style={{ background: '#f8fafc' }}
        />

        {/* Zoom Controls */}
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1">
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Zoom in to view more buildings"
            className="w-8 h-8 rounded-xl bg-white hover:bg-slate-50 text-slate-800 shadow-md flex items-center justify-center border border-slate-200 cursor-pointer active:scale-95"
            title="Zoom in (reveals more buildings & roads)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="Zoom out"
            className="w-8 h-8 rounded-xl bg-white hover:bg-slate-50 text-slate-800 shadow-md flex items-center justify-center border border-slate-200 cursor-pointer active:scale-95"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Zoom Hint Banner */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
          {currentZoom >= 18 ? (
            <div className="bg-emerald-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-extrabold text-emerald-100 shadow-sm border border-emerald-600/40 animate-in fade-in">
              ✨ Detailed Buildings & Wards Active
            </div>
          ) : (
            <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-bold text-slate-200 shadow-sm">
              🔍 Tap + to reveal more buildings
            </div>
          )}
        </div>

        {/* Bottom GPS Bar */}
        <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between bg-slate-950/85 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] shadow-md">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-teal-300" />
            <span className="font-mono text-teal-200 font-semibold">
              {lat.toFixed(6)}° N, {lng.toFixed(6)}° E
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyCoords}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-[9px] font-bold px-2 py-0.5 rounded-md transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
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

      {/* Action Button: Get Directions (GPS) */}
      <div className="mt-2.5">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full active:scale-98 rounded-2xl py-3 px-4 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all text-center cursor-pointer ${p.primaryBtn}`}
        >
          <Navigation className="w-4 h-4" />
          <span>{t.directions || 'GET DIRECTIONS (GPS NAVIGATION) ↗'}</span>
        </a>
      </div>

      {/* Building & Road Guide */}
      <div className={`mt-2.5 p-3 rounded-2xl border flex items-start gap-2.5 text-xs shadow-2xs ${p.card}`}>
        <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${p.accentText}`} />
        <div className="leading-snug">
          <span className={`font-extrabold block ${p.heading}`}>
            Life Care Medicine Store and Poly Clinic (Baripada)
          </span>
          <span className={`text-[11px] block mt-0.5 ${p.subtext}`}>
            Main Hospital Road, opposite PRM Medical College campus & Emergency Gate. Open daily 8:00 AM – 10:00 PM.
          </span>
        </div>
      </div>
    </section>
  );
};
