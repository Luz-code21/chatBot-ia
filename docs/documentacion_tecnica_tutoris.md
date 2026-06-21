# Documento Técnico — Sistema Tutoris
## Asistente Académico Virtual · Universidad Nacional San Antonio Abad del Cusco

---

> **Versión:** 1.0 &nbsp;|&nbsp; **Fecha:** Junio 2026  
> **Escuela Profesional:** Ingeniería Informática y de Sistemas  
> **Facultad:** FIEEIM — UNSAAC · Cusco, Perú

---

## 1. Descripción General

**Tutoris** es un asistente académico virtual diseñado para los estudiantes de la Escuela Profesional de Ingeniería Informática y de Sistemas de la UNSAAC. Permite realizar consultas en **lenguaje natural** — mediante texto o voz — sobre temas académicos: malla curricular, reglamentos, tutoría, becas y prácticas pre profesionales.

El sistema responde de manera automática recuperando la información más relevante de un corpus de documentos académicos oficiales, sin necesidad de conectarse a ninguna API de inteligencia artificial externa.

### Características principales

| Característica | Descripción |
|---------------|-------------|
| **Consultas en lenguaje natural** | El estudiante escribe o habla su pregunta libremente |
| **Respuestas automáticas** | El motor NLP recupera la respuesta más relevante del corpus |
| **Entrada por voz** | Reconocimiento de voz en español peruano |
| **Salida por voz** | El sistema lee la respuesta en voz alta |
| **Sin APIs externas de IA** | Todo el procesamiento ocurre en el navegador del cliente |
| **Autenticación local** | Registro e inicio de sesión con correo y contraseña |
| **Información del tutor** | Muestra la tutora asignada al ingresar al sistema |
| **Modo invitado** | Acceso sin necesidad de crear cuenta |
| **Despliegue gratuito** | Compatible con GitHub Pages y Netlify |

---

## 2. Arquitectura del Sistema

Tutoris sigue una arquitectura **JAMstack** (JavaScript + APIs nativas + Markup estático). No requiere servidor propio, base de datos ni servicios en la nube de pago.

```
CLIENTE (Navegador Web — Chrome / Edge)
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   index.html          chat.html           Modales             │
│   (Login / Registro)  (Chat principal)    (Tutor, Usuario)    │
│         │                   │                                 │
│         ▼                   ▼                                 │
│   ┌──────────────┐   ┌──────────────────┐                     │
│   │  Auth Local  │   │   NLP Engine     │                     │
│   │ localStorage │   │  nlp-engine.js   │◀── corpus.txt       │
│   └──────────────┘   └──────────────────┘    (251 KB)         │
│         │                   │                                 │
│         ▼                   ▼                                 │
│   ┌──────────────┐   ┌──────────────────┐                     │
│   │ sessionStorage│  │  Web Speech API  │                     │
│   │ (sesión activa│  │   speech.js      │                     │
│   └──────────────┘  │   STT  │  TTS    │                     │
│                      └──────────────────┘                     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
         Servidor estático (GitHub Pages / Netlify — gratuito)
```

> **Sin servidor propio.** Todo el procesamiento de lenguaje natural ocurre localmente en el navegador del estudiante usando JavaScript puro.

---

## 3. Tecnologías Utilizadas

### 3.1 Frontend

| Tecnología | Versión | Rol en el sistema |
|------------|---------|-------------------|
| **HTML5** | — | Estructura semántica de las páginas |
| **CSS3** | — | Diseño visual, animaciones, glassmorphism |
| **JavaScript ES2022** | — | Lógica completa: NLP, auth, UI, voz |
| **Google Fonts (Outfit)** | — | Tipografía premium |

### 3.2 Motor NLP (Procesamiento de Lenguaje Natural)

Implementado íntegramente en **JavaScript puro**, sin librerías externas:

