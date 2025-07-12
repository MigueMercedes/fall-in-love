# 🚀 Guía de Despliegue - Love Adventure App

Esta guía te ayudará a desplegar la aplicación Love Adventure App en diferentes plataformas y entornos.

## 📋 Preparación para Despliegue

### ✅ Checklist Pre-Despliegue

- [ ] **Personalización completada**

  - [ ] Coordenadas GPS actualizadas
  - [ ] Imágenes agregadas en `public/memories/`
  - [ ] Mensajes y preguntas personalizados
  - [ ] Contraseña del monitor configurada

- [ ] **Configuración técnica**

  - [ ] Variables de entorno configuradas
  - [ ] Modo de prueba deshabilitado
  - [ ] Dependencias actualizadas
  - [ ] Build exitoso localmente

- [ ] **Pruebas realizadas**
  - [ ] Todas las misiones funcionan
  - [ ] Geolocalización probada
  - [ ] Dashboard de monitor accesible
  - [ ] WebSocket funcionando

## 🌐 Despliegue en Vercel (Recomendado)

Vercel es la opción más sencilla para desplegar aplicaciones Next.js.

### Paso 1: Preparar el Repositorio

```bash
# Asegúrate de que todo esté commitado
git add .
git commit -m "feat: ready for deployment"
git push origin main
```

### Paso 2: Configurar Vercel

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta
2. Conecta tu repositorio de GitHub
3. Importa el proyecto
4. Configura las variables de entorno:

```env
MONITOR_PASSWORD=tu_contraseña_segura_aqui
```

### Paso 3: WebSocket Integrado

✅ **SIMPLIFICADO**: El WebSocket ahora está integrado en Next.js como una API route. Vercel lo soporta nativamente.

No necesitas configuración adicional para WebSocket. Todo funciona automáticamente con el despliegue de Next.js.

## 🔧 Despliegue en Netlify

### Configuración Básica

1. Conecta tu repositorio a Netlify
2. Configura el build:
   - **Build command**: `npm run build`
   - **Publish directory**: `out` (si usas export estático)

### Variables de Entorno

```env
MONITOR_PASSWORD=tu_contraseña_segura
```

### Configuración para SPA

Crea `public/_redirects`:

```
/*    /index.html   200
```

## 🖥️ Despliegue en Servidor Propio

### Requisitos del Servidor

- Node.js 18+
- PM2 (recomendado para gestión de procesos)
- Nginx (para proxy reverso)
- SSL/TLS certificado

### Configuración del Servidor

```bash
# Instalar PM2
npm install -g pm2

# Clonar repositorio
git clone https://github.com/tu-usuario/love-adventure-app.git
cd love-adventure-app

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env.local
# Editar .env.local con tus valores

# Build de producción
npm run build

# Iniciar con PM2
pm2 start npm --name "love-app" -- start
pm2 start socket-server.js --name "love-websocket"

# Guardar configuración PM2
pm2 save
pm2 startup
```

### Configuración de Nginx

```nginx
# /etc/nginx/sites-available/love-adventure
server {
    listen 80;
    server_name tu-dominio.com;

    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    # Configuración SSL
    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/private.key;

    # Aplicación principal
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔐 Configuración de Seguridad

### Variables de Entorno Seguras

```env
# Producción
NODE_ENV=production
MONITOR_PASSWORD=contraseña_muy_segura_aqui

# URLs de producción
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
CORS_ORIGIN=https://tu-dominio.com
```

### Recomendaciones de Seguridad

1. **Contraseñas fuertes**: Usa un generador de contraseñas
2. **HTTPS obligatorio**: Nunca uses HTTP en producción
3. **Variables de entorno**: Nunca commitees secretos
4. **Actualizaciones**: Mantén dependencias actualizadas

## 📱 Optimización para Móviles

### Configuración PWA (Opcional)

1. Instala next-pwa:

```bash
npm install next-pwa
```

2. Configura `next.config.js`:

```javascript
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // tu configuración existente
});
```

### Optimización de Imágenes

```bash
# Optimizar imágenes antes de desplegar
npm install -g imagemin-cli
imagemin public/memories/*.jpg --out-dir=public/memories/optimized
```

## 🔍 Monitoreo y Logs

### Configuración de Logs

```javascript
// En socket-server.js, agregar logging
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});
```

### Monitoreo con PM2

```bash
# Ver logs en tiempo real
pm2 logs

# Monitorear procesos
pm2 monit

# Reiniciar aplicación
pm2 restart love-app
```

## 🚨 Solución de Problemas

### Problemas Comunes

#### WebSocket no conecta en producción

```bash
# Verificar que el servidor WebSocket esté ejecutándose
curl -I https://tu-websocket-server.com/socket.io/

# Verificar CORS
curl -H "Origin: https://tu-app.com" https://tu-websocket-server.com/socket.io/
```

#### Geolocalización no funciona

- Verifica que uses HTTPS
- Revisa permisos del navegador
- Confirma que el modo de prueba esté deshabilitado

#### Imágenes no cargan

- Verifica que estén en `public/memories/`
- Confirma los nombres de archivo
- Revisa permisos del servidor

### Comandos de Diagnóstico

```bash
# Verificar build
npm run build

# Verificar dependencias
npm audit

# Verificar configuración Next.js
npx next info

# Verificar variables de entorno
node -e "console.log(process.env)"
```

## 📊 Métricas y Analytics

### Google Analytics (Opcional)

1. Instala la librería:

```bash
npm install @next/third-parties
```

2. Configura en `app/layout.tsx`:

```typescript
import { GoogleAnalytics } from "@next/third-parties/google";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
      <GoogleAnalytics gaId="GA_MEASUREMENT_ID" />
    </html>
  );
}
```

## 🔄 Actualizaciones y Mantenimiento

### Proceso de Actualización

```bash
# Backup antes de actualizar
pm2 save

# Actualizar código
git pull origin main
npm install

# Rebuild
npm run build

# Reiniciar servicios
pm2 restart all
```

### Programar Backups

```bash
# Crontab para backup diario
0 2 * * * /usr/bin/tar -czf /backup/love-app-$(date +\%Y\%m\%d).tar.gz /path/to/love-adventure-app
```

## 📞 Soporte Post-Despliegue

### Checklist Post-Despliegue

- [ ] Aplicación accesible desde URL pública
- [ ] Todas las misiones funcionan correctamente
- [ ] Dashboard de monitor accesible
- [ ] WebSocket conecta correctamente
- [ ] Geolocalización funciona en dispositivos móviles
- [ ] Imágenes se cargan correctamente
- [ ] SSL/HTTPS configurado
- [ ] Monitoreo y logs configurados

### Contactos de Emergencia

Si algo sale mal durante el despliegue:

1. Revisa los logs del servidor
2. Verifica las variables de entorno
3. Confirma que todos los servicios estén ejecutándose
4. Revisa la documentación de la plataforma de hosting

---

¡Felicidades! 🎉 Tu aplicación Love Adventure está lista para crear momentos especiales e inolvidables. 💖
