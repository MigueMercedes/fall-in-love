import { NextRequest, NextResponse } from "next/server";

// Define proper types
interface MissionData {
  mission: string;
  progress: number;
  timestamp: number;
  socketId: string;
}

interface LocationData {
  lat: number;
  lng: number;
  distance: number;
  timestamp: number;
  socketId: string;
}

// Simple state management without WebSocket for now
let currentMissionData: MissionData | null = null;
let currentLocationData: LocationData | null = null;
let allowAdvance = false;

export async function GET() {
  return NextResponse.json({
    status: "running",
    message: "WebSocket endpoint active",
    currentMission: currentMissionData,
    currentLocation: currentLocationData,
    allowAdvance: allowAdvance,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, data } = body;

  switch (type) {
    case "mission-progress":
      currentMissionData = {
        ...data,
        socketId: "http-client",
        timestamp: Date.now(),
      };
      console.log(`🎯 Progreso de misión: ${data.mission} (${data.progress}%)`);
      break;

    case "location-update":
      currentLocationData = {
        ...data,
        socketId: "http-client",
        timestamp: Date.now(),
      };
      console.log(
        `📍 Ubicación actualizada: ${data.lat}, ${data.lng} (${data.distance}m)`
      );
      break;

    case "admin-allow-advance":
      allowAdvance = true;
      console.log("👨‍💼 Admin permitió avanzar");
      break;

    case "check-advance":
      const canAdvance = allowAdvance;
      allowAdvance = false; // Reset after check
      return NextResponse.json({ allowAdvance: canAdvance });

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
