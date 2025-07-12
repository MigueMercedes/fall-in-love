/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ExternalLink,
  Heart,
  MapPin,
  Navigation,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
// Removed Socket.IO imports - using HTTP polling instead

// TypeScript declarations for Leaflet
declare global {
  interface Window {
    L: any;
  }
}

type Mission = "welcome" | "memory" | "secret" | "quiz" | "map" | "final";

export default function LoveAdventure() {
  const [currentMission, setCurrentMission] = useState<Mission>("welcome");
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [answers, setAnswers] = useState({
    memory: "",
    secret: "",
    quiz: { color: "", food: "", emoji: "" },
  });

  // Mission 1 states
  const [mission1ShowResult, setMission1ShowResult] = useState(false);
  const [mission1IsCorrect, setMission1IsCorrect] = useState(false);

  // Mission 2 states (flip cards)
  const [flippedCards, setFlippedCards] = useState<boolean[]>([
    false,
    false,
    false,
  ]);
  const [mission2CanAdvance, setMission2CanAdvance] = useState(false);

  // Mission 3 states (love promises)
  const [selectedPromises, setSelectedPromises] = useState<string[]>([]);
  const [showPromiseResult, setShowPromiseResult] = useState(false);

  // Mission 4 states (location)
  const [mission4ShowFound, setMission4ShowFound] = useState(false);

  // Final mission states
  const [showFinalQuestion, setShowFinalQuestion] = useState(false);
  const [showFinalResponse, setShowFinalResponse] = useState(false);
  const [showNoModal, setShowNoModal] = useState(false);
  const [finalInteractiveMode, setFinalInteractiveMode] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [waitingForAdmin, setWaitingForAdmin] = useState(false);

  // Connection state
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);

  // HTTP polling for monitoring
  const sendMissionProgress = async (mission: string, progress: number) => {
    try {
      await fetch("/api/socket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "mission-progress",
          data: { mission, progress },
        }),
      });
    } catch (error) {
      console.error("Error sending mission progress:", error);
    }
  };

  const sendLocationUpdate = async (
    lat: number,
    lng: number,
    distance: number
  ) => {
    try {
      await fetch("/api/socket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "location-update",
          data: { lat, lng, distance },
        }),
      });
    } catch (error) {
      console.error("Error sending location update:", error);
    }
  };

  const checkAdvanceApproval = async () => {
    try {
      const response = await fetch("/api/socket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "check-advance",
          data: {},
        }),
      });
      const result = await response.json();
      return result.allowAdvance;
    } catch (error) {
      console.error("Error checking advance approval:", error);
      return false;
    }
  };

  // Initialize connection check
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/socket");
        if (response.ok) {
          setIsSocketConnected(true);
          setSocketError(null);
        } else {
          setIsSocketConnected(false);
          setSocketError("No se pudo conectar al servidor de monitoreo");
        }
      } catch {
        setIsSocketConnected(false);
        setSocketError("Error de conexión al servidor de monitoreo");
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Poll for admin approval when waiting
  useEffect(() => {
    if (waitingForAdmin) {
      const pollForApproval = async () => {
        const approved = await checkAdvanceApproval();
        if (approved) {
          setWaitingForAdmin(false);
          setShowFinalQuestion(false);
          setCurrentMessageIndex(currentMessageIndex + 1);
        }
      };

      const interval = setInterval(pollForApproval, 2000); // Check every 2 seconds
      return () => clearInterval(interval);
    }
  }, [waitingForAdmin, currentMessageIndex]);

  // Debug final mission state
  useEffect(() => {
    if (currentMission === "final") {
      console.log("Final mission state:", {
        currentMessageIndex,
        showFinalQuestion,
        waitingForAdmin,
        finalInteractiveMode,
        isSocketConnected,
      });
    }
  }, [
    currentMission,
    currentMessageIndex,
    showFinalQuestion,
    waitingForAdmin,
    finalInteractiveMode,
    isSocketConnected,
  ]);

  // Target location coordinates (meeting point)
  const targetLocation = {
    lat: 18.467997618938792, // Meeting point latitude
    lng: -69.8481997872944, // Meeting point longitude
    name: "Nuestro lugar especial ✨", // The meeting place name
    description: "Donde las estrellas brillan más para nosotros 🌟",
  };

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState("");
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [distanceToTarget, setDistanceToTarget] = useState<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  const missions = [
    { id: "welcome", title: "Bienvenida", progress: 0 },
    { id: "memory", title: "Nuestros Momentos", progress: 20 },
    { id: "secret", title: "Nuestros Momentos Especiales", progress: 40 },
    { id: "quiz", title: "Amor Nivel Experto", progress: 60 },
    { id: "map", title: "El Destino del Corazón", progress: 80 },
    { id: "final", title: "Misión Final", progress: 100 },
  ];

  const finalMessages = [
    "¡Misión Final!",
    "Recuerda ese lugar, es el lugar donde nos conocimos realmente...",
    "👀 Mira a tu alrededor y encuentrame",
    "¿Me encontraste?",
    "Hemos llegado al final de nuestra aventura",
    "Cada paso, cada risa, cada momento...",
    "Todo nos ha llevado hasta aquí",
    "En este lugar especial, bajo las estrellas...",
    "Esa noche en la discoteca...",
    "Ese brillo que pude observar en tus ojos...",
    "Te amo Geraldine Santos",
  ];

  // Load Leaflet CSS and JS
  useEffect(() => {
    if (currentMission === "map" && !mapLoaded) {
      // Load Leaflet CSS
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      cssLink.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      cssLink.crossOrigin = "";
      document.head.appendChild(cssLink);

      // Load Leaflet JS
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      script.crossOrigin = "";
      script.onload = () => {
        setMapLoaded(true);
        initializeMap();
      };
      document.head.appendChild(script);
    }
  }, [currentMission]);

  // Handle final mission message delays
  useEffect(() => {
    if (currentMission === "final" && !finalInteractiveMode) {
      // Start interactive mode immediately
      setFinalInteractiveMode(true);
      setCurrentMessageIndex(0);
    }
  }, [currentMission, finalInteractiveMode]);

  // Final mission handlers
  const handleScreenTap = () => {
    console.log("Screen tapped! Current message index:", currentMessageIndex);
    if (currentMessageIndex === 3) {
      // This is the "¿Me encontraste?" message
      // Show Yes/No buttons
      console.log("Showing final question buttons");
      setShowFinalQuestion(true);
    } else if (currentMessageIndex < finalMessages.length - 1) {
      console.log("Moving to next message");
      setCurrentMessageIndex(currentMessageIndex + 1);
    }
  };

  const handleFoundResponse = (found: boolean) => {
    // Check if WebSocket is connected before proceeding
    if (!isSocketConnected) {
      setSocketError(
        "Error: No hay conexión con el servidor de monitoreo. El administrador no podrá aprobar tu avance."
      );
      return;
    }

    // SIEMPRE esperar aprobación del admin, sin importar la respuesta
    setWaitingForAdmin(true);

    if (found) {
      // Si dice que sí me encontró, enviar progreso especial para que el admin confirme
      sendMissionProgress("final", 75); // Progreso especial: dice que me encontró
    } else {
      // Si dice que no me encontró, enviar progreso para que el admin sepa que sigue buscando
      sendMissionProgress("final", 50); // Progreso especial: sigue buscando
    }
  };

  const handleFinalAnswer = (answer: "accepted" | "rejected") => {
    if (answer === "rejected") {
      setShowNoModal(true);
    } else {
      setShowFinalResponse(true);
      triggerConfetti();
    }
  };

  const closeNoModal = () => {
    setShowNoModal(false);
  };

  // Initialize the map
  const initializeMap = () => {
    if (mapRef.current && window.L && !mapInstanceRef.current) {
      // Create map
      const map = window.L.map(mapRef.current).setView(
        [targetLocation.lat, targetLocation.lng],
        16
      );

      // Add tile layer (OpenStreetMap)
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create custom heart icon
      const heartIcon = window.L.divIcon({
        html: `
          <div style="
            background: linear-gradient(135deg, #ff6b9d, #c44569);
            width: 44px;
            height: 44px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 32px rgba(255, 107, 157, 0.4);
            animation: heartbeat 2s ease-in-out infinite;
            border: 3px solid rgba(255, 255, 255, 0.3);
          ">
            <span style="
              color: white;
              font-size: 18px;
              transform: rotate(45deg);
              font-weight: bold;
              filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            ">💖</span>
          </div>
          <style>
            @keyframes heartbeat {
              0%, 100% { transform: rotate(-45deg) scale(1); }
              50% { transform: rotate(-45deg) scale(1.15); }
            }
          </style>
        `,
        className: "custom-heart-marker",
        iconSize: [44, 44],
        iconAnchor: [22, 38],
      });

      // Add target marker
      const targetMarker = window.L.marker(
        [targetLocation.lat, targetLocation.lng],
        {
          icon: heartIcon,
        }
      ).addTo(map);

      // Add popup to target marker
      targetMarker
        .bindPopup(
          `
        <div style="text-align: center; padding: 12px; background: linear-gradient(135deg, #ffeef8, #f8e8ff); border-radius: 16px; border: none;">
          <div style="font-size: 24px; margin-bottom: 12px; animation: sparkle 2s ease-in-out infinite;">✨</div>
          <div style="font-weight: bold; color: #8b2635; margin-bottom: 8px; font-size: 16px;">
            ${targetLocation.name}
          </div>
          <div style="color: #c44569; font-size: 14px; font-style: italic;">
            ${targetLocation.description}
          </div>
        </div>
        <style>
          @keyframes sparkle {
            0%, 100% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.1) rotate(180deg); }
          }
        </style>
      `,
          {
            closeButton: false,
            className: "custom-popup",
          }
        )
        .openPopup();

      // Add user location marker if available
      if (userLocation) {
        const userIcon = window.L.divIcon({
          html: `
            <div style="
              background: linear-gradient(135deg, #667eea, #764ba2);
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 4px solid rgba(255, 255, 255, 0.9);
              box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
              animation: pulse 2s infinite;
            "></div>
            <style>
              @keyframes pulse {
                0% { box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4); }
                50% { box-shadow: 0 4px 16px rgba(102, 126, 234, 0.8), 0 0 0 12px rgba(102, 126, 234, 0.1); }
                100% { box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4); }
              }
            </style>
          `,
          className: "user-location-marker",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        window.L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
        })
          .addTo(map)
          .bindPopup("Tu ubicación actual 📍");

        // Draw line between user and target
        const latlngs = [
          [userLocation.lat, userLocation.lng],
          [targetLocation.lat, targetLocation.lng],
        ];

        window.L.polyline(latlngs, {
          color: "#ff6b9d",
          weight: 4,
          opacity: 0.8,
          dashArray: "12, 8",
        }).addTo(map);

        // Fit map to show both points
        const group = new window.L.featureGroup([
          window.L.marker([userLocation.lat, userLocation.lng]),
          window.L.marker([targetLocation.lat, targetLocation.lng]),
        ]);
        map.fitBounds(group.getBounds().pad(0.1));
      }

      mapInstanceRef.current = map;

      // Add custom CSS for popup
      const style = document.createElement("style");
      style.textContent = `
        .custom-popup .leaflet-popup-content-wrapper {
          background: linear-gradient(135deg, #ffeef8, #f8e8ff);
          border: 2px solid rgba(255, 107, 157, 0.3);
          border-radius: 20px;
          box-shadow: 0 16px 48px rgba(255, 107, 157, 0.2);
          backdrop-filter: blur(10px);
        }
        .custom-popup .leaflet-popup-tip {
          background: linear-gradient(135deg, #ffeef8, #f8e8ff);
          border: 2px solid rgba(255, 107, 157, 0.3);
        }
        .leaflet-container {
          border-radius: 20px;
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Update map when user location changes
  useEffect(() => {
    if (mapInstanceRef.current && userLocation && mapLoaded) {
      // Clear existing user marker and line
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (
          layer.options &&
          layer.options.icon &&
          layer.options.icon.options.className === "user-location-marker"
        ) {
          mapInstanceRef.current.removeLayer(layer);
        }
        if (layer instanceof window.L.Polyline) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      // Add new user marker
      const userIcon = window.L.divIcon({
        html: `
          <div style="
            background: linear-gradient(135deg, #667eea, #764ba2);
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 4px solid rgba(255, 255, 255, 0.9);
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
            animation: pulse 2s infinite;
          "></div>
          <style>
            @keyframes pulse {
              0% { box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4); }
              50% { box-shadow: 0 4px 16px rgba(102, 126, 234, 0.8), 0 0 0 12px rgba(102, 126, 234, 0.1); }
              100% { box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4); }
            }
          </style>
        `,
        className: "user-location-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      window.L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
      })
        .addTo(mapInstanceRef.current)
        .bindPopup("Tu ubicación actual 📍");

      // Draw line between user and target
      const latlngs = [
        [userLocation.lat, userLocation.lng],
        [targetLocation.lat, targetLocation.lng],
      ];

      window.L.polyline(latlngs, {
        color: "#ff6b9d",
        weight: 4,
        opacity: 0.8,
        dashArray: "12, 8",
      }).addTo(mapInstanceRef.current);

      // Fit map to show both points
      const group = new window.L.featureGroup([
        window.L.marker([userLocation.lat, userLocation.lng]),
        window.L.marker([targetLocation.lat, targetLocation.lng]),
      ]);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [userLocation, mapLoaded]);

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const nextMission = (mission: Mission) => {
    triggerConfetti();
    setTimeout(() => {
      setCurrentMission(mission);
      const missionData = missions.find((m) => m.id === mission);
      if (missionData) {
        setProgress(missionData.progress);
        sendMissionProgress(mission, missionData.progress);
      }
    }, 1000);
  };

  // Calculate distance between two coordinates
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Check user's location
  const checkLocation = () => {
    setIsCheckingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Tu dispositivo no soporta geolocalización 😔");
      setIsCheckingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Using real GPS coordinates
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // 🔧 TESTING MODE - Uncomment these lines to simulate being close to target
        // const userLat = targetLocation.lat + 0.0003; // ~33 meters north
        // const userLng = targetLocation.lng + 0.0002; // ~15 meters east

        setUserLocation({ lat: userLat, lng: userLng });

        const distance = calculateDistance(
          userLat,
          userLng,
          targetLocation.lat,
          targetLocation.lng
        );

        setDistanceToTarget(Math.round(distance));
        setIsCheckingLocation(false);

        // Send location update
        sendLocationUpdate(userLat, userLng, Math.round(distance));

        // Allow access if within 50 meters of target location
        if (distance <= 50) {
          setMission4ShowFound(true);
          triggerConfetti();
        }
      },
      (error) => {
        setIsCheckingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "Necesito acceso a tu ubicación para continuar 📍"
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("No puedo obtener tu ubicación actual 😔");
            break;
          case error.TIMEOUT:
            setLocationError("Tiempo agotado obteniendo ubicación ⏰");
            break;
          default:
            setLocationError("Error desconocido obteniendo ubicación 😕");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Open in Google Maps
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${targetLocation.lat},${targetLocation.lng}`;
    window.open(url, "_blank");
  };

  // Open in Apple Maps
  const openInAppleMaps = () => {
    const url = `http://maps.apple.com/?daddr=${targetLocation.lat},${targetLocation.lng}`;
    window.open(url, "_blank");
  };

  // Welcome Screen
  if (currentMission === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-32 right-10 w-72 h-72 bg-gradient-to-r from-purple-300 to-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-32 left-32 w-72 h-72 bg-gradient-to-r from-red-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="text-center space-y-10 max-w-md relative z-10">
          <div className="space-y-6">
            <div className="relative">
              <div className="text-8xl animate-bounce mb-4">💖</div>
              <div className="absolute inset-0 text-8xl animate-pulse opacity-30">
                ✨
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent leading-tight">
              ¡Bienvenida a nuestra pequeña aventura del amor!
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              Cada misión será una experiencia única. ¿Te animas? ✨
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex justify-center space-x-4">
              {["💕", "🌸", "✨", "🦋", "💫"].map((emoji, i) => (
                <span
                  key={i}
                  className="text-3xl animate-pulse hover:animate-bounce transition-all duration-300 cursor-pointer"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  {emoji}
                </span>
              ))}
            </div>

            <Button
              onClick={() => nextMission("memory")}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white px-10 py-4 text-xl font-semibold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-white/20"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Empezar la aventura 💝
            </Button>
          </div>
        </div>

        {showConfetti && <Confetti />}
        <FloatingHearts />
      </div>
    );
  }

  // Memory Mission
  if (currentMission === "memory") {
    const correctAnswer =
      "Fuimos a hablar frente al mar mientras bebiamos un FourLoko🌊";

    const handleAnswerSelect = (selectedAnswer: string) => {
      setMission1ShowResult(true);

      if (selectedAnswer === correctAnswer) {
        setMission1IsCorrect(true);
        setAnswers({ ...answers, memory: selectedAnswer });
        triggerConfetti();
        setTimeout(() => {
          nextMission("secret");
        }, 3000);
      } else {
        setMission1IsCorrect(false);
      }
    };

    const tryAgain = () => {
      setMission1ShowResult(false);
      setMission1IsCorrect(false);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-r from-purple-300 to-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-2xl mx-auto pt-8 relative z-10">
          <MissionHeader
            title="Misión 1: Nuestros Momentos"
            progress={progress}
            isSocketConnected={isSocketConnected}
            socketError={socketError}
          />

          <Card className="mt-8 backdrop-blur-md bg-white/70 border-white/20 shadow-2xl border-2">
            <CardHeader className="text-center bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-red-100/80 backdrop-blur-sm">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
                <Heart className="text-pink-500 h-8 w-8" />
                Memoria de nuestra primera cita
                <Heart className="text-pink-500 h-8 w-8" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {!mission1ShowResult ? (
                <>
                  <div className="text-center">
                    <div className="text-6xl mb-6 animate-pulse">📸💕</div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-pink-200/50 backdrop-blur-sm">
                      <p className="text-xl font-semibold text-gray-700 mb-4">
                        ¿Recuerdas qué hicimos en nuestra primera cita a solas?
                      </p>
                      <p className="text-gray-600">
                        Elige la respuesta correcta para continuar 💭
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      "Fuimos al cine 🎬",
                      "Fuimos a la discoteca 💃",
                      "Fuimos a tomar café y comimos algo rico 🍰",
                      "Fuimos a hablar frente al mar mientras bebiamos un FourLoko🌊",
                    ].map((option, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="w-full p-6 text-left border-2 border-pink-200/50 hover:border-pink-400 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 whitespace-normal break-words text-lg font-medium transition-all duration-300 transform hover:scale-[1.02] backdrop-blur-sm bg-white/50"
                        onClick={() => handleAnswerSelect(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center space-y-8">
                  {mission1IsCorrect ? (
                    <>
                      <div className="text-8xl animate-bounce">🎉</div>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300/50 p-8 rounded-2xl backdrop-blur-sm">
                        <p className="text-3xl font-bold text-green-700 mb-4">
                          ¡Exacto! 💕
                        </p>
                        <p className="text-xl text-green-600 mb-4">
                          Ese momento frente al mar fue mágico... 🌊✨
                        </p>
                        <p className="text-green-600 font-medium">
                          Preparando la siguiente misión...
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-8xl animate-bounce">🤔</div>
                      <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300/50 p-8 rounded-2xl backdrop-blur-sm">
                        <p className="text-3xl font-bold text-red-700 mb-4">
                          ¡¿Cómo puede ser?! 😱
                        </p>
                        <p className="text-xl text-red-600 mb-4">
                          ¡Waooo! ¿En serio no recuerdas nuestro momento
                          especial frente al mar? 🌊
                        </p>
                        <p className="text-red-600 mb-6 font-medium">
                          Te doy una pista: había alcohol de por medio... 🍻
                        </p>
                        <Button
                          onClick={tryAgain}
                          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-3 rounded-full font-semibold transform hover:scale-105 transition-all duration-300"
                        >
                          Intentar de nuevo 💭
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {showConfetti && <Confetti />}
      </div>
    );
  }

  // Secret Message Mission
  if (currentMission === "secret") {
    const handleCardFlip = (cardIndex: number) => {
      const newFlippedCards = [...flippedCards];
      newFlippedCards[cardIndex] = true;
      setFlippedCards(newFlippedCards);

      // Check if all cards are flipped
      if (newFlippedCards.every((flipped) => flipped)) {
        setTimeout(() => {
          setMission2CanAdvance(true);
          triggerConfetti();
        }, 1000);
      }
    };

    const cardData = [
      {
        src: "/memories/1.jpg",
        alt: "Momento especial 1",
        caption: "Cada sonrisa tuya ilumina mi día ✨",
        title: "Primer Recuerdo",
      },
      {
        src: "/memories/2.jpg",
        alt: "Momento especial 2",
        caption: "Momentos que atesoro en mi corazón 💝",
        title: "Segundo Recuerdo",
      },
      {
        src: "/memories/3.jpg",
        alt: "Momento especial 3",
        caption: "Contigo todo es más hermoso 🌸",
        title: "Tercer Recuerdo",
      },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-80 h-80 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-purple-300 to-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 relative z-10">
          <MissionHeader
            title="Misión 2: Nuestros Momentos Especiales"
            progress={progress}
            isSocketConnected={isSocketConnected}
            socketError={socketError}
          />

          <Card className="mt-8 backdrop-blur-md bg-white/70 border-white/20 shadow-2xl border-2">
            <CardHeader className="text-center bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-red-100/80 backdrop-blur-sm">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
                <Heart className="text-pink-500 h-8 w-8" />
                Galería de Recuerdos
                <Heart className="text-pink-500 h-8 w-8" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              <div className="text-center space-y-6">
                <div className="text-6xl mb-6 animate-pulse">📸💕</div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl border-2 border-pink-200/50 backdrop-blur-sm">
                  <p className="text-2xl font-bold text-gray-700 leading-relaxed mb-4">
                    Momentos que me han hecho conectar contigo y nunca quiero
                    olvidar
                  </p>
                  <p className="text-gray-600 text-lg mb-4 italic">
                    Hay más pero no suelo tirar fotos hehehe 😅
                  </p>
                  <p className="text-gray-700 font-semibold text-lg">
                    👆 Toca cada carta para revelar nuestros recuerdos
                  </p>
                </div>
              </div>

              {/* Flip Cards Gallery */}
              <div className="grid md:grid-cols-3 gap-8">
                {cardData.map((card, index) => (
                  <div
                    key={index}
                    className="relative h-96 cursor-pointer group"
                    onClick={() =>
                      !flippedCards[index] && handleCardFlip(index)
                    }
                  >
                    <div
                      className={`relative w-full h-full transition-transform duration-700 preserve-3d ${
                        flippedCards[index] ? "rotate-y-180" : ""
                      } group-hover:scale-105`}
                      style={{
                        transformStyle: "preserve-3d",
                      }}
                    >
                      {/* Card Back (Hidden Memory) */}
                      <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 flex items-center justify-center shadow-2xl border-4 border-white/30 backdrop-blur-sm">
                        <div className="text-center text-white p-6">
                          <div className="text-6xl mb-6 animate-pulse">💖</div>
                          <p className="text-2xl font-bold mb-4">
                            {card.title}
                          </p>
                          <p className="text-lg opacity-90">
                            Toca para revelar
                          </p>
                          <div className="mt-4 text-4xl animate-bounce">✨</div>
                        </div>
                      </div>

                      {/* Card Front (Revealed Memory) */}
                      <div
                        className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30"
                        style={{
                          transform: "rotateY(180deg)",
                        }}
                      >
                        <div className="relative h-full">
                          <Image
                            src={card.src}
                            alt={card.alt}
                            className="w-full h-full object-cover"
                            width={500}
                            height={500}
                            priority
                            quality={100}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                            <div className="absolute bottom-6 left-6 right-6 text-center">
                              <div className="text-white text-4xl animate-pulse mb-4">
                                💖
                              </div>
                              <p className="text-white text-lg font-semibold leading-relaxed">
                                {card.caption}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Button */}
              <div className="text-center pt-8">
                <Button
                  onClick={() => nextMission("quiz")}
                  disabled={!mission2CanAdvance}
                  className={`px-12 py-4 text-xl font-semibold rounded-full shadow-2xl transform transition-all duration-300 ${
                    mission2CanAdvance
                      ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white hover:scale-105 border-2 border-white/20"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {mission2CanAdvance
                    ? "Continuar con la aventura 💖"
                    : "Revela todos los recuerdos primero 🔒"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {showConfetti && <Confetti />}

        {/* Custom CSS for 3D flip effect */}
        <style jsx>{`
          .preserve-3d {
            transform-style: preserve-3d;
          }
          .backface-hidden {
            backface-visibility: hidden;
          }
          .rotate-y-180 {
            transform: rotateY(180deg);
          }
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    );
  }

  // Quiz Mission
  if (currentMission === "quiz") {
    const lovePromises = [
      {
        id: "adventures",
        text: "Vivir aventuras juntos y crear recuerdos únicos",
        emoji: "🌟",
        description: "Explorar el mundo contigo",
      },
      {
        id: "support",
        text: "Apoyarte en cada sueño y meta que tengas",
        emoji: "💪",
        description: "Ser tu compañero incondicional",
      },
      {
        id: "laughter",
        text: "Hacerte reír todos los días, incluso en los difíciles",
        emoji: "😊",
        description: "Llenar tu vida de sonrisas",
      },
      {
        id: "respect",
        text: "Respetarte siempre y valorar tu individualidad",
        emoji: "🤝",
        description: "Honrar quien eres",
      },
      {
        id: "growth",
        text: "Crecer juntos y ser mejores personas cada día",
        emoji: "🌱",
        description: "Evolucionar como pareja",
      },
      {
        id: "love",
        text: "Amarte incondicionalmente en todas las circunstancias",
        emoji: "💕",
        description: "Amor puro y verdadero",
      },
    ];

    const handlePromiseSelect = (promiseId: string) => {
      if (selectedPromises.includes(promiseId)) {
        setSelectedPromises(selectedPromises.filter((id) => id !== promiseId));
      } else {
        setSelectedPromises([...selectedPromises, promiseId]);
      }
    };

    const handleContinue = () => {
      if (selectedPromises.length >= 3) {
        setShowPromiseResult(true);
        triggerConfetti();
        setTimeout(() => {
          nextMission("map");
        }, 4000);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-80 h-80 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-purple-300 to-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-4xl mx-auto pt-8 relative z-10">
          <MissionHeader
            title="Misión 3: Promesas del Corazón"
            progress={progress}
            isSocketConnected={isSocketConnected}
            socketError={socketError}
          />

          <Card className="mt-8 backdrop-blur-md bg-white/70 border-white/20 shadow-2xl border-2">
            <CardHeader className="text-center bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-red-100/80 backdrop-blur-sm">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
                <Heart className="text-pink-500 h-8 w-8" />
                Mis Promesas Para Ti
                <Heart className="text-pink-500 h-8 w-8" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {!showPromiseResult ? (
                <>
                  <div className="text-center space-y-6">
                    <div className="text-6xl mb-6 animate-pulse">💝</div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl border-2 border-pink-200/50 backdrop-blur-sm">
                      <p className="text-2xl font-bold text-gray-700 leading-relaxed mb-2">
                        Estas son las promesas que quiero hacerte...
                      </p>
                      <p className="text-gray-600">
                        Selecciona las que más significado tengan para ti ✨
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        (Elige al menos 3 promesas)
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {lovePromises.map((promise) => (
                      <div
                        key={promise.id}
                        onClick={() => handlePromiseSelect(promise.id)}
                        className={`p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                          selectedPromises.includes(promise.id)
                            ? "bg-gradient-to-r from-purple-200 to-pink-200 border-pink-400 shadow-2xl"
                            : "bg-white border-pink-200 hover:border-pink-300 hover:shadow-md"
                        }`}
                      >
                        <div className="text-center space-y-4">
                          <div
                            className={`text-4xl transition-all duration-300 ${
                              selectedPromises.includes(promise.id)
                                ? "animate-bounce"
                                : ""
                            }`}
                          >
                            {promise.emoji}
                          </div>
                          <h3 className="font-bold text-pink-800 text-xl">
                            {promise.description}
                          </h3>
                          <p className="text-gray-600 text-lg leading-relaxed">
                            {promise.text}
                          </p>
                          {selectedPromises.includes(promise.id) && (
                            <div className="text-pink-500 text-lg font-medium">
                              ✓ Seleccionada
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <div className="mb-6">
                      <span className="text-pink-600">
                        Promesas seleccionadas: {selectedPromises.length}/3
                        mínimo
                      </span>
                    </div>
                    <Button
                      onClick={handleContinue}
                      disabled={selectedPromises.length < 3}
                      className={`px-12 py-4 text-xl font-semibold rounded-full shadow-2xl transform transition-all duration-300 ${
                        selectedPromises.length >= 3
                          ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white hover:scale-105 border-2 border-white/20"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {selectedPromises.length >= 3
                        ? "Continuar la aventura 💖"
                        : "Selecciona al menos 3 promesas"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-8">
                  <div className="text-8xl animate-pulse">💕</div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-10 rounded-2xl border-2 border-pink-200/50 backdrop-blur-sm">
                    <p className="text-3xl font-bold text-pink-800 mb-4">
                      ¡Gracias por elegir nuestras promesas! 💝
                    </p>
                    <p className="text-xl text-gray-600 mb-4">
                      Estas promesas vivirán en mi corazón para siempre...
                    </p>
                    <div className="text-pink-600">
                      <p>Preparando el destino final... 🗺️✨</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {showConfetti && <Confetti />}
      </div>
    );
  }

  // Map Mission
  if (currentMission === "map") {
    const isAtLocation = distanceToTarget !== null && distanceToTarget <= 50;
    const isClose = distanceToTarget !== null && distanceToTarget <= 200;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-80 h-80 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-purple-300 to-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 relative z-10">
          <MissionHeader
            title="Misión 4: El Destino del Corazón"
            progress={progress}
            isSocketConnected={isSocketConnected}
            socketError={socketError}
          />

          <div className="grid lg:grid-cols-2 gap-8 mt-8">
            {/* Instructions Card */}
            <Card className="border-white/20 shadow-2xl backdrop-blur-md bg-white/70 border-2">
              <CardHeader className="text-center bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-red-100/80 backdrop-blur-sm">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
                  <MapPin className="text-pink-500 h-8 w-8" />
                  Encuentra el Lugar Especial
                  <MapPin className="text-pink-500 h-8 w-8" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="text-center">
                  <div className="text-6xl mb-6 animate-pulse">🗺️✨</div>
                  <p className="text-xl text-gray-700 mb-4">
                    Es hora de encontrar nuestro lugar especial...
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-pink-200/50 backdrop-blur-sm">
                  <div className="text-center space-y-4">
                    <div className="text-3xl">🌟</div>
                    <p className="text-lg font-semibold text-gray-700">
                      &ldquo;Donde las estrellas brillan más para
                      nosotros&rdquo;
                    </p>
                    <p className="text-gray-600 text-sm">
                      Ese lugar donde compartimos el momento más mágico bajo el
                      cielo nocturno...
                    </p>
                  </div>
                </div>

                {/* Found Message */}
                {mission4ShowFound && (
                  <div className="bg-green-50 border-2 border-green-200 p-8 rounded-2xl text-center backdrop-blur-sm">
                    <div className="text-6xl mb-6 animate-pulse">🎉</div>
                    <p className="text-3xl font-bold text-green-700 mb-2">
                      ¡Me has encontrado! 💕
                    </p>
                    <p className="text-green-600">
                      Sabía que llegarías hasta aquí... ✨
                    </p>
                  </div>
                )}

                {/* Location Status */}
                {distanceToTarget !== null && !mission4ShowFound && (
                  <div
                    className={`p-6 rounded-2xl text-center ${
                      isAtLocation
                        ? "bg-green-50 border-2 border-green-200"
                        : isClose
                        ? "bg-yellow-50 border-2 border-yellow-200"
                        : "bg-red-50 border-2 border-red-200"
                    }`}
                  >
                    {isAtLocation ? (
                      <div className="space-y-3">
                        <div className="text-3xl">🎯</div>
                        <p className="text-green-700 font-semibold">
                          ¡Perfecto! Estás muy cerca
                        </p>
                        <p className="text-green-600">
                          ¡Búscame! Estoy aquí... 👀
                        </p>
                      </div>
                    ) : isClose ? (
                      <div className="space-y-3">
                        <div className="text-3xl">🚶‍♀️</div>
                        <p className="text-yellow-700 font-semibold">
                          ¡Muy cerca! Estás a {distanceToTarget}m
                        </p>
                        <p className="text-yellow-600">
                          Sigue buscando, casi llegas 💪
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-3xl">🧭</div>
                        <p className="text-red-700 font-semibold">
                          Estás a {distanceToTarget}m del lugar
                        </p>
                        <p className="text-red-600">
                          Usa el mapa para llegar 📍
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Location Error */}
                {locationError && (
                  <div className="bg-red-50 border-2 border-red-200 p-6 rounded-2xl text-center backdrop-blur-sm">
                    <div className="text-3xl mb-2">😔</div>
                    <p className="text-red-700">{locationError}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-4">
                  {mission4ShowFound ? (
                    <div className="space-y-4">
                      <Button
                        onClick={() => nextMission("final")}
                        disabled={!isSocketConnected}
                        className={`w-full py-4 text-xl font-semibold rounded-full shadow-2xl transform transition-all duration-300 ${
                          isSocketConnected
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:scale-105 border-2 border-white/20"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        ¡Continuar al momento final! 💖
                      </Button>

                      {!isSocketConnected && (
                        <div className="text-center text-red-600 text-lg">
                          <p>⚠️ Necesitas conexión al monitor para continuar</p>
                          <p>
                            La misión final requiere supervisión del
                            administrador
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={checkLocation}
                      disabled={isCheckingLocation}
                      className="w-full py-4 text-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full shadow-2xl transform transition-all duration-300 border-2 border-white/20"
                    >
                      {isCheckingLocation ? (
                        <span className="flex items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Verificando ubicación...
                        </span>
                      ) : (
                        "📍 Verificar mi ubicación"
                      )}
                    </Button>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={openInGoogleMaps}
                      variant="outline"
                      className="py-4 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-full shadow-md transform transition-all duration-300 border-2 border-white/20"
                    >
                      <Navigation className="w-5 h-5 mr-2" />
                      Google Maps
                    </Button>
                    <Button
                      onClick={openInAppleMaps}
                      variant="outline"
                      className="py-4 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-full shadow-md transform transition-all duration-300 border-2 border-white/20"
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Apple Maps
                    </Button>
                  </div>
                </div>

                <div className="text-center text-lg text-gray-600 space-y-2">
                  <p>Debes estar físicamente en el lugar para continuar 🥰</p>
                  <p className="text-sm">
                    Necesitas estar dentro de 50 metros del lugar especial
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Map Card */}
            <Card className="border-white/20 shadow-2xl backdrop-blur-md bg-white/70 border-2">
              <CardHeader className="text-center bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-red-100/80 backdrop-blur-sm">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                  🗺️ Tu Destino de Amor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative">
                  {/* Leaflet Map Container */}
                  <div
                    ref={mapRef}
                    className="w-full h-96 bg-pink-50 rounded-b-lg"
                    style={{ minHeight: "400px" }}
                  ></div>

                  {/* Loading Overlay */}
                  {!mapLoaded && (
                    <div className="absolute inset-0 bg-pink-50 rounded-b-lg flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent mx-auto"></div>
                        <p className="text-pink-600">
                          Cargando mapa del amor... 💕
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Distance Indicator */}
                  {userLocation && distanceToTarget !== null && mapLoaded && (
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-pink-200/50">
                        <div className="flex items-center justify-between text-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-pink-700">Tu ubicación</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-pink-500 rounded-full animate-pulse"></div>
                            <span className="font-semibold text-pink-800">
                              {distanceToTarget}m de distancia
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {showConfetti && <Confetti />}
      </div>
    );
  }

  // Final Mission
  if (currentMission === "final") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-red-300 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-purple-300 to-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="text-center space-y-10 max-w-md relative z-10">
          {!showFinalResponse ? (
            <>
              <div className="space-y-8">
                <div className="text-10xl animate-pulse">💖</div>

                {/* Interactive Messages */}
                <div
                  className="space-y-6 cursor-pointer"
                  onClick={handleScreenTap}
                >
                  {finalMessages
                    .slice(0, currentMessageIndex + 1)
                    .map((message, index) => (
                      <div
                        key={index}
                        className={`text-3xl font-bold text-pink-800 transition-all duration-1000 ${
                          index === currentMessageIndex ? "animate-pulse" : ""
                        }`}
                      >
                        {message}
                      </div>
                    ))}

                  {/* Tap instruction */}
                  {currentMessageIndex < finalMessages.length - 1 &&
                    !showFinalQuestion && (
                      <div className="text-lg text-gray-600 mt-6 animate-bounce">
                        👆 Toca la pantalla para continuar
                      </div>
                    )}
                </div>

                {/* Socket Error Display */}
                {socketError && (
                  <div className="bg-red-50 border-2 border-red-200 p-6 rounded-2xl text-center backdrop-blur-sm">
                    <div className="text-3xl mb-2">⚠️</div>
                    <p className="text-red-700 font-semibold">{socketError}</p>
                    <p className="text-red-600 text-lg mt-2">
                      Contacta al administrador para resolver este problema.
                    </p>
                  </div>
                )}

                {/* Found Question */}
                {showFinalQuestion && currentMessageIndex === 3 && (
                  <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl border-2 border-pink-300 shadow-2xl space-y-8">
                    {!waitingForAdmin ? (
                      <>
                        <div className="flex justify-center space-x-3">
                          {["💕", "🌸", "✨", "🦋", "💫", "🌟", "💖"].map(
                            (emoji, i) => (
                              <span
                                key={i}
                                className="text-3xl animate-bounce"
                                style={{ animationDelay: `${i * 0.1}s` }}
                              >
                                {emoji}
                              </span>
                            )
                          )}
                        </div>

                        <div className="space-y-6">
                          <p className="text-2xl font-bold text-pink-800">
                            ¿Me encontraste?
                          </p>

                          {/* Connection Status */}
                          {/* <div className="text-lg text-center">
                            <span
                              className={`inline-flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium ${
                                isSocketConnected
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  isSocketConnected
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              ></div>
                              {isSocketConnected
                                ? "Conectado al monitor"
                                : "Sin conexión al monitor"}
                            </span>
                          </div> */}

                          <div className="flex gap-6 justify-center">
                            <Button
                              onClick={() => handleFoundResponse(true)}
                              className="bg-green-500 hover:bg-green-600 text-white px-10 py-4 text-xl font-semibold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20"
                            >
                              ¡Sí! 💖
                            </Button>

                            <Button
                              onClick={() => handleFoundResponse(false)}
                              disabled={!isSocketConnected}
                              className={`px-10 py-4 text-xl font-semibold rounded-full shadow-2xl transform transition-all duration-300 ${
                                isSocketConnected
                                  ? "bg-orange-500 hover:bg-orange-600 text-white hover:scale-105 border-2 border-white/20"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                            >
                              No todavía 🔍
                            </Button>
                          </div>

                          {!isSocketConnected && (
                            <div className="text-center text-red-600 text-lg">
                              <p>⚠️ Sin conexión al servidor de monitoreo</p>
                              <p>
                                No se puede esperar aprobación del administrador
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-6">
                        <div className="text-6xl animate-pulse">⏳</div>
                        <p className="text-2xl font-bold text-pink-800">
                          Esperando confirmación...
                        </p>
                        <p className="text-gray-600">
                          Sigue buscando, cuando me encuentres podrás continuar
                          💕
                        </p>
                        <div className="flex justify-center space-x-2">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div
                              key={i}
                              className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.2}s` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Final Question with Buttons */}
                {currentMessageIndex === finalMessages.length - 1 && (
                  <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl border-2 border-pink-300 shadow-2xl space-y-8">
                    <div className="flex justify-center space-x-3">
                      {["💕", "🌸", "✨", "🦋", "💫", "🌟", "💖"].map(
                        (emoji, i) => (
                          <span
                            key={i}
                            className="text-3xl animate-bounce"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          >
                            {emoji}
                          </span>
                        )
                      )}
                    </div>

                    <div className="space-y-6">
                      <p className="text-4xl font-bold text-pink-800">
                        ¿Aceptarías ser mi novia?
                      </p>

                      <div className="flex gap-6 justify-center">
                        <Button
                          onClick={() => handleFinalAnswer("accepted")}
                          className="bg-green-500 hover:bg-green-600 text-white px-10 py-4 text-xl font-semibold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20"
                        >
                          ¡Sí! 💖
                        </Button>

                        <Button
                          onClick={() => handleFinalAnswer("rejected")}
                          className="bg-red-500 hover:bg-red-600 text-white px-10 py-4 text-xl font-semibold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20"
                        >
                          No 😔
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="text-pink-600 text-xl">
                  La aventura más hermosa apenas comienza... 💕
                </div>
              </div>
            </>
          ) : (
            /* Final Response */
            <div className="space-y-8">
              <div className="text-10xl animate-pulse">💖</div>

              <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl border-2 border-pink-300 shadow-2xl">
                <div className="space-y-6">
                  <p className="text-4xl font-bold text-green-700 mb-4">
                    ¡Gracias por decir que sí! 💖
                  </p>
                  <p className="text-xl text-gray-600 mb-4">
                    Gracias por brindarme la oportunidad de pasar más tiempo a
                    tu lado. Te prometo dar lo mejor de mi! ¡Te quiero mucho! 💕
                  </p>
                  <div className="text-6xl animate-bounce">💋</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal for "No" button */}
        {showNoModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-10 rounded-2xl max-w-md mx-4 shadow-2xl backdrop-blur-sm">
              <div className="text-center space-y-6">
                <div className="text-6xl">😅</div>
                <p className="text-2xl font-bold text-pink-800">
                  ¡Esa opción no es válida!
                </p>
                <p className="text-gray-600">
                  Jajaja, inténtalo de nuevo... Solo hay una respuesta correcta
                  💕
                </p>
                <Button
                  onClick={closeNoModal}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-semibold"
                >
                  Intentar de nuevo 💖
                </Button>
              </div>
            </div>
          </div>
        )}

        <FloatingHearts />
        {showConfetti && <Confetti />}
      </div>
    );
  }

  return null;
}

function MissionHeader({
  title,
  progress,
  // isSocketConnected,
  socketError,
}: {
  title: string;
  progress: number;
  isSocketConnected?: boolean;
  socketError?: string | null;
}) {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-4xl font-bold text-pink-800">{title}</h1>
      <div className="max-w-md mx-auto">
        <Progress
          value={progress}
          className="h-4"
        />
        <p className="text-gray-600 mt-3">{progress}% completado</p>
      </div>

      {/* WebSocket Connection Status */}
      {/* {typeof isSocketConnected !== "undefined" && (
        <div className="flex justify-center">
          <span
            className={`inline-flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium ${
              isSocketConnected
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full ${
                isSocketConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            {isSocketConnected ? "Monitor conectado" : "Monitor desconectado"}
          </span>
        </div>
      )} */}

      {/* Socket Error */}
      {socketError && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-center max-w-md mx-auto backdrop-blur-sm">
          <p className="text-red-700 text-lg">{socketError}</p>
        </div>
      )}
    </div>
  );
}

function Confetti() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything on the server side
  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-bounce opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: `-20px`, // Start from bottom of screen
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
            fontSize: `${1.2 + Math.random() * 0.8}rem`,
            animation: `floatUp ${4 + Math.random() * 3}s ease-out ${
              Math.random() * 2
            }s forwards`,
          }}
        >
          {
            ["💖", "💕", "💗", "💝", "💘", "💓", "💞", "💟"][
              Math.floor(Math.random() * 8)
            ]
          }
        </div>
      ))}

      {/* CSS for floating up animation */}
      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function FloatingHearts() {
  const missionRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (missionRef.current) {
      missionRef.current.style.zIndex = "0";
    }
  }, []);

  // Don't render anything on the server side
  if (!isClient) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-10"
      ref={missionRef}
    >
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-bounce opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 3}s`,
            transform: `scale(${0.5 + Math.random() * 0.8})`,
          }}
        >
          <Heart
            className="text-pink-400 w-8 h-8 animate-pulse"
            style={{
              filter: `hue-rotate(${Math.random() * 60}deg) brightness(${
                0.8 + Math.random() * 0.4
              })`,
            }}
          />
        </div>
      ))}

      {/* Sparkles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute animate-ping opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            fontSize: `${0.8 + Math.random() * 1.2}rem`,
          }}
        >
          <Sparkles className="text-purple-400 w-6 h-6" />
        </div>
      ))}
    </div>
  );
}
