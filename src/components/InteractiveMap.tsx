import React, { useState, useRef, useEffect } from "react";
import { Issue, Cluster } from "../types";
import { 
  MapPin, 
  ZoomIn, 
  ZoomOut, 
  Locate, 
  AlertTriangle, 
  Waves, 
  Zap, 
  Trash2, 
  ShieldAlert,
  Loader2,
  Activity,
  Flame,
  User,
  ExternalLink
} from "lucide-react";
import * as L from "leaflet";
import "leaflet.markercluster";
import { generateBelievableAddress, reverseGeocode } from "../lib/geocoding";

// Dark matter cyberpunk styled tiling layers map
const CARTO_DARK_TILES = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const CARTO_LIGHT_TILES = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const MAP_CENTER_DEFAULT = { lat: 12.9352, lng: 77.6244 }; // Bengaluru, India

interface InteractiveMapProps {
  issues: Issue[];
  clusters: Cluster[];
  selectedIssueId?: string;
  onSelectIssue?: (issue: Issue) => void;
  interactive?: boolean; // If true, client can select coordinate
  onPositionSelected?: (coords: { lat: number; lng: number; address: string }) => void;
  newReportLat?: number;
  newReportLng?: number;
  heightClass?: string;
  theme?: "light" | "dark" | "system";
}

