# src/ — Código fuente del chatbot (pendiente)

Esta carpeta es donde va el código fuente real de Tutoris, tal como se
describe en `docs/documentacion_tecnica_tutoris.md` (Sección 6,
"Componentes del Software"):

```
src/
├── index.html        ← Página de acceso (login/registro/invitado)
├── chat.html          ← Interfaz de conversación
├── css/
│   └── styles.css     ← Sistema de diseño (dark glassmorphism)
└── js/
    ├── nlp-engine.js   ← Clase NLPEngine (TF-IDF + similitud coseno)
    ├── speech.js       ← Clase SpeechManager (Web Speech API, es-PE)
    ├── auth.js         ← Clase AuthManager (localStorage/sessionStorage)
    └── chat-ui.js      ← Clase ChatUI (orquestación de la interfaz)
```

`nlp-engine.js` debe apuntar a `../corpus.txt` (en la raíz del repositorio)
como fuente del corpus, igual que en el sistema ya desplegado en GitHub
Pages.

> Nota: estos archivos aún no están en este paquete — se agregan
> manualmente con el código ya implementado del chatbot.
