/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  Star,
  MapPin,
  Navigation,
  ExternalLink,
} from "lucide-react";

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

  // Final mission states
  const [finalMessageIndex, setFinalMessageIndex] = useState(0);
  const [showFinalQuestion, setShowFinalQuestion] = useState(false);
  const [finalAnswer, setFinalAnswer] = useState<
    "accepted" | "rejected" | null
  >(null);
  const [showFinalResponse, setShowFinalResponse] = useState(false);

  // Target location coordinates (replace with your actual location)
  const targetLocation = {
    // 18.458955973903947, -69.90626174211894  = playa de guibia
    // 18.51351426883857, -69.86817871061152 = casa
    lat: 18.51351426883857, // Replace with your actual latitude
    lng: -69.86817871061152, // Replace with your actual longitude
    name: "Nuestro lugar especial ✨", // Replace with the actual place name
    description: "Donde las estrellas brillan más para nosotros 🌟",
  };

  const missions = [
    { id: "welcome", title: "Bienvenida", progress: 0 },
    { id: "map", title: "El Destino de conexión", progress: 20 },
    { id: "memory", title: "Nuestros Momentos", progress: 40 },
    { id: "secret", title: "Mensaje Secreto", progress: 60 },
    { id: "quiz", title: "Amor Nivel Experto", progress: 80 },
    { id: "gift", title: "Regalo de amor", progress: 90 },
    { id: "final", title: "Misión Final", progress: 100 },
  ];

  const finalMessages = [
    "¡Misión Final!",
    "👀 Mira a tu alrededor...",
    "Hemos llegado al final de nuestra aventura",
    "Cada paso, cada risa, cada momento...",
    "Todo nos ha llevado hasta aquí",
    "En este lugar especial, bajo las estrellas...",
    "❤️ ¿Aceptarías ser mi novia?",
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
    if (currentMission === "final") {
      const timer = setTimeout(() => {
        if (finalMessageIndex < finalMessages.length - 1) {
          setFinalMessageIndex(finalMessageIndex + 1);
        } else {
          setShowFinalQuestion(true);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentMission, finalMessageIndex]);

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
            background: linear-gradient(45deg, #ec4899, #f43f5e);
            width: 40px;
            height: 40px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(236, 72, 153, 0.4);
            animation: heartbeat 1.5s ease-in-out infinite;
          ">
            <span style="
              color: white;
              font-size: 16px;
              transform: rotate(45deg);
              font-weight: bold;
            ">💖</span>
          </div>
          <style>
            @keyframes heartbeat {
              0%, 100% { transform: rotate(-45deg) scale(1); }
              50% { transform: rotate(-45deg) scale(1.1); }
            }
          </style>
        `,
        className: "custom-heart-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 35],
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
        <div style="text-align: center; padding: 8px;">
          <div style="font-size: 20px; margin-bottom: 8px;">✨</div>
          <div style="font-weight: bold; color: #be185d; margin-bottom: 4px;">
            ${targetLocation.name}
          </div>
          <div style="color: #ec4899; font-size: 14px;">
            ${targetLocation.description}
          </div>
        </div>
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
              background: #3b82f6;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
            "></div>
          `,
          className: "user-location-marker",
          iconSize: [20, 20],
          iconAnchor: [10, 10],
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
          color: "#ec4899",
          weight: 3,
          opacity: 0.7,
          dashArray: "10, 10",
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
          background: linear-gradient(135deg, #fdf2f8, #fce7f3);
          border: 2px solid #f9a8d4;
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(236, 72, 153, 0.2);
        }
        .custom-popup .leaflet-popup-tip {
          background: #fdf2f8;
          border: 2px solid #f9a8d4;
        }
        .leaflet-container {
          border-radius: 12px;
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
            background: #3b82f6;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
            animation: pulse 2s infinite;
          "></div>
          <style>
            @keyframes pulse {
              0% { box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4); }
              50% { box-shadow: 0 2px 8px rgba(59, 130, 246, 0.8), 0 0 0 10px rgba(59, 130, 246, 0.1); }
              100% { box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4); }
            }
          </style>
        `,
        className: "user-location-marker",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
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
        color: "#ec4899",
        weight: 3,
        opacity: 0.7,
        dashArray: "10, 10",
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
      if (missionData) setProgress(missionData.progress);
    }, 1000);
  };

  const handleFinalAnswer = (answer: "accepted" | "rejected") => {
    setFinalAnswer(answer);
    setShowFinalResponse(true);
    triggerConfetti();
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
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        setUserLocation({ lat: userLat, lng: userLng });

        const distance = calculateDistance(
          userLat,
          userLng,
          targetLocation.lat,
          targetLocation.lng
        );

        setDistanceToTarget(Math.round(distance));
        setIsCheckingLocation(false);

        // Allow access if within 100 meters of target location
        if (distance <= 100) {
          setTimeout(() => {
            nextMission("memory");
          }, 2000);
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
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-md">
          <div className="space-y-4">
            <div className="text-6xl animate-bounce">💖</div>
            <h1 className="text-4xl font-bold text-pink-800 leading-tight">
              ¡Bienvenida a nuestra pequeña aventura del amor!
            </h1>
            <p className="text-lg text-pink-600">
              Cada misión sera una experiencia. ¿Te animas? ✨
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center space-x-2">
              {["💕", "🌸", "✨", "🦋", "💫"].map((emoji, i) => (
                <span
                  key={i}
                  className="text-2xl animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  {emoji}
                </span>
              ))}
            </div>

            <Button
              onClick={() => nextMission("map")}
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 text-lg rounded-full shadow-lg transform hover:scale-105 transition-all"
            >
              Empezar la aventura 💝
            </Button>
          </div>
        </div>

        {showConfetti && <Confetti />}
      </div>
    );
  }

  // Memory Mission
  if (currentMission === "memory") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <MissionHeader
            title="Misión 1: Nuestros Momentos"
            progress={progress}
          />

          <Card className="mt-8 border-pink-200 shadow-xl">
            <CardHeader className="text-center bg-pink-50">
              <CardTitle className="text-2xl text-pink-800 flex items-center justify-center gap-2">
                <Heart className="text-pink-500" />
                Memoria de nuestra primera cita
                <Heart className="text-pink-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="text-center">
                <div className="text-4xl mb-4">📸💕</div>
                <p className="text-lg text-pink-700 mb-6">
                  ¿Recuerdas qué hicimos en nuestra primera cita a solas?{" "}
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "Fuimos al cine 🎬",
                  "Fuimos a la discoteca 💃",
                  "Fuimos a tomar café y comimos algo rico 🍰",
                  "Fuimos a a hablar frente al mar mientras bebiamos un FourLoko🌊",
                ].map((option, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full p-4 border-pink-200 hover:bg-pink-50 hover:border-pink-300 whitespace-normal break-words"
                    onClick={() => {
                      setAnswers({ ...answers, memory: option });
                      nextMission("secret");
                    }}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {showConfetti && <Confetti />}
      </div>
    );
  }

  // Secret Message Mission
  if (currentMission === "secret") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <MissionHeader
            title="Misión 2: Nuestros Momentos Especiales"
            progress={progress}
          />

          <Card className="mt-8 border-pink-200 shadow-xl">
            <CardHeader className="text-center bg-pink-50">
              <CardTitle className="text-2xl text-pink-800 flex items-center justify-center gap-2">
                <Heart className="text-pink-500" />
                Galería de Recuerdos
                <Heart className="text-pink-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="text-center space-y-4">
                <div className="text-4xl mb-4">📸💕</div>
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-2xl border-2 border-pink-200">
                  <p className="text-xl text-pink-700 font-medium leading-relaxed">
                    Momentos que me han hecho conectar contigo y nunca quiero olvidar
                  </p>
                  <p className="text-pink-600 mt-2 italic">
                    Hay más pero no suelo tirar fotos hehehe 😅
                  </p>
                </div>
              </div>

              {/* Memories Gallery */}
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { src: "/memories/1.jpg", alt: "Momento especial 1" },
                  { src: "/memories/2.jpg", alt: "Momento especial 2" },
                  { src: "/memories/3.jpg", alt: "Momento especial 3" },
                ].map((image, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-500 hover:shadow-2xl"
                  >
                    <div className="aspect-square relative">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      {/* Overlay with heart effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-pink-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute bottom-4 left-4 right-4 text-center">
                          <div className="text-white text-2xl animate-pulse">💖</div>
                          <p className="text-white text-sm font-medium">
                            Recuerdo #{index + 1}
                          </p>
                        </div>
                      </div>
                      
                      {/* Floating hearts animation */}
                      <div className="absolute inset-0 pointer-events-none">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute text-pink-400 opacity-0 group-hover:opacity-100 animate-bounce"
                            style={{
                              left: `${20 + i * 30}%`,
                              top: `${20 + i * 10}%`,
                              animationDelay: `${i * 0.3}s`,
                              animationDuration: "2s",
                            }}
                          >
                            💕
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Memory Captions */}
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                {[
                  "Cada sonrisa tuya ilumina mi día ✨",
                  "Momentos que atesoro en mi corazón 💝",
                  "Contigo todo es más hermoso 🌸",
                ].map((caption, index) => (
                  <div
                    key={index}
                    className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-pink-200"
                  >
                    <p className="text-pink-700 font-medium">{caption}</p>
                  </div>
                ))}
              </div>

              {/* Continue Button */}
              <div className="text-center pt-6">
                <Button
                  onClick={() => nextMission("quiz")}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3 text-lg rounded-full shadow-lg transform hover:scale-105 transition-all"
                >
                  Continuar con la aventura 💖
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {showConfetti && <Confetti />}
      </div>
    );
  }

  // Quiz Mission
  if (currentMission === "quiz") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <MissionHeader
            title="Misión 3: Amor Nivel Experto"
            progress={progress}
          />

          <Card className="mt-8 border-pink-200 shadow-xl">
            <CardHeader className="text-center bg-pink-50">
              <CardTitle className="text-2xl text-pink-800 flex items-center justify-center gap-2">
                <Star className="text-pink-500" />
                ¿Me Conoces Bien?
                <Star className="text-pink-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🧠💕</div>
                <p className="text-lg text-pink-700 mb-6">
                  Demuestra qué tan bien me conoces respondiendo estas preguntas
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-pink-700 font-medium mb-2">
                    ¿Cuál es mi color favorito? 🎨
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Azul 💙", "Rosa 💗", "Verde 💚", "Morado 💜"].map(
                      (color) => (
                        <Button
                          key={color}
                          variant={
                            answers.quiz.color === color ? "default" : "outline"
                          }
                          onClick={() =>
                            setAnswers({
                              ...answers,
                              quiz: { ...answers.quiz, color },
                            })
                          }
                          className={
                            answers.quiz.color === color
                              ? "bg-pink-500 text-white"
                              : "border-pink-200 hover:bg-pink-50"
                          }
                        >
                          {color}
                        </Button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-pink-700 font-medium mb-2">
                    ¿Mi comida favorita? 🍕
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Pizza 🍕", "Sushi 🍣", "Tacos 🌮", "Pasta 🍝"].map(
                      (food) => (
                        <Button
                          key={food}
                          variant={
                            answers.quiz.food === food ? "default" : "outline"
                          }
                          onClick={() =>
                            setAnswers({
                              ...answers,
                              quiz: { ...answers.quiz, food },
                            })
                          }
                          className={
                            answers.quiz.food === food
                              ? "bg-pink-500 text-white"
                              : "border-pink-200 hover:bg-pink-50"
                          }
                        >
                          {food}
                        </Button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-pink-700 font-medium mb-2">
                    ¿Mi emoji más usado? 😊
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["😂", "❤️", "😊", "🤔"].map((emoji) => (
                      <Button
                        key={emoji}
                        variant={
                          answers.quiz.emoji === emoji ? "default" : "outline"
                        }
                        onClick={() =>
                          setAnswers({
                            ...answers,
                            quiz: { ...answers.quiz, emoji },
                          })
                        }
                        className={
                          answers.quiz.emoji === emoji
                            ? "bg-pink-500 text-white text-2xl"
                            : "border-pink-200 hover:bg-pink-50 text-2xl"
                        }
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => nextMission("map")}
                  disabled={
                    !answers.quiz.color ||
                    !answers.quiz.food ||
                    !answers.quiz.emoji
                  }
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3"
                >
                  ¡Continuar la aventura! 🚀
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {showConfetti && <Confetti />}
      </div>
    );
  }

  // Map Mission
  if (currentMission === "map") {
    const isAtLocation = distanceToTarget !== null && distanceToTarget <= 100;
    const isClose = distanceToTarget !== null && distanceToTarget <= 500;

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 p-4">
        <div className="max-w-6xl mx-auto pt-8">
          <MissionHeader
            title="Misión 1: El Destino de conexión"
            progress={progress}
          />

          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            {/* Instructions Card */}
            <Card className="border-pink-200 shadow-xl">
              <CardHeader className="text-center bg-pink-50">
                <CardTitle className="text-2xl text-pink-800 flex items-center justify-center gap-2">
                  <MapPin className="text-pink-500" />
                  Encuentra el Lugar Especial
                  <MapPin className="text-pink-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">🗺️✨</div>
                  <p className="text-lg text-pink-700 mb-4">
                    Es hora de encontrar nuestro lugar especial...
                  </p>
                </div>

                <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-lg border-2 border-pink-200">
                  <div className="text-center space-y-3">
                    <div className="text-2xl">🌟</div>
                    <p className="text-lg font-medium text-pink-800">
                      &ldquo;Donde las estrellas brillan más para
                      nosotros&rdquo;
                    </p>
                    <p className="text-pink-600 text-sm">
                      Ese lugar donde compartimos el momento más mágico bajo el
                      cielo nocturno...
                    </p>
                  </div>
                </div>

                {/* Location Status */}
                {distanceToTarget !== null && (
                  <div
                    className={`p-4 rounded-lg text-center ${
                      isAtLocation
                        ? "bg-green-50 border-2 border-green-200"
                        : isClose
                        ? "bg-yellow-50 border-2 border-yellow-200"
                        : "bg-red-50 border-2 border-red-200"
                    }`}
                  >
                    {isAtLocation ? (
                      <div className="space-y-2">
                        <div className="text-2xl">🎉</div>
                        <p className="text-green-700 font-medium">
                          ¡Perfecto! Estás en el lugar correcto
                        </p>
                        <p className="text-green-600">
                          Preparando la misión final... ✨
                        </p>
                      </div>
                    ) : isClose ? (
                      <div className="space-y-2">
                        <div className="text-2xl">🚶‍♀️</div>
                        <p className="text-yellow-700 font-medium">
                          ¡Muy cerca! Estás a {distanceToTarget}m
                        </p>
                        <p className="text-yellow-600">
                          Sigue buscando, casi llegas 💪
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-2xl">🧭</div>
                        <p className="text-red-700 font-medium">
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
                  <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg text-center">
                    <div className="text-2xl mb-2">😔</div>
                    <p className="text-red-700">{locationError}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={checkLocation}
                    disabled={isCheckingLocation || isAtLocation}
                    className={`w-full py-3 text-lg ${
                      isAtLocation
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                    } text-white`}
                  >
                    {isCheckingLocation ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Verificando ubicación...
                      </span>
                    ) : isAtLocation ? (
                      "¡Acceso concedido! 🎉"
                    ) : (
                      "📍 Verificar mi ubicación"
                    )}
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={openInGoogleMaps}
                      variant="outline"
                      className="py-3 border-pink-200 text-pink-600 hover:bg-pink-50"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Google Maps
                    </Button>
                    <Button
                      onClick={openInAppleMaps}
                      variant="outline"
                      className="py-3 border-pink-200 text-pink-600 hover:bg-pink-50"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Apple Maps
                    </Button>
                  </div>
                </div>

                <div className="text-center text-sm text-pink-600 space-y-1">
                  <p>Debes estar físicamente en el lugar para continuar 🥰</p>
                  <p className="text-xs">
                    Necesitas estar dentro de 100 metros del lugar especial
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Map Card */}
            <Card className="border-pink-200 shadow-xl">
              <CardHeader className="text-center bg-pink-50">
                <CardTitle className="text-xl text-pink-800 flex items-center justify-center gap-2">
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
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-pink-200">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-pink-700">Tu ubicación</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                            <span className="font-medium text-pink-800">
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
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-rose-100 to-pink-300 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-md">
          {!showFinalResponse ? (
            <>
              <div className="space-y-6">
                <div className="text-8xl animate-pulse">💖</div>

                {/* Progressive Messages */}
                <div className="space-y-4">
                  {finalMessages
                    .slice(0, finalMessageIndex + 1)
                    .map((message, index) => (
                      <div
                        key={index}
                        className={`text-2xl font-bold text-pink-800 transition-all duration-1000 ${
                          index === finalMessageIndex ? "animate-pulse" : ""
                        }`}
                      >
                        {message}
                      </div>
                    ))}
                </div>

                {/* Final Question with Buttons */}
                {showFinalQuestion && (
                  <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border-2 border-pink-300 shadow-xl space-y-6">
                    <div className="flex justify-center space-x-2">
                      {["💕", "🌸", "✨", "🦋", "💫", "🌟", "💖"].map(
                        (emoji, i) => (
                          <span
                            key={i}
                            className="text-2xl animate-bounce"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          >
                            {emoji}
                          </span>
                        )
                      )}
                    </div>

                    <div className="space-y-4">
                      <p className="text-3xl font-bold text-pink-800">
                        ¿Aceptarías ser mi novia?
                      </p>

                      <div className="flex gap-4 justify-center">
                        <Button
                          onClick={() => handleFinalAnswer("accepted")}
                          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg rounded-full shadow-lg transform hover:scale-105 transition-all"
                        >
                          ¡Sí! 💖
                        </Button>

                        <Button
                          onClick={() => handleFinalAnswer("rejected")}
                          className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 text-lg rounded-full shadow-lg transform hover:scale-105 transition-all"
                        >
                          No 😔
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="text-pink-600 text-lg">
                  La aventura más hermosa apenas comienza... 💕
                </div>
              </div>
            </>
          ) : (
            /* Final Response */
            <div className="space-y-6">
              <div className="text-8xl animate-pulse">
                {finalAnswer === "accepted" ? "💖" : "💔"}
              </div>

              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border-2 border-pink-300 shadow-xl">
                {finalAnswer === "accepted" ? (
                  <div className="space-y-4">
                    <p className="text-3xl font-bold text-green-700 mb-4">
                      ¡Gracias por decir que sí! 💖
                    </p>
                    <p className="text-xl text-pink-700">
                      Gracias por brindarme la oportunidad de pasar más tiempo a
                      tu lado. Te prometo hacer cada día especial y lleno de
                      amor. ¡Te quiero mucho! 💕
                    </p>
                    <div className="text-4xl animate-bounce">💋</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-3xl font-bold text-red-700 mb-4">
                      Entiendo tu decisión 💔
                    </p>
                    <p className="text-xl text-pink-700">
                      Igualmente fue un placer haber compartido contigo todo
                      este tiempo. Gracias por todos los momentos hermosos que
                      hemos vivido juntos. Te deseo lo mejor en tu vida. 🌸
                    </p>
                    <div className="text-4xl">🤗</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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
}: {
  title: string;
  progress: number;
}) {
  return (
    <div className="text-center space-y-4">
      <h1 className="text-3xl font-bold text-pink-800">{title}</h1>
      <div className="max-w-md mx-auto">
        <Progress
          value={progress}
          className="h-3"
        />
        <p className="text-pink-600 mt-2">{progress}% completado</p>
      </div>
    </div>
  );
}

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-ping"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random()}s`,
          }}
        >
          {["💖", "💕", "🌸", "✨", "🦋"][Math.floor(Math.random() * 5)]}
        </div>
      ))}
    </div>
  );
}

function FloatingHearts() {
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        >
          💖
        </div>
      ))}
    </div>
  );
}
