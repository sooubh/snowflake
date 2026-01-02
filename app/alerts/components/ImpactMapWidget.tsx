import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const facilities = [
  { id: 1, name: "City Central Hospital", status: "Critical", type: "hospital", stock: 12, burnRate: 4.5, x: 33, y: 50, color: "bg-red-500" },
  { id: 2, name: "Northside Logistics", status: "Warning", type: "warehouse", stock: 45, burnRate: 2.1, x: 75, y: 33, color: "bg-orange-500" },
  { id: 3, name: "West End Pharma Lab", status: "Stable", type: "factory", stock: 88, burnRate: 0.8, x: 15, y: 70, color: "bg-green-500" },
  { id: 4, name: "East Side Clinic", status: "Critical", type: "clinic", stock: 18, burnRate: 1.2, x: 60, y: 65, color: "bg-red-500" },
];

interface MapContentProps {
  className?: string;
  activeLayers: { regions: boolean; facilities: boolean; severity: boolean };
  isZoomed: boolean;
  zoomLevel: number;
  panOffset: { x: number; y: number };
  isEnlarged: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  performSearch: (q: string) => void;
  resetMap: () => void;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  setPanOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  handlePan: (direction: 'up' | 'down' | 'left' | 'right') => void;
  hoveredMarker: number | null;
  setHoveredMarker: (id: number | null) => void;
}

