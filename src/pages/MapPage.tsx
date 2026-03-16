import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Report } from '../types';
import { DEFAULT_CORRUPTION_TYPES } from '../constants';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, Plus, ExternalLink, Share2, Info, X } from 'lucide-react';

// Fix Leaflet default icon issue
const markerIcon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const markerShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        <div className="p-2 text-center">
          <p className="font-bold mb-2">Selected Location</p>
          <button 
            onClick={() => onLocationSelect(position.lat, position.lng)}
            className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold"
          >
            Add Report Here
          </button>
        </div>
      </Popup>
    </Marker>
  );
}

function MapController({ center, zoom }: { center: [number, number], zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, map, zoom]);
  return null;
}

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [center, setCenter] = useState<[number, number]>([23.6850, 90.3563]); // Center of Bangladesh
  const [zoom, setZoom] = useState(7); // Show all of Bangladesh
  const [showLegend, setShowLegend] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const targetId = searchParams.get('id');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      setReports(reportsData);

      // If there's a target ID in URL, center on it
      if (targetId) {
        const targetReport = reportsData.find(r => r.id === targetId);
        if (targetReport) {
          setCenter([targetReport.latitude, targetReport.longitude]);
          setZoom(18);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reports');
    });

    return () => unsubscribe();
  }, [targetId]);

  const filteredReports = useMemo(() => {
    if (selectedType === 'All') return reports;
    return reports.filter(r => r.corruptionType === selectedType);
  }, [reports, selectedType]);

  const summary = useMemo(() => {
    const total = filteredReports.length;
    const trueReports = filteredReports.filter(r => r.votesTrue > r.votesFalse && r.votesTrue > r.votesNeedEvidence).length;
    const falseReports = filteredReports.filter(r => r.votesFalse > r.votesTrue && r.votesFalse > r.votesNeedEvidence).length;
    const pendingReports = total - trueReports - falseReports;
    return { total, trueReports, falseReports, pendingReports };
  }, [filteredReports]);

  const getMarkerIcon = (report: Report) => {
    const type = DEFAULT_CORRUPTION_TYPES.find(t => t.name === report.corruptionType);
    const icon = type?.icon || '📍';
    
    // Vote color logic
    let color = '#9ca3af'; // Gray default
    const total = report.votesTrue + report.votesFalse + report.votesNeedEvidence;
    
    if (total > 0) {
      if (report.votesTrue > report.votesFalse && report.votesTrue > report.votesNeedEvidence) {
        color = '#ef4444'; // Red for True
      } else if (report.votesNeedEvidence > report.votesTrue && report.votesNeedEvidence > report.votesFalse) {
        color = '#f59e0b'; // Yellow for Need Evidence
      } else if (report.votesFalse > report.votesTrue && report.votesFalse > report.votesNeedEvidence) {
        color = '#10b981'; // Green for False
      }
    }

    return L.divIcon({
      html: `
        <div class="marker-pin-wrapper">
          <div class="marker-pin" style="background: linear-gradient(135deg, ${color}, ${color}dd);"></div>
          <div class="marker-icon-inner">${icon}</div>
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [40, 52],
      iconAnchor: [20, 52],
      popupAnchor: [0, -52]
    });
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    // Navigate to add report page with coordinates
    navigate(`/add?lat=${lat}&lng=${lng}`);
  };

  const locateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCenter([position.coords.latitude, position.coords.longitude]);
      });
    }
  };

  return (
    <div className="relative h-full w-full">
      {/* Filter Bar */}
      <div className="absolute top-4 left-4 right-16 z-10 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button 
          onClick={() => setSelectedType('All')}
          className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap shadow-md transition-all ${selectedType === 'All' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'}`}
        >
          সব
        </button>
        {DEFAULT_CORRUPTION_TYPES.map(type => (
          <button 
            key={type.id}
            onClick={() => setSelectedType(type.name)}
            className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap shadow-md transition-all flex items-center gap-1.5 ${selectedType === type.name ? 'bg-red-600 text-white' : 'bg-white text-gray-700'}`}
          >
            <span>{type.icon}</span>
            <span>{type.name}</span>
          </button>
        ))}
      </div>

      {/* Summary Overlay */}
      <div className="absolute top-16 left-4 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-gray-100 flex gap-4">
        <div className="text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase">মোট</p>
          <p className="text-sm font-black text-gray-900">{summary.total}</p>
        </div>
        <div className="w-px bg-gray-100"></div>
        <div className="text-center">
          <p className="text-[10px] font-bold text-green-500 uppercase">সত্য</p>
          <p className="text-sm font-black text-green-600">{summary.trueReports}</p>
        </div>
        <div className="w-px bg-gray-100"></div>
        <div className="text-center">
          <p className="text-[10px] font-bold text-red-500 uppercase">মিথ্যা</p>
          <p className="text-sm font-black text-red-600">{summary.falseReports}</p>
        </div>
      </div>

      <MapContainer center={center} zoom={zoom} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={center} zoom={zoom} />
        <LocationMarker onLocationSelect={handleLocationSelect} />

        {filteredReports.map((report) => (
          <Marker 
            key={report.id} 
            position={[report.latitude, report.longitude]}
            icon={getMarkerIcon(report)}
            eventHandlers={{
              add: (e) => {
                if (targetId === report.id) {
                  e.target.openPopup();
                }
              }
            }}
          >
            <Popup>
              <div className="p-1 min-w-[200px]">
                <p className="text-[10px] font-bold text-red-600 uppercase mb-1">{report.corruptionType}</p>
                <h3 className="font-bold text-sm mb-1">{report.title}</h3>
                <p className="text-[10px] text-gray-500 mb-2">{report.locationName}</p>
                
                <div className="flex justify-between text-[10px] font-bold mb-3 border-t border-gray-100 pt-2">
                  <span className="text-green-600">সত্য: {report.votesTrue}</span>
                  <span className="text-yellow-600">প্রমাণ: {report.votesNeedEvidence}</span>
                  <span className="text-red-600">মিথ্যা: {report.votesFalse}</span>
                </div>

                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => navigate(`/report/${report.id}`)}
                    className="w-full bg-red-600 text-white py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1"
                  >
                    View Full Report
                  </button>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full border border-gray-200 text-gray-700 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <Navigation size={12} /> Open in Maps
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button 
          onClick={locateUser}
          className="bg-white p-3 rounded-full shadow-lg text-gray-700 hover:text-red-600 transition-colors"
        >
          <Navigation size={20} />
        </button>
        <button 
          onClick={() => setShowLegend(!showLegend)}
          className="bg-white p-3 rounded-full shadow-lg text-gray-700 hover:text-red-600 transition-colors"
        >
          <Info size={20} />
        </button>
      </div>

      {/* Floating plus button - left side, parallel to chatbot on right */}
      <button 
        onClick={() => navigate('/add')}
        className="absolute bottom-24 left-4 z-10 bg-red-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
      >
        <Plus size={28} />
      </button>

      {/* Legend Panel */}
      {showLegend && (
        <div className="absolute bottom-24 left-4 right-16 z-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 max-h-[40vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900">Map Legend</h3>
            <button onClick={() => setShowLegend(false)} className="text-gray-400">×</button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase">Marker Colors (Votes)</p>
              <div className="flex gap-4 text-[10px] font-bold">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Majority True</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Need Evidence</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div> Majority False</div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase">Corruption Types</p>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_CORRUPTION_TYPES.map(type => (
                  <div key={type.id} className="flex items-center gap-2 text-xs">
                    <span className="text-lg">{type.icon}</span>
                    <span className="text-gray-700">{type.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