| Componente | Técnica | Descripción |
|------------|---------|-------------|
| **Segmentación** | Split por `.`, `?`, `!`, `\n` | Divide el corpus en oraciones |
| **Normalización** | Unicode NFD + regex | Elimina acentos y caracteres especiales |
| **Stop words** | Lista estática 130 palabras | Filtra artículos, preposiciones, conjunciones |
| **Stemming** | Sufijos del español | Reduce palabras a su raíz morfológica |
| **Indexación** | TF-IDF con representación dispersa | Pondera términos por relevancia |
| **Recuperación** | Similitud coseno | Mide similitud entre consulta y corpus |

### 3.3 Voz

| API | Estándar | Uso |
|-----|---------|-----|
| **SpeechRecognition** | Web Speech API (W3C) | Voz → Texto (entrada del usuario) |
| **SpeechSynthesis** | Web Speech API (W3C) | Texto → Voz (respuesta del sistema) |

> Compatible con Chrome 33+, Edge 79+. El idioma configurado es `es-PE` (español peruano).

### 3.4 Autenticación

| Componente | Implementación | Almacenamiento |
|------------|---------------|----------------|
| **Registro** | JavaScript puro | `localStorage` del navegador |
| **Login** | Verificación de hash | `localStorage` del navegador |
| **Sesión activa** | Objeto JSON | `sessionStorage` del navegador |

Las contraseñas se almacenan codificadas en **Base64** dentro del `localStorage` del navegador.

### 3.5 Despliegue

| Plataforma | Tipo | Costo |
|------------|------|-------|
| **GitHub Pages** | CDN estático | Gratuito |
| **Netlify** | CDN estático + drag & drop | Gratuito |

---

## 4. Fundamentos Matemáticos del Motor NLP

El motor de respuestas de Tutoris se basa en el modelo de **Recuperación de Información** (Information Retrieval), combinando dos conceptos matemáticos fundamentales:

### 4.1 TF-IDF (Term Frequency — Inverse Document Frequency)

TF-IDF es un esquema de ponderación que evalúa **cuán importante es una palabra** dentro de un documento en relación al corpus completo. Palabras muy frecuentes en todos los documentos (como "la", "de", "el") reciben un peso bajo; palabras específicas de pocos documentos reciben un peso alto.

#### Term Frequency (TF)

Mide con qué frecuencia aparece un término $t$ dentro de un documento $d$:

$$TF(t, d) = \frac{f_{t,d}}{\sum_{t' \in d} f_{t',d}}$$

Donde $f_{t,d}$ es el número de veces que el término $t$ aparece en el documento $d$, dividido entre el total de términos del documento.

#### Inverse Document Frequency (IDF)

Mide qué tan raro o específico es un término en todo el corpus. Términos que aparecen en muchos documentos reciben un IDF bajo:

$$IDF(t, D) = \log\left(\frac{N}{df_t + 1}\right) + 1$$

Donde:
- $N$ = número total de documentos (oraciones) en el corpus
- $df_t$ = número de documentos que contienen el término $t$
- Se suma $1$ al denominador para evitar división por cero (**suavizado de Laplace**)
- Se suma $1$ al resultado para evitar que términos omnipresentes tengan IDF = 0

#### Peso TF-IDF

El peso final de un término en un documento es:

$$w(t, d) = TF(t, d) \times IDF(t, D)$$

Cada oración del corpus y cada consulta del usuario quedan representadas como un **vector disperso** en el espacio de todos los términos del vocabulario:

$$\vec{d} = \{(t_1, w_1),\; (t_2, w_2),\; \ldots,\; (t_n, w_n)\}$$

### 4.2 Similitud Coseno

Para encontrar la oración más relevante, se calcula la **similitud coseno** entre el vector de la consulta del usuario $\vec{q}$ y el vector de cada oración del corpus $\vec{d_i}$:

$$\text{sim}(\vec{q}, \vec{d_i}) = \frac{\vec{q} \cdot \vec{d_i}}{\|\vec{q}\| \cdot \|\vec{d_i}\|}$$