export default function InteractiveMap({
  issues,
  clusters,
  selectedIssueId,
  onSelectIssue,
  interactive = false,
  onPositionSelected,
  newReportLat,
  newReportLng,
  heightClass,
  theme
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const selectionMarkerRef = useRef<L.Marker | null>(null);
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [addressDetails, setAddressDetails] = useState<string>("");

  // Track resolved theme (light or dark)
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    if (theme === "system" || !theme) {
      if (typeof window !== "undefined") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      return "dark";
    }
    return theme === "light" || theme === "dark" ? theme : "dark";
  });

  useEffect(() => {
    if (theme === "system" || !theme) {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const handleMediaChange = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? "dark" : "light");
      };
      setResolvedTheme(media.matches ? "dark" : "light");
      media.addEventListener("change", handleMediaChange);
      return () => media.removeEventListener("change", handleMediaChange);
    } else {
      setResolvedTheme(theme === "light" || theme === "dark" ? theme : "dark");
    }
  }, [theme]);

  // 1. Load Leaflet styles dynamically
  useEffect(() => {
    const styleLinks = [
      { id: "leaflet-css", href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" },
      { id: "leaflet-cluster-css", href: "https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css" },
      { id: "leaflet-cluster-default-css", href: "https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css" }
    ];

    styleLinks.forEach(linkInfo => {
      if (!document.getElementById(linkInfo.id)) {
        const link = document.createElement("link");
        link.id = linkInfo.id;
        link.rel = "stylesheet";
        link.href = linkInfo.href;
        document.head.appendChild(link);
      }
    });
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true // Performance boost for large datasets
      }).setView([MAP_CENTER_DEFAULT.lat, MAP_CENTER_DEFAULT.lng], 12);

      const initialTiles = resolvedTheme === "light" ? CARTO_LIGHT_TILES : CARTO_DARK_TILES;
      const tiles = L.tileLayer(initialTiles, {
        subdomains: "abcd",
        maxZoom: 20
      }).addTo(map);
      tileLayerRef.current = tiles;

      // Initialize Cluster Group
      const clusterGroup = (L as any).markerClusterGroup({
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        chunkedLoading: true,
        maxClusterRadius: 50,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();
          return L.divIcon({
            html: `<div class="marker-cluster-custom"><span>${count}</span></div>`,
            className: 'custom-cluster-icon',
            iconSize: L.point(40, 40)
          });
        }
      });
      map.addLayer(clusterGroup);
      clusterGroupRef.current = clusterGroup;

      mapInstanceRef.current = map;
      setIsLoading(false);

      map.on("click", (e: L.LeafletMouseEvent) => {
        if (!interactive || !onPositionSelected) return;
        const { lat, lng } = e.latlng;
        const numericLat = Number(lat.toFixed(5));
        const numericLng = Number(lng.toFixed(5));
        const generatedAddr = generateBelievableAddress(numericLat, numericLng);
        onPositionSelected({
          lat: numericLat,
          lng: numericLng,
          address: generatedAddr
        });
        reverseGeocode(numericLat, numericLng).then((realAddr) => {
          onPositionSelected({
            lat: numericLat,
            lng: numericLng,
            address: realAddr
          });
        }).catch(() => {});
      });

    } catch (e) {
      console.error("Leaflet initialization failed", e);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [interactive]);

  // 3. Keep Pins, Markers, Clusters updated
  useEffect(() => {
    const map = mapInstanceRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!map || !clusterGroup) return;

    // Clear existing
    clusterGroup.clearLayers();
    markersRef.current = {};

    // Render active Issue markers
    issues.forEach(issue => {
      const isSelected = selectedIssueId === issue.id;
      const isCritical = issue.severity === "Critical";
      
      const categoryIconMap: { [key: string]: string } = {
        "Water Leakage": "💧",
        "Broken Streetlights": "🔦",
        "Waste Management Issues": "♻️",
        "Public Safety Hazards": "🚨",
        "Potholes": "🚧"
      };

      const rIcon = L.divIcon({
        className: "custom-leaflet-pin",
        html: `
          <div style="position: relative; transform: translate(-50%, -50%); display: flex; align-items: center; justify-center;">
            ${isCritical ? `<div style="position: absolute; width: 34px; height: 34px; background: rgba(239, 68, 68, 0.25); border-radius: 50%; animation: pulse 1.5s infinite; filter: blur(1px);"></div>` : ""}
            <div style="
              width: 26px; 
              height: 26px; 
              background: ${resolvedTheme === "light" ? "#ffffff" : "#0f0f11"}; 
              border: 1.5px solid ${isSelected ? "#14b8a6" : (resolvedTheme === "light" ? "#cbd5e1" : "#27272a")}; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              box-shadow: 0 4px 10px rgba(0,0,0,0.6);
              transition: transform 0.2s;
              transform: ${isSelected ? "scale(1.25)" : "scale(1)"};
              font-size: 11px;
            ">
              ${categoryIconMap[issue.category] || "📂"}
            </div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [0, 0]
      });

      const nMarker = L.marker([issue.latitude, issue.longitude], { icon: rIcon })
        .on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          if (onSelectIssue) onSelectIssue(issue);
        });

      clusterGroup.addLayer(nMarker);
      markersRef.current[issue.id] = nMarker;
    });

    // Render Heat overlays
    clusters.forEach(cluster => {
      const clusterCircle = L.circle([cluster.latitude, cluster.longitude], {
        color: "#f59e0b",
        fillColor: "#ef4444",
        fillOpacity: 0.15,
        radius: 150,
        weight: 1,
        dashArray: "4 4"
      }).addTo(map);

      clusterCircle.bindTooltip(`${cluster.type} Heatzone (${cluster.count || cluster.affectedIssueIds?.length || 0} issues)`, {
        className: `${resolvedTheme === "light" ? "bg-white text-zinc-800 border-zinc-200" : "bg-[#0f0f11] border-red-500/20 text-red-400"} border font-mono text-[9px] rounded px-2 py-1 shadow-lg`,
        permanent: false,
        direction: "top"
      });
    });

  }, [issues, clusters, selectedIssueId, resolvedTheme]);

  // 4. Update the Reporting Pointer coordinate selections
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectionMarkerRef.current) {
      selectionMarkerRef.current.remove();
      selectionMarkerRef.current = null;
    }

    if (interactive && newReportLat && newReportLng) {
      const reportIcon = L.divIcon({
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);">
            <div style="position: absolute; width: 44px; height: 44px; background: rgba(20, 184, 166, 0.2); border-radius: 50%; animation: ping 1.8s infinite;"></div>
            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${resolvedTheme === "light" ? "#ffffff" : "#0f0f11"}; border: 2px solid #14b8a6; display: flex; align-items: center; justify-content: center; color: #14b8a6; font-size: 14px; box-shadow: 0 10px 20px rgba(0,0,0,0.8);">
              📍
            </div>
          </div>
        `,
        className: "reporting-gps-marker",
        iconSize: [32, 32],
        iconAnchor: [0, 0]
      });

      selectionMarkerRef.current = L.marker([newReportLat, newReportLng], { icon: reportIcon }).addTo(map);
      map.setView([newReportLat, newReportLng], 15);
    }
  }, [newReportLat, newReportLng, interactive, resolvedTheme]);

  // Dynamic Map Theme Switcher effect
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      const newTilesUrl = resolvedTheme === "light" ? CARTO_LIGHT_TILES : CARTO_DARK_TILES;
      const newTiles = L.tileLayer(newTilesUrl, {
        subdomains: "abcd",
        maxZoom: 20
      }).addTo(map);
      tileLayerRef.current = newTiles;
    }
  }, [resolvedTheme]);

  // 5. Track User Geolocation Placement
  const handleDetectUserLocation = () => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by your web browser.");
      return;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });

        // Add locating marker
        if (userLocationMarkerRef.current) {
          userLocationMarkerRef.current.remove();
        }

        const userPinIcon = L.divIcon({
          html: `
            <div style="position: relative; transform: translate(-50%, -50%); display: flex; align-items: center; justify-center;">
              <div style="position: absolute; width: 24px; height: 24px; background: rgba(59, 130, 246, 0.4); border-radius: 50%; animation: pulse 1s infinite;"></div>
              <div style="width: 14px; height: 14px; border: 2px solid #ffffff; background: #3b82f6; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>
            </div>
          `,
          iconSize: [14, 14],
          iconAnchor: [0 ,0],
          className: "user-loc"
        });

        userLocationMarkerRef.current = L.marker([latitude, longitude], { icon: userPinIcon }).addTo(map);
        map.setView([latitude, longitude], 15);
        setIsLoading(false);

        // Feed to reporter coordinates if interactive mode is active
        if (interactive && onPositionSelected) {
          const generatedAddr = generateBelievableAddress(latitude, longitude);
          onPositionSelected({
            lat: latitude,
            lng: longitude,
            address: generatedAddr
          });
          reverseGeocode(latitude, longitude).then((realAddr) => {
            onPositionSelected({
              lat: latitude,
              lng: longitude,
              address: realAddr
            });
          }).catch(() => {});
        }
      },
      (err) => {
        console.warn("Self Location lookup denied or failed. Snapping to Bengaluru Headquarters Hub.", err);
        map.setView([MAP_CENTER_DEFAULT.lat, MAP_CENTER_DEFAULT.lng], 14);
        setIsLoading(false);
      },
      { timeout: 7000 }
    );
  };

  // Zoom management shortcuts
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([MAP_CENTER_DEFAULT.lat, MAP_CENTER_DEFAULT.lng], 14);
    }
  };

  return (
    <div className={`relative w-full ${heightClass || "h-[450px]"} bg-[#050505] rounded-xl overflow-hidden border border-[#1f1f21] select-none`}>
      
      {/* Map Loader */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#050505]/90 z-30 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-teal-400" />
          <p className="text-xs font-mono font-medium text-zinc-400">Loading Street Grid Coordinates...</p>
        </div>
      )}

      {/* Leaflet map node */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-10" 
        style={{ background: "#050505" }}
      />

      {/* Floating Instructions for coordinates selects */}
      {interactive && (
        <div className="absolute top-4 left-4 right-4 pointer-events-none z-20">
          <div className="bg-[#0f0f11]/90 border border-teal-500/20 shadow-2xl p-2.5 rounded-xl text-center max-w-sm mx-auto backdrop-blur-md">
            <div className="text-[11px] text-teal-400 font-mono font-semibold flex items-center justify-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              Manual Pin-Drop Target
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5 font-sans leading-normal">
              Click anywhere on the map to place issue coordinates, or tap the locator button to lock onto your GPS position.
            </p>
          </div>
        </div>
      )}

      {/* Left side telemetry panel */}
      <div className="absolute bottom-4 left-4 pointer-events-none select-none text-[9px] text-zinc-500 font-mono bg-[#050505]/75 p-2 rounded-lg border border-[#1f1f21] leading-tight z-20 backdrop-blur-md space-y-0.5">
        <div className="text-teal-400 font-bold uppercase tracking-wide flex items-center gap-1 mb-1">
          <Activity className="h-3 w-3 text-teal-400 animate-pulse" />
          Telemetry Feed
        </div>
        <div>Grid Center: SF Core S4</div>
        <div>Active Pins: {issues.length}</div>
        <div>Cluster Risk Regions: {clusters.length}</div>
      </div>

      {/* Map Control Utilities Panel right side */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
        {/* Detect user GPS button */}
        <button
          type="button"
          onClick={handleDetectUserLocation}
          className="p-2 bg-[#0f0f11] hover:bg-[#151518] border border-[#1f1f21] text-teal-400 hover:text-[#ededed] rounded-xl shadow-xl transition flex items-center justify-center"
          title="Track Current Location"
        >
          <Locate className="h-4.5 w-4.5" />
        </button>

        <div className="flex flex-col bg-[#0f0f11] border border-[#1f1f21] rounded-xl shadow-xl overflow-hidden divide-y divide-[#1f1f21]">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 hover:bg-[#151518] text-zinc-400 hover:text-zinc-100 transition flex items-center justify-center"
            title="Zoom In"
          >
            <ZoomIn className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 hover:bg-[#151518] text-zinc-400 hover:text-zinc-100 transition flex items-center justify-center"
            title="Zoom Out"
          >
            <ZoomOut className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={handleRecenter}
            className="p-2 hover:bg-[#151518] text-zinc-400 hover:text-zinc-100 transition flex items-center justify-center"
            title="Reset Alignment"
          >
            <MapPin className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