const MapContent = ({
  className = "",
  activeLayers,
  isZoomed,
  zoomLevel,
  panOffset,
  isEnlarged,
  searchQuery,
  setSearchQuery,
  handleSearch,
  performSearch,
  resetMap,
  setZoomLevel,
  setPanOffset,
  handlePan,
  hoveredMarker,
  setHoveredMarker
}: MapContentProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEnlarged) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isEnlarged) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!isEnlarged) return;
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => Math.min(Math.max(prev + delta, 1), 5));
  };

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-[#0a0a0a] transition-all duration-700 ease-in-out ${className}`}
      style={{ cursor: isEnlarged ? (isDragging ? 'grabbing' : 'grab') : 'crosshair' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Background Map Image */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-all mix-blend-screen ${activeLayers.regions ? 'opacity-40' : 'opacity-10'}`}
        style={{
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD4ljwks1wYl2OKb5aHDEgmfKnT6oIlQNGBkOlP7bSu5dHDisveh8VJ2s5pI7JLGJzxpf8VB-IbJLS1sGWFLbJ1OPDhflz4QeSs05PlEXXxUYqXdaU2YEtbROoATyKPi8QsyC1JWg0YHi8YwONfr7nbcBT04bgYQirn0GmBanzvAqMt44Lo0ziQEgviVkssTNsEOLzFfoR4Ldm3nRuwfun5cI4xeXvafDfWhmaozCCBaPVzZ13KfGEUo0KMctqdXNTwzznlyEHKxCo')",
          filter: "grayscale(100%) invert(100%) brightness(1.2) contrast(1.2)",
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${isZoomed ? 1.5 * zoomLevel : zoomLevel})`,
          transition: isDragging ? 'none' : 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      ></div>

      {/* Region Highlighting Overlay */}
      {activeLayers.regions && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${isZoomed ? 1.5 * zoomLevel : zoomLevel})`,
            transition: isDragging ? 'none' : 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Downtown High Impact */}
          <path d="M25,35 L45,35 L50,55 L30,60 L20,50 Z" fill="rgba(var(--primary-rgb),0.2)" stroke="var(--primary)" strokeWidth="0.5" strokeDasharray="2 2" />
          {/* North Supply Route */}
          <path d="M70,10 L85,15 L90,40 L70,45 L60,30 Z" fill="none" stroke="white" strokeWidth="0.2" strokeDasharray="1 1" />
          {/* industrial South */}
          <path d="M10,65 L40,65 L45,90 L15,90 Z" fill="none" stroke="var(--primary)" strokeWidth="0.5" />
          {/* Quarantine Zone */}
          <circle cx="65" cy="70" r="12" fill="none" stroke="red" strokeWidth="0.3" strokeDasharray="1 3" />
          <path d="M55,60 L75,80 M75,60 L55,80" stroke="red" strokeWidth="0.1" opacity="0.5" />
        </svg>
      )}

      {/* Technical Grid Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '30px 30px', transform: `translate(${panOffset.x / 2}px, ${panOffset.y / 2}px)` }}></div>

      {/* Scanning Line Animation */}
      <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] z-10 animate-[scan_4s_linear_infinite]"></div>
      <style dangerouslySetInnerHTML={{
        __html: `
      @keyframes scan {
        0% { top: 0%; opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { top: 100%; opacity: 0; }
      }
    `}} />

      {/* Map Pins - Facility Layer */}
      {activeLayers.facilities && facilities.map(facility => (
        <div
          key={facility.id}
          className="absolute z-20 group transition-all"
          style={{
            left: `${facility.x}%`,
            top: `${facility.y}%`,
            transform: `translate(calc(-50% + ${panOffset.x}px), calc(-50% + ${panOffset.y}px)) scale(${isZoomed ? 0.7 : 1})`,
            transition: isDragging ? 'none' : 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: activeLayers.severity || facility.status !== 'Critical' ? 1 : 0.4
          }}
          onMouseEnter={() => setHoveredMarker(facility.id)}
          onMouseLeave={() => setHoveredMarker(null)}
        >
          {/* SVG Marker */}
          <div className={`relative transition-all duration-300 ${hoveredMarker === facility.id ? 'scale-125' : 'scale-100'}`}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
              <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="currentColor" className={`${activeLayers.severity ? (facility.color === 'bg-red-500' ? 'text-red-500' : facility.color === 'bg-orange-500' ? 'text-orange-500' : 'text-green-500') : 'text-neutral-500 opacity-50'}`} />
              {facility.type === 'hospital' && (
                <path d="M10.5 6H13.5V8.5H16V11.5H13.5V14H10.5V11.5H8V8.5H10.5V6Z" fill="white" />
              )}
              {facility.type === 'warehouse' && (
                <path d="M7 14V8L12 5L17 8V14H7Z M9 12H15V9.5L12 7.7L9 9.5V12Z" fill="white" />
              )}
              {facility.type === 'factory' && (
                <path d="M17 15H7V7H12L12 9L15 9V7H17V15Z M9 13H11V11H9V13ZM13 13H15V11H13V13Z" fill="white" />
              )}
              {facility.type === 'clinic' && (
                <circle cx="12" cy="9.5" r="2.5" fill="white" />
              )}
              {!['hospital', 'warehouse', 'factory', 'clinic'].includes(facility.type || '') && (
                <circle cx="12" cy="9" r="3" fill="white" />
              )}
            </svg>

            {/* Pulse Effect for Critical */}
            {facility.status === 'Critical' && activeLayers.severity && (
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-40 -z-10"></div>
            )}
          </div>

          {/* Tooltip (Glassmorphism) */}
          {hoveredMarker === facility.id && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-30 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl min-w-[180px]">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="text-[10px] font-black text-white uppercase tracking-tighter">{facility.name}</h5>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${facility.color} text-white`}>
                    {facility.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-neutral-400 uppercase font-bold">Stock</span>
                    <span className="text-xs font-black text-white">{facility.stock}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-neutral-400 uppercase font-bold">Burn Rate</span>
                    <span className="text-xs font-black text-white">{facility.burnRate}u/h</span>
                  </div>
                </div>
              </div>
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black/90"></div>
            </div>
          )}
        </div>
      ))}

      {/* Map Content Overlays */}
      {isEnlarged && (
        <>

          <div className="absolute top-4 left-4 z-40 hidden md:block">
            <form onSubmit={handleSearch} className="group relative">
              <div className="bg-black/40 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-2 w-72 transition-all group-focus-within:w-80 group-focus-within:border-primary/50">
                <span className="material-symbols-outlined text-primary ml-2">analytics</span>
                <input
                  type="text"
                  placeholder="Analyze Region or Site..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm w-full outline-none text-white placeholder:text-neutral-500 font-medium"
                />
                <button type="submit" className="size-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                  <span className="material-symbols-outlined text-[18px]">search</span>
                </button>
              </div>

              {/* Search Suggestions */}
              {searchQuery.length > 1 && (
                <div className="absolute top-full mt-2 left-0 w-80 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl animate-in slide-in-from-top-2 duration-300">
                  <div className="px-3 py-1.5 text-[9px] font-black text-neutral-500 uppercase tracking-widest">Recommended Queries</div>
                  {['Downtown Zone A', 'Northside Logistics Hub', 'West End Pharma Lab'].filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())).map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => performSearch(suggestion)}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-neutral-300 flex items-center gap-3 transition-colors"
                    >
                      <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>
        </>
      )}

      {isZoomed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-primary/20 backdrop-blur-md border border-primary/40 text-primary px-6 py-3 rounded-full font-black animate-pulse shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] flex items-center gap-3">
            <span className="material-symbols-outlined animate-spin">sync</span>
            FOCAL SYNCHRONIZATION...
          </div>
        </div>
      )}

      {/* Coordinate Labels */}
      <div className="absolute bottom-4 left-4 z-40 hidden md:flex flex-col items-start gap-1 opacity-60">
        <span className="text-[9px] font-mono text-white/50">VIEWPORT_OFFSET: {panOffset.x}px, {panOffset.y}px</span>
        <span className="text-[9px] font-mono text-white/50">MAGNIFICATION: {(zoomLevel * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
};

export function ImpactMapWidget() {
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [activeLayers, setActiveLayers] = useState({
    regions: true,
    facilities: true,
    severity: true
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC and Navigation Keys
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsEnlarged(false);

      if (isEnlarged) {
        const step = 50;
        if (e.key === 'ArrowUp') handlePan('up');
        if (e.key === 'ArrowDown') handlePan('down');
        if (e.key === 'ArrowLeft') handlePan('left');
        if (e.key === 'ArrowRight') handlePan('right');
        if (e.key === '+') setZoomLevel(p => Math.min(p + 0.2, 5));
        if (e.key === '-') setZoomLevel(p => Math.max(p - 0.2, 1));
      }
    };

    if (isEnlarged) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeys);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeys);
    };
  }, [isEnlarged]);

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers((prev: typeof activeLayers) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handlePan = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 60;
    setPanOffset(prev => ({
      x: direction === 'left' ? prev.x + step : direction === 'right' ? prev.x - step : prev.x,
      y: direction === 'up' ? prev.y + step : direction === 'down' ? prev.y - step : prev.y
    }));
  };

  const performSearch = (query: string) => {
    setSearchQuery(query);
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.length > 1) {
      setIsZoomed(true);
      setZoomLevel(2);
      setPanOffset({ x: 0, y: 0 }); // Reset pan on search
      setTimeout(() => {
        setIsZoomed(false);
      }, 2500);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const resetMap = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setIsZoomed(false);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
    }, 1500);
  };

  const handleImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      alert('Map data synchronization complete.');
    }, 1500);
  };

  const mapProps = {
    activeLayers,
    isZoomed,
    zoomLevel,
    panOffset,
    isEnlarged,
    searchQuery,
    setSearchQuery,
    handleSearch,
    performSearch,
    resetMap,
    setZoomLevel,
    setPanOffset,
    handlePan,
    hoveredMarker,
    setHoveredMarker
  };

  return (
    <>
      <div className="bg-white dark:bg-[#23220f] rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-neutral-dark dark:text-white">Impact Map</h3>
          <div className="flex gap-2">
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && performSearch(searchQuery)}
                className="h-8 pl-8 pr-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs border border-neutral-200 dark:border-neutral-700 outline-none focus:border-primary/50 transition-all w-24 focus:w-32"
              />
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[16px] text-neutral-400">search</span>
            </div>
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className={`size-8 rounded-lg flex items-center justify-center transition-colors ${showLayerMenu ? 'bg-primary text-black' : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
            >
              <span className="material-symbols-outlined text-[20px]">layers</span>
            </button>
            <button
              onClick={() => setIsEnlarged(true)}
              className="size-8 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">open_in_full</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <MapContent {...mapProps} className="w-full aspect-video" />

          {/* Layer Quick Toggle Menu */}
          {showLayerMenu && (
            <div className="absolute top-0 right-0 z-20 mt-2 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-100 dark:border-neutral-800 p-2 min-w-[140px] animate-in slide-in-from-top-2 duration-200">
              {(Object.keys(activeLayers) as Array<keyof typeof activeLayers>).map((layer) => (
                <button
                  key={layer as string}
                  onClick={() => toggleLayer(layer)}
                  className="w-full flex items-center justify-between p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors capitalize text-xs font-bold text-neutral-dark dark:text-white"
                >
                  {layer as string}
                  <span className={`material-symbols-outlined text-[16px] ${activeLayers[layer] ? 'text-primary' : 'text-neutral-300'}`}>
                    {activeLayers[layer] ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between text-xs text-neutral-500 font-medium font-mono uppercase tracking-tighter">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="size-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span>2 Critical Alerts</span>
          </div>
          <span>Sync Active</span>
        </div>
      </div>

      {/* Enlarged Map Overlay */}
      {isEnlarged && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-8 animate-in fade-in duration-300 backdrop-blur-md"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={() => setIsEnlarged(false)}
        >
          <div
            className="relative w-full h-full max-w-full md:max-w-7xl md:max-h-[92vh] bg-white dark:bg-neutral-900 md:rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 border border-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-black/5 dark:bg-black/20 border-b border-white/5">
              <div className="flex flex-col">
                <h2 className="text-xl font-black text-neutral-dark dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary filled">spatial_tracking</span>
                  Advanced Visual Analysis Engine
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-widest leading-none">Live Sync</span>
                  <p className="text-xs text-neutral-500">Cross-referencing logistics data with regional impact zones.</p>
                </div>
              </div>
              <button
                onClick={() => setIsEnlarged(false)}
                className="size-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative overflow-hidden bg-neutral-100 dark:bg-[#050505]">
              <MapContent {...mapProps} className="w-full h-full rounded-none" />

              {/* Legend & Layer Control Overlay */}
              <div className="absolute top-6 right-6 flex flex-col gap-4">
                <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/10 flex flex-col gap-3 min-w-[200px]">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/70">Layer Matrix</h4>
                  {(Object.keys(activeLayers) as Array<keyof typeof activeLayers>).map((layer) => (
                    <label key={layer as string} className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm font-bold text-white/80 capitalize group-hover:text-primary transition-colors">{layer as string}</span>
                      <div
                        onClick={() => toggleLayer(layer)}
                        className={`w-8 h-4 rounded-full transition-all relative ${activeLayers[layer] ? 'bg-primary' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-0.5 size-3 rounded-full bg-white shadow-sm transition-transform ${activeLayers[layer] ? 'left-[18px]' : 'left-0.5'}`}></div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/10 flex flex-col gap-3 min-w-[200px]">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/70">Navigation Log</h4>
                  <div className="flex flex-col gap-1 text-[10px] font-mono text-white/40">
                    <div className="flex justify-between"><span>X_TRANS:</span> <span>{panOffset.x}px</span></div>
                    <div className="flex justify-between"><span>Y_TRANS:</span> <span>{panOffset.y}px</span></div>
                    <div className="flex justify-between"><span>ZOOM:</span> <span>{(zoomLevel * 100).toFixed(0)}%</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-black/10 dark:bg-black/40 flex items-center justify-between px-8 border-t border-white/5">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-red-500 border-2 border-white/20"></span>
                  <span className="text-[10px] font-bold text-white/60 uppercase">Critical Impact</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-orange-400 border-2 border-white/20"></span>
                  <span className="text-[10px] font-bold text-white/60 uppercase">Warning zones</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="h-11 px-8 rounded-xl bg-primary text-black text-xs font-black hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  <span className={`material-symbols-outlined text-[18px] ${isExporting ? 'animate-spin' : ''}`}>
                    {isExporting ? 'sync' : 'database'}
                  </span>
                  {isExporting ? 'SYNCHRONIZING...' : 'EXPORT ANALYSIS'}
                </button>
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="h-11 px-8 rounded-xl bg-white/5 text-white text-xs font-black hover:bg-white/10 transition-all flex items-center gap-2 border border-white/10"
                >
                  <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                  IMPORT INTEL
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