Donde:

- $\vec{q} \cdot \vec{d_i} = \sum_{t \in V} w_q(t) \cdot w_{d_i}(t)$ &nbsp; (producto punto)
- $\|\vec{q}\| = \sqrt{\sum_{t \in V} w_q(t)^2}$ &nbsp; (magnitud del vector consulta)
- $\|\vec{d_i}\| = \sqrt{\sum_{t \in V} w_{d_i}(t)^2}$ &nbsp; (magnitud del vector documento)

El resultado es un valor entre $0$ y $1$:

| Valor | Interpretación |
|-------|---------------|
| $\text{sim} = 1$ | Consulta y documento idénticos |
| $\text{sim} > 0.5$ | Alta similitud semántica |
| $0.12 < \text{sim} \leq 0.5$ | Similitud moderada (respuesta válida) |
| $\text{sim} \leq 0.12$ | Sin relación (se muestra mensaje de fallback) |

> **¿Por qué similitud coseno y no distancia euclidiana?** Porque la similitud coseno mide el **ángulo** entre vectores, no su magnitud. Dos oraciones son semánticamente similares si comparten los mismos términos importantes, independientemente de su longitud.

### 4.3 Stemming en Español

Para reducir la dispersión del vocabulario, el sistema aplica un algoritmo simplificado de **reducción de sufijos** al español:

Se eliminan en orden de prioridad los sufijos más largos a los más cortos:

```
"aciones" → ""    ("evaluaciones" → "evalua")
"amiento" → ""    ("planteamiento" → "plante")
"mente"   → ""    ("académicamente" → "académic")
"iendo"   → ""    ("aprendiendo" → "aprend")
"ando"    → ""    ("cursando" → "curs")
"ción"    → ""    ("matrícula" → "matrícu")
"dad"     → ""    ("facultad" → "facult")
...
```

Esto permite que *"matrícula"*, *"matrículas"* y *"matricularse"* apunten al mismo término en el índice.

### 4.4 Ejemplo Completo de una Consulta

**Consulta del usuario:** *"¿Cuántos créditos tiene el primer semestre?"*

```
1. Preprocesamiento:
   Input:  "cuantos creditos tiene el primer semestre"
   Norm:   "cuantos creditos tiene primer semestre"
   Stem:   "cuant credit prim semest"

2. Vectorización TF-IDF de la consulta:
   q = { "cuant": 0.31, "credit": 0.45, "prim": 0.28, "semest": 0.52 }

3. Cálculo de similitud coseno con ~1500 oraciones del corpus:
   sim(q, d_1)   = 0.08  → descartada
   sim(q, d_47)  = 0.63  → candidata
   sim(q, d_312) = 0.71  → candidata (mayor)
   sim(q, d_890) = 0.12  → límite
   ...

4. Selección: d_312 tiene sim = 0.71 → se devuelve como respuesta

5. Respuesta: "El primer semestre comprende 21 créditos, distribuidos
   en los cursos: Matemática Básica, Física I, Química..."
```

---

