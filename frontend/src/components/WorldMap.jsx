import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from 'react-simple-maps';
import { ShieldAlert, Activity } from 'lucide-react';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const defaultMarkers = [
  { id: 1, name: "New York, US", coordinates: [-74.006, 40.7128], attacks: 1205, severity: "High" },
  { id: 2, name: "London, UK", coordinates: [-0.1276, 51.5072], attacks: 843, severity: "Medium" },
  { id: 3, name: "Tokyo, JP", coordinates: [139.6917, 35.6895], attacks: 412, severity: "Low" },
  { id: 4, name: "São Paulo, BR", coordinates: [-46.6333, -23.5505], attacks: 1876, severity: "Critical" },
  { id: 5, name: "Lagos, NG", coordinates: [3.3792, 6.5244], attacks: 954, severity: "High" },
  { id: 6, name: "Singapore, SG", coordinates: [103.8198, 1.3521], attacks: 1542, severity: "Critical" },
];

export default function WorldMap({ data = defaultMarkers }) {
  const [activeMarker, setActiveMarker] = useState(null);

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col md:flex-row gap-4">
      {/* Map Area */}
      <div className="flex-1 bg-[#0a0a0f] rounded-xl border border-white/10 relative overflow-hidden flex flex-col group">
        {/* Hover Tooltip Overlay */}
        {activeMarker && (
          <div className="absolute top-4 left-4 bg-[#111116]/90 backdrop-blur-md border border-white/10 p-4 rounded-xl z-10 animate-fade-in shadow-2xl pointer-events-none">
            <h4 className="text-white font-bold text-sm mb-2">{activeMarker.name}</h4>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-white/80 font-medium bg-white/5 px-2 py-1 rounded-md">{activeMarker.attacks.toLocaleString()} Threats</span>
              <span className={`px-2 py-1 rounded-md font-bold ${
                activeMarker.severity === 'Critical' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                activeMarker.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {activeMarker.severity} Risk
              </span>
            </div>
          </div>
        )}
        
        <div className="absolute bottom-4 right-4 text-[10px] text-white/20 uppercase tracking-widest font-bold">
          Live Connection
        </div>

        <ComposableMap
          projectionConfig={{ scale: 145 }}
          width={800}
          height={400}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1a1a24"
                  stroke="#2c2c35"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#252530", outline: "none" },
                    pressed: { fill: "#1a1a24", outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {data.map((marker) => {
            const isCritical = marker.severity === 'Critical';
            const color = isCritical ? '#ef4444' : marker.severity === 'High' ? '#f97316' : '#eab308';
            const isActive = activeMarker?.id === marker.id;
            
            return (
              <Marker 
                key={marker.id} 
                coordinates={marker.coordinates}
                onMouseEnter={() => setActiveMarker(marker)}
                onMouseLeave={() => setActiveMarker(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Outer ping animation */}
                <circle r={isCritical ? 14 : 8} fill={color} opacity={0.2} className="animate-ping" />
                {/* Inner dot */}
                <circle r={isCritical || isActive ? 6 : 4} fill={color} className={isCritical ? "animate-pulse" : ""} />
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      {/* Side Panel: Threat Feed */}
      <div className="w-full md:w-72 bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col">
        <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" /> Active Threat Feed
        </h3>
        <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
          {[...data].sort((a,b) => b.attacks - a.attacks).map((marker) => (
            <div 
              key={marker.id} 
              className={`p-3 rounded-lg transition-all cursor-pointer border ${
                activeMarker?.id === marker.id 
                  ? 'bg-white/10 border-white/20 scale-[1.02]' 
                  : 'bg-white/5 border-transparent hover:bg-white/10'
              }`}
              onMouseEnter={() => setActiveMarker(marker)}
              onMouseLeave={() => setActiveMarker(null)}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-white text-sm font-medium">{marker.name}</span>
                <ShieldAlert className={`w-4 h-4 ${marker.severity === 'Critical' ? 'text-red-500' : marker.severity === 'High' ? 'text-orange-400' : 'text-yellow-400'}`} />
              </div>
              <p className="text-white/40 text-xs">{marker.attacks.toLocaleString()} intercepted</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
