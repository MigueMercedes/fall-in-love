# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a Love Adventure App! Este proyecto está diseñado para ayudar a crear momentos especiales e inolvidables.

## 🌟 Cómo Contribuir

### Reportar Bugs

1. Verifica que el bug no haya sido reportado antes
2. Abre un issue con el template de bug
3. Incluye pasos para reproducir el problema
4. Agrega capturas de pantalla si es posible

### Sugerir Nuevas Características

1. Abre un issue con el template de feature request
2. Describe claramente la funcionalidad propuesta
3. Explica por qué sería útil para los usuarios
4. Incluye mockups o wireframes si es posible

### Contribuir con Código

#### Configuración del Entorno de Desarrollo

```bash
# Fork el repositorio
git clone https://github.com/tu-usuario/love-adventure-app.git
cd love-adventure-app

# Instala dependencias
npm install

# Crea archivo de configuración
cp env.example .env.local

# Inicia el servidor de desarrollo
npm run dev
```

#### Proceso de Desarrollo

1. **Fork** el proyecto
2. **Crea una rama** para tu feature:
   ```bash
   git checkout -b feature/nombre-descriptivo
   ```
3. **Realiza tus cambios** siguiendo las convenciones del proyecto
4. **Prueba tus cambios** localmente
5. **Commit** tus cambios:
   ```bash
   git commit -m "feat: descripción clara del cambio"
   ```
6. **Push** a tu rama:
   ```bash
   git push origin feature/nombre-descriptivo
   ```
7. **Abre un Pull Request**

### Convenciones de Código

#### Estilo de Código

- Usa TypeScript para todo el código nuevo
- Sigue las convenciones de ESLint configuradas
- Usa Prettier para formateo automático
- Nombres de variables y funciones en camelCase
- Nombres de componentes en PascalCase

#### Estructura de Commits

Usa el formato de [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(scope): descripción

[cuerpo opcional]

[footer opcional]
```

**Tipos permitidos:**

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan funcionalidad)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**

```
feat(missions): add new mission type for photo challenges
fix(gps): correct distance calculation for target location
docs(readme): update installation instructions
style(ui): improve button hover animations
```

#### Estructura de Archivos

```
app/
├── globals.css          # Estilos globales
├── layout.tsx          # Layout principal
├── page.tsx            # Página principal con misiones
├── monitor/            # Dashboard de monitoreo
└── api/                # APIs (si las hay)

components/
├── ui/                 # Componentes de UI base
└── [otros]/           # Componentes específicos

lib/
└── utils.ts           # Utilidades compartidas

public/
├── memories/          # Imágenes de la galería
└── [otros]/          # Assets estáticos
```

### Áreas de Contribución

#### 🎯 Prioridad Alta

- [ ] Mejoras en la experiencia móvil
- [ ] Optimización de rendimiento
- [ ] Mejoras en accesibilidad
- [ ] Corrección de bugs reportados

#### 🌟 Nuevas Características

- [ ] Soporte para múltiples idiomas
- [ ] Temas personalizables
- [ ] Nuevos tipos de misiones
- [ ] Integración con redes sociales
- [ ] Sistema de notificaciones

#### 📱 Mejoras Técnicas

- [ ] Tests unitarios y de integración
- [ ] Mejoras en el sistema WebSocket
- [ ] Optimización de imágenes
- [ ] PWA (Progressive Web App)
- [ ] Modo offline

### Pautas de Revisión

#### Para Reviewers

- Verifica que el código siga las convenciones establecidas
- Prueba la funcionalidad localmente
- Revisa que no se rompan funcionalidades existentes
- Asegúrate de que la documentación esté actualizada

#### Para Contributors

- Responde a los comentarios de revisión de manera constructiva
- Realiza los cambios solicitados
- Mantén el PR actualizado con la rama principal

### Configuración de Desarrollo

#### Variables de Entorno Requeridas

```env
MONITOR_PASSWORD=tu_contraseña_de_prueba
```

#### Comandos Útiles

```bash
# Desarrollo
npm run dev

# Linting
npm run lint

# Formateo
npm run format

# Build
npm run build

# Servidor WebSocket (en terminal separada)
npm run socket-server
```

### Testing

#### Pruebas Manuales

1. Verifica que todas las misiones funcionen correctamente
2. Prueba la geolocalización (usa modo de prueba)
3. Verifica el dashboard de monitoreo
4. Prueba en diferentes dispositivos y navegadores

#### Pruebas Automatizadas

```bash
# Ejecutar tests (cuando estén disponibles)
npm run test
```

### Documentación

#### Actualizar Documentación

- Actualiza el README.md si cambias funcionalidades
- Documenta nuevas características en código
- Actualiza esta guía si cambias el proceso de contribución

#### Comentarios en Código

- Usa comentarios para explicar lógica compleja
- Documenta funciones públicas
- Explica decisiones de diseño no obvias

### Recursos Adicionales

#### Tecnologías Utilizadas

- [Next.js](https://nextjs.org/docs) - Framework principal
- [React](https://react.dev/learn) - Biblioteca de UI
- [TypeScript](https://www.typescriptlang.org/docs/) - Tipado estático
- [Tailwind CSS](https://tailwindcss.com/docs) - Estilos
- [Socket.IO](https://socket.io/docs/) - WebSocket
- [Leaflet](https://leafletjs.com/reference.html) - Mapas

#### Herramientas de Desarrollo

- [ESLint](https://eslint.org/docs/latest/) - Linting
- [Prettier](https://prettier.io/docs/en/) - Formateo
- [Vercel](https://vercel.com/docs) - Deployment

### Código de Conducta

#### Nuestro Compromiso

Nos comprometemos a hacer de la participación en nuestro proyecto una experiencia libre de acoso para todos, independientemente de la edad, tamaño corporal, discapacidad visible o invisible, etnia, características sexuales, identidad y expresión de género, nivel de experiencia, educación, estatus socioeconómico, nacionalidad, apariencia personal, raza, religión, o identidad y orientación sexual.

#### Comportamiento Esperado

- Usar lenguaje acogedor e inclusivo
- Ser respetuoso con diferentes puntos de vista
- Aceptar críticas constructivas con gracia
- Enfocarse en lo que es mejor para la comunidad
- Mostrar empatía hacia otros miembros

#### Comportamiento Inaceptable

- Uso de lenguaje o imágenes sexualizadas
- Comentarios despectivos o ataques personales
- Acoso público o privado
- Publicar información privada de otros sin permiso
- Cualquier conducta que sería inapropiada en un entorno profesional

### Reconocimientos

¡Todos los contribuidores serán reconocidos! Las contribuciones de cualquier tamaño son valoradas y apreciadas.

### Preguntas

Si tienes preguntas sobre cómo contribuir, no dudes en:

- Abrir un issue de discusión
- Contactar a los mantenedores
- Revisar issues existentes para ver si tu pregunta ya fue respondida

---

¡Gracias por ayudar a hacer de Love Adventure App una herramienta mejor para crear momentos especiales! 💖