## 5. Flujo Completo del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                 INICIO — index.html                      │
│                                                          │
│  ┌─────────────────┐    ┌─────────────────────────────┐  │
│  │  Crear cuenta   │    │      Iniciar sesión          │  │
│  │  nombre+correo  │    │    correo + contraseña       │  │
│  │  + contraseña   │    │                              │  │
│  └────────┬────────┘    └──────────────┬──────────────┘  │
│           │ Verificar localStorage     │                  │
│           └────────────┬───────────────┘                  │
│                        │ ✓ OK → sessionStorage            │
│                        ▼                                  │
│              chat.html                                    │
└──────────────────────────────────────────────────────────┘
                         │
          ┌──────────────▼──────────────┐
          │     CARGA INICIAL (1-3s)    │
          │  fetch('corpus.txt')        │
          │  Tokenizar ~1500 oraciones  │
          │  Calcular TF-IDF por oración│
          │  Construir índice disperso  │
          └──────────────┬──────────────┘
                         │ Sistema listo
                         ▼
          ┌──────────────────────────────┐
          │    CONSULTA DEL USUARIO       │
          │  (texto ó voz → SpeechRec.)  │
          └──────────────┬───────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │    PREPROCESAMIENTO          │
          │  lowercase → normalizar →    │
          │  tokenizar → stop words →   │
          │  stemming                   │
          └──────────────┬───────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │    VECTORIZACIÓN TF-IDF      │
          │  Consulta → vector disperso  │
          └──────────────┬───────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │    SIMILITUD COSENO          │
          │  sim(q, d_i) ∀ i ∈ corpus   │
          │  Seleccionar máximo          │
          └──────────────┬───────────────┘
                         │
              ┌──────────▼──────────┐
              │ sim > 0.12?         │
              │  SÍ → respuesta     │
              │  NO → fallback msg  │
              └──────────┬──────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │    SALIDA AL USUARIO         │
          │  Texto en chat + SpeechSynth │
          └──────────────────────────────┘
```

---

## 6. Componentes del Software

### 6.1 `index.html` — Página de Acceso

**Función:** Autenticación del estudiante

- Tab por defecto: **Crear cuenta** (nombre, correo, contraseña, confirmar contraseña)
- Tab secundario: **Iniciar sesión** (correo, contraseña)
- Voz en campos de texto: botón 🎙️ en nombre y correo
- Acceso como **invitado** (sin registro)
- Validación de correo con expresión regular: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Almacenamiento: `localStorage['tutoris_accounts_v1']`

### 6.2 `chat.html` — Interfaz de Conversación

**Función:** Interfaz principal del chatbot

- Header con logo, estado del sistema, botón tutora, toggle de voz y menú de usuario
- Área de mensajes con animaciones de entrada (`msg-appear`)
- Indicador "escribiendo..." con animación de puntos (`bounce-dot`)
- Overlay de carga durante procesamiento del corpus
- Chips de preguntas frecuentes con scroll horizontal en móvil
- Modal de **bienvenida con tutora** (solo usuarios con cuenta, una vez por sesión)
- Modal de **detalle de tutora** (icono 👥 en el header)

### 6.3 `nlp-engine.js` — Motor de IA

**Función:** Procesamiento de lenguaje natural y recuperación de información

```javascript
class NLPEngine {
  async build(corpusText)     // Construye índice TF-IDF
  query(userText)             // Devuelve la respuesta más relevante
  preprocess(text)            // Normaliza y tokeniza
  stem(word)                  // Reduce la palabra a su raíz
  computeTFIDF()              // Calcula pesos TF-IDF
  vectorize(tokens)           // Texto → vector disperso
  cosineSimilarity(v1, v2)   // Similitud entre dos vectores
}
```

### 6.4 `speech.js` — Módulo de Voz

**Función:** Interfaz con la Web Speech API

```javascript
class SpeechManager {
  startListening()    // Activa SpeechRecognition
  stopListening()     // Detiene escucha
  speak(text, cb)     // SpeechSynthesis con voz es-PE
  stopSpeaking()      // Interrumpe la voz
  toggleVoice()       // Activa/desactiva salida de voz
}
```

Selección automática de voz en este orden de prioridad: `es-PE` → `es-US` → `es-419` → `es-ES`.

### 6.5 `styles.css` — Sistema de Diseño

**Función:** Estilos visuales completos (1,250+ líneas)

| Técnica | Descripción |
|---------|-------------|
| **Variables CSS** | 25+ design tokens para colores, radios, sombras |
| **Glassmorphism** | `backdrop-filter: blur(20px) saturate(180%)` |
| **Animaciones** | `float-orb`, `msg-appear`, `bounce-dot`, `pulse-mic`, `bounce-in` |
| **Grid CSS** | Layout del chat con `display: flex` y `flex-direction: column` |
| **Responsive** | Breakpoints en 640px (móvil) y 768px (tablet) |
| **iOS Safe Areas** | `env(safe-area-inset-bottom)` para iPhone con notch |

### 6.6 `corpus.txt` — Base de Conocimiento

**Contenido:** 251 KB · ~921 líneas · ~1,500 oraciones después de segmentación

| Sección | Contenido |
|---------|-----------|
| Reglamento de Tutoría | Fines, objetivos, funciones, asignación, confidencialidad |
| Malla curricular 2024 | 10 semestres, 59 cursos, 220 créditos, prerrequisitos |
| Sumillas de asignaturas | Descripción completa de todos los cursos |
| Reglamento académico | Matrícula, evaluación, convalidaciones |
| Prácticas pre profesionales | Requisitos, procedimientos, asesoría |
| Becas y movilidad | Convocatorias, requisitos, proceso |

---

## 7. Autenticación Local

### Flujo de registro

```
Usuario ingresa: nombre, correo, contraseña
         │
         ├─ Validar correo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
         ├─ Validar contraseña: longitud ≥ 6
         ├─ Verificar que el correo no esté registrado
         │
         ▼
