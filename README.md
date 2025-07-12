# 💖 Love Adventure App

Una aplicación web interactiva para crear una experiencia romántica única de pedida de noviazgo a través de múltiples misiones progresivas con seguimiento GPS y monitoreo en tiempo real.

## 🌟 Características Principales

### 🎯 Sistema de Misiones Progresivas

- **Misión 1**: Pregunta sobre la primera cita con validación de respuesta correcta
- **Misión 2**: Galería de fotos con cartas interactivas que se voltean (flip cards)
- **Misión 3**: Selección de promesas de amor personalizables
- **Misión 4**: Localización GPS con verificación de proximidad al lugar especial
- **Misión Final**: Secuencia interactiva de propuesta con tap para avanzar

### 🗺️ Funcionalidades de Localización

- Integración con GPS para verificar ubicación del usuario
- Mapas interactivos con Leaflet
- Cálculo de distancia en tiempo real
- Verificación de proximidad (50 metros del objetivo)
- Integración con Google Maps y Apple Maps

### 📱 Monitoreo en Tiempo Real

- Dashboard de administrador en `/monitor`
- Seguimiento en vivo de la ubicación del usuario
- Progreso de misiones en tiempo real
- Sistema de aprobación manual para momentos clave
- Comunicación bidireccional con WebSocket

### 🎨 Experiencia de Usuario

- Diseño responsive optimizado para móviles
- Animaciones y efectos visuales (confetti, corazones flotantes)
- Interfaz intuitiva con retroalimentación visual
- Prevención de respuestas no deseadas con modales personalizados

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Git

### Instalación

1. **Clona el repositorio:**

```bash
git clone https://github.com/tu-usuario/love-adventure-app.git
cd love-adventure-app
```

2. **Instala las dependencias:**

```bash
npm install
# o
yarn install
```

3. **Configura las variables de entorno:**
   Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Contraseña para acceder al dashboard de monitoreo
MONITOR_PASSWORD=tu_contraseña_segura

# Puerto para el servidor WebSocket (opcional, por defecto 3001)
```

4. **Agrega las imágenes de recuerdos:**
   Crea la carpeta `public/memories/` y agrega tus fotos:

```
public/
└── memories/
    ├── 1.jpg
    ├── 2.jpg
    └── 3.jpg
```

**⚠️ IMPORTANTE**: Debes agregar exactamente 3 imágenes con estos nombres, o modificar el código en `app/page.tsx` líneas 350-370 para usar tus propios nombres de archivo.

5. **Inicia el servidor de desarrollo:**

```bash
npm run dev
# o
yarn dev
```

6. **Inicia el servidor de desarrollo:**

```bash
npm run dev
# o
yarn dev
```

✅ **SIMPLIFICADO**: El WebSocket ahora está integrado en Next.js como una API route. Ya no necesitas un servidor separado.

La aplicación estará disponible en `http://localhost:3000` y el dashboard de monitoreo en `http://localhost:3000/monitor`.

## 🎯 Personalización

### 📍 Configurar Ubicación de Destino

En `app/page.tsx`, modifica las coordenadas del lugar especial (líneas 60-66):

```typescript
const targetLocation = {
  lat: 18.467997618938792, // Latitud de tu lugar especial
  lng: -69.8481997872944, // Longitud de tu lugar especial
  name: "Nuestro lugar especial ✨",
  description: "Donde las estrellas brillan más para nosotros 🌟",
};
```

### 💕 Personalizar Contenido

#### Misión 1 - Primera Cita

Modifica las opciones y respuesta correcta (líneas 550-570):

```typescript
const correctAnswer = "Tu respuesta correcta aquí";

// Opciones de respuesta
const options = [
  "Opción 1",
  "Opción 2",
  "Opción 3",
  "Tu respuesta correcta aquí",
];
```

#### Misión 2 - Galería de Fotos

Personaliza las descripciones de las fotos (líneas 350-370):

```typescript
const cardData = [
  {
    src: "/memories/1.jpg",
    alt: "Momento especial 1",
    caption: "Tu mensaje personalizado ✨",
    title: "Primer Recuerdo",
  },
  // ... más fotos
];
```

