# Tutoris — Asistente Académico UNSAAC

> **Universidad Nacional de San Antonio Abad del Cusco**
> Escuela Profesional de Ingeniería Informática y de Sistemas

---
Chatbot académico de recuperación de información (BM25 + similitud
coseno) para responder consultas frecuentes de estudiantes y docentes
de la EPIIS sobre tutoría, malla curricular, prácticas pre
profesionales, becas, matrícula y trámites académicos. 100 % en el
navegador.

## Inicio rápido

### Modo local (prueba rápida)

1. Instala la extensión **Live Server** en VS Code
2. Abre la carpeta del proyecto en VS Code
3. Click derecho en `index.html` → **"Open with Live Server"**
4. Regístrate con tu correo, inicia sesión, o usa el botón **"Continuar como invitado"**

> **Importante:** no abras el archivo directamente en el navegador (doble clic). El `fetch('corpus.txt')` necesita un servidor HTTP. Usa Live Server o similar.

---

## Estructura de archivos
proyecto_ia/

├── index.html        Login: registro, inicio de sesión e invitado

├── chat.html          Interfaz principal del chatbot

├── styles.css           Diseño glassmorphism dark mode

├── nlp-engine.js          Motor BM25 + similitud coseno (JavaScript puro)

├── speech.js               Reconocimiento y síntesis de voz (es-PE)

├── corpus.txt                Corpus conversacional P:/R: (fuente del conocimiento)

├── docs/                       Documentación técnica del sistema

└── fuentes/                     Trazabilidad del corpus a la normativa UNSAAC
---

## Autenticación

El sistema usa autenticación **local**, sin servicios externos:

- Las cuentas (correo, nombre, contraseña codificada en Base64) se guardan en `localStorage` del navegador.
- La sesión activa se mantiene en `sessionStorage`.
- El modo invitado omite el registro por completo.

Por ser local, las cuentas no se sincronizan entre dispositivos ni navegadores, y se pierden si se borran los datos de navegación.

---

## Funciones de voz

- **Entrada de voz**: funciona en Chrome y Edge (escritorio y Android)
- **Salida de voz**: funciona en todos los navegadores modernos
- El ícono de altavoz activa o desactiva las respuestas por voz
- El botón de micrófono activa el dictado

---

## Cómo funciona el NLP

El chatbot usa un motor de recuperación de información basado en **BM25 + similitud coseno**, implementado completamente en JavaScript:

1. Al cargar, hace `fetch('corpus.txt')` y lo parsea en 129 pares pregunta-respuesta (formato `P:` / `R:`), agrupados en 17 secciones temáticas.
2. Expande la consulta del usuario con un diccionario de sinónimos académicos (por ejemplo, *jalar* → *desaprobar/reprobar*) y genera bigramas además de unigramas.
3. Construye un índice BM25 ($k_1=1.5$, $b=0.75$) sobre esos pares.
4. Compara la consulta contra cada par mediante similitud coseno, sumando un bono por coincidencia exacta de palabras clave.
5. Devuelve la respuesta del par con mayor puntaje si supera el umbral (0.08); si no, muestra un mensaje de respaldo con canales de atención alternativos.

Sin APIs de pago. Sin servidor. 100% local en el navegador.

El contenido del corpus se basa en el Estatuto Universitario, el Reglamento de Tutorías, el Plan Curricular 2024 y el Reglamento Académico de la UNSAAC, redactado en tono conversacional y sin citar artículos o resoluciones de forma textual.

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| "No se pudo cargar corpus.txt" | Usa un servidor web (Live Server), no abras el archivo directamente |
| No encuentro mi cuenta registrada | Las cuentas son locales al navegador donde te registraste; no se sincronizan entre dispositivos |
| La voz no funciona | Usa Chrome o Edge. En móvil: Chrome Android |
| El chat no responde | Espera a que el loader desaparezca (1-3s para procesar el corpus) |
| Error CORS | Sirve desde un servidor HTTP, no desde `file://` |
| Respuesta no relacionada con la pregunta | El motor es léxico (BM25), no semántico; reformula con palabras más específicas |

---

## Equipo

- Luz Diana Ancasi Aymachoque
- Jhon Eber Huayhua Huamani
- Luis Angel Mogrovejo Ccorimanya

Escuela Profesional de Ingeniería Informática y de Sistemas — UNSAAC
