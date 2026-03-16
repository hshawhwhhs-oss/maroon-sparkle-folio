import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Report } from '../types';
import ReportCard from '../components/ReportCard';
import { DEFAULT_CORRUPTION_TYPES } from '../constants';
import { Filter, TrendingUp, Clock, MapPin as MapPinIcon, Search } from 'lucide-react';

export default function FeedPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'near'>('latest');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Report[];
      setReports(reportsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reports');
    });
    return () => unsubscribe();
  }, []);

  const getFilteredReports = () => {
    let filtered = [...reports];
    if (filterType !== 'all') filtered = filtered.filter(r => r.corruptionType === filterType);
    if (sortBy === 'latest') filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    else if (sortBy === 'trending') filtered.sort((a, b) => (b.votesTrue + b.votesFalse + b.votesNeedEvidence) - (a.votesTrue + a.votesFalse + a.votesNeedEvidence));
    else if (sortBy === 'near' && userLocation) {
      filtered.sort((a, b) => {
        const dA = Math.sqrt(Math.pow(a.latitude - userLocation.lat, 2) + Math.pow(a.longitude - userLocation.lng, 2));
        const dB = Math.sqrt(Math.pow(b.latitude - userLocation.lat, 2) + Math.pow(b.longitude - userLocation.lng, 2));
        return dA - dB;
      });
    }
    return filtered;
  };

  const handleNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortBy('near');
      });
    }
  };

  const filteredReports = getFilteredReports();
  const todayReports = reports.filter(r => new Date(r.date).toDateString() === new Date().toDateString()).length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 px-4 pt-4 mb-4">
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">আজকের রিপোর্ট</p>
          <p className="text-2xl font-black text-red-600">{todayReports}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">মোট রিপোর্ট</p>
          <p className="text-2xl font-black text-gray-900">{reports.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 mb-4 space-y-3">
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
          <Filter size={16} className="text-gray-400 ml-2" />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm font-medium text-gray-700 outline-none">
            <option value="all">সকল করাপশন টাইপ</option>
            {DEFAULT_CORRUPTION_TYPES.map(type => (<option key={type.id} value={type.name}>{type.name}</option>))}
          </select>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button onClick={() => setSortBy('latest')} className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${sortBy === 'latest' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>
            <Clock size={14} /> Latest
          </button>
          <button onClick={() => setSortBy('trending')} className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${sortBy === 'trending' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>
            <TrendingUp size={14} /> Trending
          </button>
          <button onClick={handleNearMe} className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${sortBy === 'near' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>
            <MapPinIcon size={14} /> Near Me
          </button>
        </div>
      </div>

      {/* Reports - social media feed style */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="divide-y divide-gray-100 md:px-4 md:space-y-4 md:divide-y-0">
          {filteredReports.map(report => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 mx-4 bg-white rounded-2xl border border-dashed border-gray-300">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">কোনো রিপোর্ট পাওয়া যায়নি।</p>
        </div>
      )}
    </div>
  );
}