Guardar en localStorage:
{
  "juan@unsaac.edu.pe": {
    "name": "Juan Pérez",
    "hash": "anVhbjEyMw==",   ← Base64(contraseña)
    "createdAt": 1718820000000
  }
}
         │
         ▼
Crear sesión en sessionStorage:
{
  "uid": "juan@unsaac.edu.pe",
  "name": "Juan Pérez",
  "email": "juan@unsaac.edu.pe",
  "isGuest": false
}
         │
         ▼
Redirigir a chat.html
```

> **Nota de seguridad:** Las contraseñas se almacenan en Base64, que es codificación, no cifrado. Para un sistema informativo sin datos sensibles es aceptable. En un sistema con datos personales reales se debería implementar hashing con bcrypt o PBKDF2.

---

## 8. Web Speech API

### 8.1 Reconocimiento de Voz (STT — Speech to Text)

```javascript
const recognition = new SpeechRecognition();
recognition.lang = 'es-PE';       // Español peruano
recognition.continuous = false;   // Para por oración
recognition.interimResults = true; // Resultados parciales en tiempo real
```

El flujo es:
1. Usuario hace click en 🎙️
2. El navegador pide permiso de micrófono
3. El audio se procesa **localmente en el navegador** (sin envío a servidores)
4. El texto transcripto se inserta en el campo de texto o se envía al NLP

### 8.2 Síntesis de Voz (TTS — Text to Speech)

```javascript
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang   = 'es-PE';
utterance.rate   = 0.95;   // Velocidad ligeramente reducida
utterance.pitch  = 1.05;   // Tono levemente elevado
utterance.volume = 1.0;
```

El texto se limpia antes de ser leído: se eliminan emojis y marcadores de formato (`**`, etc.) para que la síntesis de voz suene natural.

---

## 9. Diseño Visual

### Paleta de colores (dark glassmorphism)

| Token | Valor hex | Uso |
|-------|-----------|-----|
| `--bg-primary` | `#050a18` | Fondo principal (azul marino oscuro) |
| `--gold` | `#c9a227` | Color institucional primario |
| `--gold-light` | `#e8c44f` | Acento dorado claro |
| `--cyan` | `#06b6d4` | Color de acento secundario |
| `--blue` | `#3b82f6` | Avatares de usuario |
| `--text-primary` | `#f1f5f9` | Texto principal |
| `--text-secondary` | `#94a3b8` | Texto secundario |

### Glassmorphism

La técnica glassmorphism crea el efecto de vidrio esmerilado:
```css
background: rgba(255, 255, 255, 0.04);
backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.08);
```

