# 🚀 Configuración Rápida - Love Adventure App

Esta guía te ayudará a configurar el proyecto rápidamente para uso personal.

## ⚡ Instalación Rápida

### 1. Clona y Configura

```bash
# Clona el repositorio
git clone https://github.com/tu-usuario/love-adventure-app.git
cd love-adventure-app

# Instala dependencias
npm install

# Configura variables de entorno
cp env.example .env.local
```

### 2. Agrega tus Imágenes

```bash
# Crea la carpeta de memorias
mkdir -p public/memories

# Agrega exactamente 3 imágenes con estos nombres:
# public/memories/1.jpg
# public/memories/2.jpg
# public/memories/3.jpg
```

**⚠️ IMPORTANTE**: Las imágenes deben tener exactamente estos nombres, o modifica el código en `app/page.tsx` líneas 350-370.

### 3. Personaliza tu Aventura

#### Ubicación GPS (OBLIGATORIO)

Edita `app/page.tsx` líneas 60-66:

```typescript
const targetLocation = {
  lat: 18.467997618938792, // ← Cambia por tu latitud
  lng: -69.8481997872944, // ← Cambia por tu longitud
  name: "Nuestro lugar especial ✨",
  description: "Donde las estrellas brillan más para nosotros 🌟",
};
```

#### Pregunta de la Primera Cita

Edita `app/page.tsx` líneas 550-570:

```typescript
const correctAnswer = "Tu respuesta correcta aquí";

// Opciones de respuesta
const options = [
  "Opción incorrecta 1",
  "Opción incorrecta 2",
  "Opción incorrecta 3",
  "Tu respuesta correcta aquí", // ← Esta debe coincidir con correctAnswer
];
```

#### Mensajes Finales

Edita `app/page.tsx` líneas 80-95:

```typescript
const finalMessages = [
  "¡Misión Final!",
  "👀 Mira a tu alrededor y encuentrame",
  "Tu mensaje personalizado aquí...",
  "¿Me encontraste?",
  "Más mensajes románticos...",
  "Te amo [NOMBRE DE TU PAREJA]", // ← Personaliza aquí
];
```

### 4. Configura la Contraseña del Monitor

Edita `.env.local`:

```env
MONITOR_PASSWORD=tu_contraseña_segura_aqui
```

### 5. Inicia la Aplicación

```bash
# Solo necesitas un terminal ahora
npm run dev
```

✅ **SIMPLIFICADO**: El WebSocket ahora está integrado en Next.js. Solo necesitas un comando.

La aplicación estará en: `http://localhost:3000`
El monitor estará en: `http://localhost:3000/monitor`

## 🧪 Modo de Prueba

Por defecto, la aplicación está en modo de prueba (simula estar cerca del lugar).

Para **desactivar el modo de prueba** (PRODUCCIÓN):

1. Edita `app/page.tsx` líneas 450-460
2. **Comenta** el bloque de código de prueba:

```typescript
// 🔧 TESTING MODE - REMOVE THIS BLOCK FOR PRODUCTION 🔧
// const simulatedLat = targetLocation.lat + 0.0004;
// const simulatedLng = targetLocation.lng + 0.0002;
// const userLat = simulatedLat;
// const userLng = simulatedLng;
// 🔧 END TESTING MODE 🔧
```

3. **Descomenta** las líneas reales:

```typescript
const userLat = position.coords.latitude;
const userLng = position.coords.longitude;
```

## 📋 Checklist de Configuración

- [ ] Repositorio clonado e instalado
- [ ] 3 imágenes agregadas en `public/memories/`
- [ ] Coordenadas GPS actualizadas
- [ ] Pregunta de primera cita personalizada
- [ ] Mensajes finales personalizados
- [ ] Contraseña del monitor configurada
- [ ] Aplicación iniciada correctamente
- [ ] Monitor accesible con contraseña
- [ ] Modo de prueba desactivado (para uso real)

## 🚨 Solución de Problemas Rápida

### Las imágenes no aparecen

- Verifica que estén en `public/memories/`
- Nombres exactos: `1.jpg`, `2.jpg`, `3.jpg`
- Formatos soportados: `.jpg`, `.jpeg`, `.png`

### El WebSocket no conecta

- ✅ **SOLUCIONADO**: El WebSocket ahora está integrado en Next.js
- Solo necesitas ejecutar `npm run dev`
- Si hay problemas, revisa la consola del navegador
- **Sin WebSocket NO se puede completar la misión final**

### La geolocalización no funciona

- Usa HTTPS en producción
- Permite permisos de ubicación en el navegador
- Verifica que el modo de prueba esté configurado correctamente

## 💡 Consejos Importantes

1. **Prueba todo localmente** antes del día especial
2. **Desactiva el modo de prueba** para uso real
3. **Usa HTTPS** en producción para geolocalización
4. **Ten un plan B** por si hay problemas técnicos
5. **Practica el flujo completo** antes del evento

## 📱 Día del Evento

1. Asegúrate de que ambos dispositivos tengan buena conexión
2. Abre el monitor en tu dispositivo
3. Comparte el link principal con tu pareja
4. ¡Disfruta del momento especial! 💖

---

¡Tu aventura de amor está lista! 🎉💕