#### Misión 3 - Promesas de Amor

Modifica las promesas disponibles (líneas 700-750):

```typescript
const lovePromises = [
  {
    id: "adventures",
    text: "Tu promesa personalizada",
    emoji: "🌟",
    description: "Descripción corta",
  },
  // ... más promesas
];
```

#### Misión Final - Propuesta

Personaliza los mensajes finales (líneas 80-95):

```typescript
const finalMessages = [
  "¡Misión Final!",
  "Tu mensaje personalizado aquí",
  "Más mensajes románticos...",
  "¿Me encontraste?",
  // ... resto de mensajes
];
```

### 🎨 Personalizar Diseño

Los colores y estilos están centralizados usando Tailwind CSS. Los principales colores usados son:

- `pink-*`: Colores primarios del tema
- `rose-*`: Colores secundarios
- `green-*`: Para estados de éxito
- `red-*`: Para errores

## 🔧 Configuración Avanzada

### Modo de Prueba

Para probar la aplicación sin estar físicamente en el lugar, hay un modo de prueba habilitado en `app/page.tsx` (líneas 450-460). Para producción, comenta este bloque y descomenta las líneas reales de geolocalización.

### Ajustar Distancia de Proximidad

Modifica la distancia requerida para completar la Misión 4 (línea 480):

```typescript
if (distance <= 50) { // Cambiar 50 por la distancia deseada en metros
```

### Personalizar Autenticación del Monitor

La contraseña por defecto es "1234". Cámbiala en `.env.local` o en `app/monitor/page.tsx` (línea 20).

## 🌐 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el dashboard de Vercel
3. Despliega automáticamente

### Netlify

1. Conecta tu repositorio a Netlify
2. Configura las variables de entorno
3. Comando de build: `npm run build`
4. Directorio de publicación: `out` (si usas export estático)

### Servidor Propio

```bash
npm run build
npm start
```

**⚠️ Nota importante**: Para el servidor WebSocket en producción, necesitarás configurar un servidor separado o usar servicios como Socket.IO en la nube.

## 📱 Uso de la Aplicación

### Para el Usuario (Quien Recibe la Propuesta)

1. Abre la aplicación en el móvil
2. Completa cada misión en orden
3. Sigue las instrucciones GPS para llegar al lugar especial
4. Disfruta de la experiencia interactiva

### Para el Administrador (Quien Propone)

1. Accede a `/monitor` con la contraseña configurada
2. Monitorea la ubicación y progreso en tiempo real
3. Usa los controles de administrador cuando sea necesario
4. Observa el momento especial en vivo

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **Mapas**: Leaflet, OpenStreetMap
- **Comunicación**: Socket.IO
- **Geolocalización**: Web Geolocation API
- **Deployment**: Vercel-ready

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 💡 Ideas para Futuras Mejoras

- [ ] Soporte para múltiples idiomas
- [ ] Temas personalizables
- [ ] Integración con redes sociales
- [ ] Sistema de notificaciones push
- [ ] Modo offline
- [ ] Galería de fotos expandible
- [ ] Efectos de sonido
- [ ] Integración con calendario
- [ ] Sistema de recordatorios
- [ ] Exportar experiencia como PDF/video

## 🆘 Solución de Problemas

### La geolocalización no funciona

- Verifica que el navegador tenga permisos de ubicación
- Asegúrate de que la aplicación se ejecute en HTTPS en producción
- Revisa que el modo de prueba esté deshabilitado

### El WebSocket no se conecta

- Verifica que el servidor WebSocket esté ejecutándose
- Revisa la configuración del puerto en `.env.local`
- Asegúrate de que no haya conflictos de puerto

### Las imágenes no se cargan

- Verifica que las imágenes estén en `public/memories/`
- Asegúrate de que los nombres sean exactamente `1.jpg`, `2.jpg`, `3.jpg`
- Revisa que las imágenes tengan los permisos correctos

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:

- Abre un issue en GitHub
- Revisa la documentación
- Verifica los logs de la consola del navegador

---

Hecho con 💖 para crear momentos especiales e inolvidables.
