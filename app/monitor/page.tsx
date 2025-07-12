"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MapPin, Eye, Lock } from "lucide-react";

interface LocationData {
  lat: number;
  lng: number;
  timestamp: number;
  distance?: number;
}

interface MissionData {
  mission: string;
  progress: number;
  timestamp: number;
}

export default function MonitorPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Monitoring data
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null
  );
  const [missionProgress, setMissionProgress] = useState<MissionData | null>(
    null
  );
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [canAllowAdvance, setCanAllowAdvance] = useState(false);

  // Authentication
  const handleLogin = () => {
    const correctPassword = process.env.NEXT_PUBLIC_MONITOR_PASSWORD || "1234";

    if (password === correctPassword) {
      setIsAuthenticated(true);
      setPasswordError("");
      startMonitoring();
    } else {
      setPasswordError("Contraseña incorrecta");
    }
  };

  // HTTP polling for monitoring
  const fetchMonitorData = async () => {
    try {
      const response = await fetch("/api/socket");
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus("connected");

        if (data.currentMission) {
          setMissionProgress(data.currentMission);

          // Check if we should allow advance (when she's at the finding question)
          if (
            data.currentMission.mission === "final" &&
            (data.currentMission.progress === 50 ||
              data.currentMission.progress === 75)
          ) {
            setCanAllowAdvance(true);
          }
        }

        if (data.currentLocation) {
          setCurrentLocation(data.currentLocation);
        }
      } else {
        setConnectionStatus("disconnected");
      }
    } catch (error) {
      console.error("Error fetching monitor data:", error);
      setConnectionStatus("disconnected");
    }
  };

  // Start monitoring with polling
  const startMonitoring = () => {
    fetchMonitorData(); // Initial fetch
    const interval = setInterval(fetchMonitorData, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  };

  // Allow advance from admin
  const allowAdvance = async () => {
    try {
      await fetch("/api/socket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "admin-allow-advance",
          data: { timestamp: Date.now() },
        }),
      });
      setCanAllowAdvance(false);
    } catch (error) {
      console.error("Error allowing advance:", error);
    }
  };

  // Start monitoring when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const cleanup = startMonitoring();
      return cleanup;
    }
  }, [isAuthenticated]);

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-purple-200 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-purple-800 flex items-center justify-center gap-2">
              <Lock className="text-purple-500" />
              Monitor de Amor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-purple-600 mb-4">
                Ingresa la contraseña para acceder al panel de monitoreo
              </p>
            </div>

            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                className="border-purple-200 focus:border-purple-400"
              />

              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}

              <Button
                onClick={handleLogin}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              >
                Acceder
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Monitor dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-purple-200 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-purple-800 flex items-center justify-center gap-2">
            <Eye className="text-purple-500" />
            Monitor de Amor en Tiempo Real
            <Heart className="text-pink-500" />
          </h1>
          <p className="text-purple-600">
            Monitorea el progreso de Geraldine en la aventura romántica
          </p>
        </div>

        {/* Connection Status */}
        <div className="text-center">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
              connectionStatus === "connected"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === "connected" ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            {connectionStatus === "connected" ? "Conectado" : "Desconectado"}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Mission Progress */}
          <Card className="border-purple-200 shadow-lg">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-purple-800 flex items-center gap-2">
                <Heart className="text-pink-500" />
                Progreso de la Misión
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {missionProgress ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-800">
                      {missionProgress.mission.toUpperCase()}
                    </div>
                    <div className="text-lg text-purple-600">
                      {missionProgress.progress}% completado
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${missionProgress.progress}%` }}
                    ></div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Última actualización:{" "}
                    {new Date(missionProgress.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <Heart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Esperando datos de la misión...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Tracking */}
          <Card className="border-purple-200 shadow-lg">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-purple-800 flex items-center gap-2">
                <MapPin className="text-blue-500" />
                Ubicación Actual
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {currentLocation ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Latitud</p>
                      <p className="font-mono text-sm">
                        {currentLocation.lat.toFixed(6)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Longitud</p>
                      <p className="font-mono text-sm">
                        {currentLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>

                  {currentLocation.distance && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {currentLocation.distance}m
                      </div>
                      <div className="text-sm text-gray-500">
                        Distancia al punto de encuentro
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    Última actualización:{" "}
                    {new Date(currentLocation.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Esperando datos de ubicación...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Admin Controls */}
        {canAllowAdvance && (
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-800 flex items-center gap-2">
                🎯 Control de Administrador
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {missionProgress?.progress === 75 ? (
                  <>
                    <div className="text-lg text-green-700 font-bold">
                      🎉 ¡Geraldine dice que te encontró!
                    </div>
                    <p className="text-green-600">
                      Ella respondió &ldquo;SÍ&rdquo; a &ldquo;¿Me
                      encontraste?&rdquo;. Si realmente está contigo, presiona
                      el botón para permitir que continúe con la propuesta.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-lg text-orange-700 font-bold">
                      🔍 Geraldine está buscándote
                    </div>
                    <p className="text-orange-600">
                      Ella respondió &ldquo;NO&rdquo; a &ldquo;¿Me
                      encontraste?&rdquo;. Cuando la veas físicamente, presiona
                      el botón para permitir que continúe.
                    </p>
                  </>
                )}
                <Button
                  onClick={allowAdvance}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg"
                >
                  ✅ Permitir Avanzar (Estoy con ella)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
