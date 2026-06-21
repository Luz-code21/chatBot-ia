# 🎓 Tutoris — Asistente Académico UNSAAC

> **Universidad Nacional San Antonio Abad del Cusco**  
> Escuela Profesional de Ingeniería Informática y de Sistemas

---

## ⚡ Inicio rápido

### Modo local (prueba rápida)
1. Instala la extensión **Live Server** en VS Code  
2. Abre la carpeta del proyecto en VS Code  
3. Click derecho en `index.html` → **"Open with Live Server"**  
4. Usa el botón **"Continuar como invitado"** para probar sin Firebase

> ⚠️ **No abras el archivo directamente** en el navegador (doble clic).  
> El `fetch('corpus.txt')` necesita un servidor HTTP. Usa Live Server o similar.

---


## 📁 Estructura de archivos

```
proyecto_ia/
├── index.html          # Página de login (Google + email + invitado)
├── chat.html           # Interfaz principal del chatbot
├── styles.css          # Diseño glassmorphism dark mode
├── nlp-engine.js       # Motor TF-IDF en JavaScript puro
├── speech.js           # Reconocimiento y síntesis de voz
├── firebase-config.js  # Referencia de configuración Firebase
├── corpus.txt          # Corpus académico UNSAAC (fuente del conocimiento)
└── assets/
    └── logo.png        # Logo Tutoris
```

---

## 🎤 Funciones de voz

- **Entrada de voz**: Funciona en Chrome y Edge (escritorio y Android)
- **Salida de voz**: Funciona en todos los navegadores modernos
- El icono de **🔊** activa/desactiva las respuestas de voz
- El botón de **🎙️** activa el micrófono

---

## 🧠 Cómo funciona el NLP

El chatbot usa un motor de recuperación de información basado en **TF-IDF + Similitud Coseno**, implementado completamente en JavaScript:

1. Al cargar, hace `fetch('corpus.txt')` y tokeniza el texto en ~1,500+ oraciones
2. Construye un índice invertido con pesos TF-IDF por término
3. Cuando el usuario escribe, vectoriza su consulta con los mismos pesos
4. Calcula la similitud coseno con todas las oraciones del corpus
5. Devuelve la oración con mayor similitud (si supera el umbral mínimo)

**Sin APIs de pago. Sin servidor. 100% local en el navegador.**

---

## 🐛 Solución de problemas

| Problema | Solución |
|----------|----------|
| "No se pudo cargar corpus.txt" | Usa un servidor web (Live Server), no abras el archivo directamente |
| Google login no funciona | Verifica la configuración de Firebase y dominios autorizados |
| La voz no funciona | Usa Chrome o Edge. En móvil: Chrome Android |
| El chat no responde | Espera a que el loader desaparezca (1-3s para procesar el corpus) |
| Error CORS | Sirve desde un servidor HTTP, no desde `file://` |

---