### Responsive

| Breakpoint | Dispositivo | Cambios principales |
|------------|-------------|---------------------|
| `≤ 640px` | Móvil | Modales en bottom sheet, header compacto, sin subtítulos |
| `≤ 768px` | Tablet | Burbujas al 85%, modales al 95% del ancho |
| `> 768px` | Desktop | Experiencia completa |

---

## 10. Limitaciones del Sistema

| Limitación | Descripción | Impacto |
|-----------|-------------|---------|
| **NLP por recuperación** | No genera texto propio, recupera fragmentos del corpus | Medio |
| **Sin contexto** | Cada pregunta es independiente, no recuerda la anterior | Medio |
| **Cuentas locales** | Los usuarios solo existen en ese navegador/dispositivo | Medio |
| **Corpus fijo** | La información del corpus no se actualiza automáticamente | Bajo |
| **Voz solo Chrome/Edge** | SpeechRecognition no disponible en Firefox | Bajo |
| **Cobertura** | Solo cubre la Escuela de Ing. Informática y de Sistemas | Alto |

---

## 11. Mejoras Futuras Propuestas

| Mejora | Descripción | Complejidad |
|--------|-------------|-------------|
| **Contexto conversacional** | Recordar últimas $n$ preguntas para coherencia | Media |
| **BM25** | Algoritmo de ranking más preciso que TF-IDF clásico | Media |
| **Embeddings semánticos** | Usar vectores word2vec o GloVe precalculados | Alta |
| **Más escuelas** | Ampliar corpus a todas las escuelas de la UNSAAC | Baja |
| **Soporte quechua** | Consultas en quechua cusqueño | Alta |
| **Historial de chat** | Guardar conversaciones en IndexedDB del navegador | Baja |
| **Backend con auth real** | Firebase o Supabase para cuentas persistentes | Media |
| **PWA** | Progressive Web App — instalar como app en el móvil | Baja |

---

## 12. Glosario Técnico

| Término | Definición |
|---------|-----------|
| **TF-IDF** | Term Frequency–Inverse Document Frequency. Esquema de ponderación para evaluar la relevancia de un término en un documento. |
| **Similitud coseno** | Medida de similitud entre dos vectores que calcula el coseno del ángulo entre ellos. Valor entre 0 (sin relación) y 1 (idénticos). |
| **Stemming** | Proceso de reducir una palabra a su raíz morfológica eliminando sufijos. |
| **Stop words** | Palabras muy comunes que no aportan significado semántico (artículos, preposiciones, conjunciones). |
| **Corpus** | Colección de textos que constituye la base de conocimiento del sistema. |
| **Vector disperso** | Representación vectorial donde la mayoría de componentes son cero, típico en NLP con vocabularios grandes. |
| **JAMstack** | Arquitectura web basada en JavaScript, APIs y Markup. Sin servidor propio. |
| **STT** | Speech-To-Text. Conversión de audio de voz a texto. |
| **TTS** | Text-To-Speech. Conversión de texto a audio de voz sintetizada. |
| **Glassmorphism** | Técnica de diseño visual que simula el efecto de vidrio esmerilado usando blur y transparencia. |
| **localStorage** | Almacenamiento persistente del navegador (no se borra al cerrar el navegador). |
| **sessionStorage** | Almacenamiento temporal del navegador (se borra al cerrar la pestaña). |
| **CDN** | Content Delivery Network. Red de servidores para distribuir archivos estáticos globalmente. |
| **Information Retrieval** | Campo de la informática orientado a buscar y recuperar documentos relevantes de una colección. |
| **IDF** | Inverse Document Frequency. Componente de TF-IDF que penaliza términos muy comunes en el corpus. |

---

*Documento técnico elaborado para el Proyecto Tutoris — Asistente Académico Virtual UNSAAC*  
*Escuela Profesional de Ingeniería Informática y de Sistemas · Cusco, Perú · 2026*
