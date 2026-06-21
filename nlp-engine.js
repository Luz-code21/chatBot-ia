/* ============================================================
   TUTORIS - UNSAAC | Motor NLP v2.0
   Mejoras: Parser Q&A, BM25, bigrams, umbral adaptativo,
            ventana de contexto, expansión de consulta
   ============================================================ */

// ── Stop words en español (ampliadas) ───────────────────────────
const STOP_WORDS = new Set([
  'de','la','que','el','en','y','a','los','del','se','las','un','por','con',
  'una','su','para','es','al','lo','como','más','pero','sus','le','ya','o',
  'este','sí','porque','esta','entre','cuando','muy','sin','sobre','ser',
  'tiene','también','me','hasta','hay','donde','han','quien','están','estado',
  'desde','todo','nos','durante','todos','uno','les','ni','contra','otros',
  'ese','eso','ante','ellos','e','esto','mí','antes','algunos','qué','unos',
  'yo','otro','otras','otra','él','tanto','esa','estos','mucho','quienes',
  'nada','muchos','cual','poco','ella','estar','estas','algunas','algo',
  'nosotros','mi','mis','tú','te','ti','tu','tus','ellas','así',
  'fue','ha','sea','cada','son','puede','deben','debe','dicho','hecho',
  'mediante','mismo','misma','mismos','través','según','cuyo','cuya',
  'mientras','aunque','sino','incluso','además','aquí','allí','entonces',
  'luego','pues','tan','tampoco','jamás','nunca','siempre','ahora',
  'he','si','no','soy','eres','somos','tengo','tenemos','tienes',
  'hacer','hace','hacen','hago','dar','doy','das','da','quiero','quiero',
  'quieres','quieren','poder','puedo','puedes','pueden','ir','voy','vas',
  'va','van','bien','mal','muy','hay','tener','haber','ser','estar',
  'le','les','nos','os','me','te','se','lo','la','los','las',
  'fue','era','eran','fueron','será','serán','sería','serían',
  'esta','este','estos','estas','aquel','aquella','aquellos','aquellas'
]);

// ── Sinónimos / expansión de términos académicos ─────────────────
const SYNONYMS = {
  'jalar':    ['desaprobar','reprobar','jalado','jaladas','reprobado','desaprobado'],
  'jaló':     ['desaprobó','reprobó'],
  'jalé':     ['desaprobé','reprobé'],
  'jalado':   ['desaprobado','reprobado','aplazado'],
  'notas':    ['calificaciones','nota','puntaje','evaluación'],
  'nota':     ['calificación','puntaje','evaluación','notas'],
  'cursos':   ['materias','asignaturas','ramos','curso','materia','asignatura'],
  'carrera':  ['programa','escuela','especialidad','ingeniería'],
  'créditos': ['creditos','unidades','crédito','credito'],
  'semestre': ['ciclo','periodo','semestres','ciclos'],
  'malla':    ['plan','curriculum','currículo','pensum','plan de estudios'],
  'grado':    ['título','bachiller','diploma','titulación'],
  'titulo':   ['título','grado','bachiller','licenciatura'],
  'beca':     ['becas','subvención','apoyo económico','financiamiento'],
  'practicas':['prácticas','práctica','internship','pasantía'],
  'tutor':    ['tutora','asesor','orientador','docente tutor'],
  'expulsion':['separación','suspensión','retiro'],
  'suspender':['suspensión','separación','apartar'],
  'matricula':['matrícula','inscripción','registro'],
  'tesis':    ['trabajo de investigación','proyecto','sustentación'],
  'extranjero':['intercambio','movilidad','internacional'],
  'psicologia':['psicológica','psicológico','salud mental'],
};

class NLPEngine {
  constructor() {
    this.qaItems    = [];   // Array de {question, answer, keywords}
    this.sentences  = [];   // Oraciones sueltas del texto libre
    this.vocabulary = new Map();
    this.idf        = [];
    this.qaVectors  = [];
    this.sentVectors= [];
    this.ready      = false;
  }

  // ── Normalización ──────────────────────────────────────────────
  normalize(str) {
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase()
              .replace(/[¿¡]/g, '');
  }

  // ── Stemming español (sufijos ordenados de mayor a menor) ──────
  stem(word) {
    const rules = [
      'quisieron','quieren','amiento','imientos','aciones','encias',
      'icion','ando','iendo','mente','idades','istas','ados','adas',
      'idos','idas','ables','ibles','able','ible','ado','ada','ido','ida',
      'aron','eron','aban','ian','emos','amos','cion','dad','nes','es',
      'er','ir','ar','os','as'
    ];
    for (const r of rules) {
      if (word.endsWith(r) && word.length > r.length + 3) {
        return word.slice(0, -r.length);
      }
    }
    return word;
  }

  // ── Tokenizar y preprocesar ────────────────────────────────────
  tokenize(text) {
    return this.normalize(text)
      .replace(/[^\w\s]/g, ' ')
      .replace(/\d+/g, ' num ')
      .split(/\s+/)
      .filter(w => w.length > 1 && !STOP_WORDS.has(w))
      .map(w => this.stem(w));
  }

  // ── Expandir consulta con sinónimos ───────────────────────────
  expandQuery(text) {
    const lower = this.normalize(text);
    const extra = [];
    for (const [key, syns] of Object.entries(SYNONYMS)) {
      const normKey = this.normalize(key);
      if (lower.includes(normKey)) {
        extra.push(...syns);
      }
      for (const syn of syns) {
        if (lower.includes(this.normalize(syn))) {
          extra.push(key, ...syns.filter(s => s !== syn));
          break;
        }
      }
    }
    return text + ' ' + extra.join(' ');
  }

  // ── Generar bigrams de una lista de tokens ─────────────────────
  bigrams(tokens) {
    const bg = [];
    for (let i = 0; i < tokens.length - 1; i++) {
      bg.push(tokens[i] + '_' + tokens[i + 1]);
    }
    return bg;
  }

  // ── Tokenizar con bigrams ──────────────────────────────────────
  tokenizeWithBigrams(text) {
    const uni = this.tokenize(text);
    return [...uni, ...this.bigrams(uni)];
  }

  // ── Parsear corpus formato P:/R: ──────────────────────────────
  parseCorpus(corpusText) {
    const items = [];
    const lines = corpusText.split(/\r?\n/);
    let currentQ = null;
    let currentA = [];
    let inQA = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Detectar pregunta
      if (trimmed.startsWith('P:')) {
        // Guardar el par anterior si existe
        if (currentQ && currentA.length > 0) {
          items.push({
            question: currentQ,
            answer:   currentA.join('\n').trim()
          });
        }
        currentQ = trimmed.replace(/^P:\s*/, '').replace(/[¿?]/g, '').trim();
        currentA = [];
        inQA = true;
        continue;
      }

      // Detectar respuesta
      if (trimmed.startsWith('R:') && inQA) {
        currentA.push(trimmed.replace(/^R:\s*/, '').trim());
        continue;
      }

      // Continuación de respuesta (línea con guión o contenido)
      if (inQA && currentQ && trimmed.length > 0 &&
          !trimmed.startsWith('=') && !trimmed.startsWith('P:') &&
          !trimmed.startsWith('SECCIÓN') && !trimmed.startsWith('CORPUS') &&
          !trimmed.startsWith('Versión') && !trimmed.startsWith('INSTRUCCIÓN')) {
        if (currentA.length > 0) {
          currentA.push(trimmed);
        }
        continue;
      }

      // Línea separadora: guardar par
      if (trimmed.startsWith('===') || trimmed.startsWith('SECCIÓN')) {
        if (currentQ && currentA.length > 0) {
          items.push({
            question: currentQ,
            answer:   currentA.join('\n').trim()
          });
          currentQ = null;
          currentA = [];
          inQA = false;
        }
      }
    }

    // Último par
    if (currentQ && currentA.length > 0) {
      items.push({
        question: currentQ,
        answer:   currentA.join('\n').trim()
      });
    }

    return items;
  }

  // ── Construir índice BM25 ─────────────────────────────────────
  // BM25 es más preciso que TF-IDF clásico para preguntas cortas
  // k1 = 1.5, b = 0.75 (parámetros estándar)
  async build(corpusText) {
    // 1. Parsear pares Q&A
    this.qaItems = this.parseCorpus(corpusText);
    console.log(`📚 Pares Q&A parseados: ${this.qaItems.length}`);

    // 2. Crear documentos combinados (pregunta + respuesta) para mejor matching
    const allDocs = this.qaItems.map(item =>
      item.question + ' ' + item.question + ' ' + item.answer  // pregunta duplicada para mayor peso
    );

    // 3. Tokenizar todos los documentos
    const tokenizedDocs = allDocs.map(d => this.tokenizeWithBigrams(this.expandQuery(d)));
    const N = tokenizedDocs.length;

    // 4. Calcular DF (document frequency)
    const df = new Map();
    const docLengths = [];

    for (const tokens of tokenizedDocs) {
      docLengths.push(tokens.length);
      const seen = new Set(tokens);
      for (const t of seen) {
        df.set(t, (df.get(t) || 0) + 1);
      }
    }

    const avgDocLen = docLengths.reduce((a, b) => a + b, 0) / N;

    // 5. Construir vocabulario
    let idx = 0;
    for (const term of df.keys()) {
      this.vocabulary.set(term, idx++);
    }

    // 6. Calcular IDF (BM25)
    this.idf = new Float32Array(idx);
    for (const [term, freq] of df.entries()) {
      const i = this.vocabulary.get(term);
      // IDF con suavizado Robertson
      this.idf[i] = Math.log((N - freq + 0.5) / (freq + 0.5) + 1);
    }

    // 7. Construir vectores BM25 para cada documento
    const k1 = 1.5, b = 0.75;
    this.qaVectors = tokenizedDocs.map((tokens, docIdx) => {
      const tf = new Map();
      for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);

      const vec = {};
      const dl = docLengths[docIdx];
      for (const [term, count] of tf.entries()) {
        if (!this.vocabulary.has(term)) continue;
        const i = this.vocabulary.get(term);
        const tfNorm = (count * (k1 + 1)) / (count + k1 * (1 - b + b * dl / avgDocLen));
        const score = this.idf[i] * tfNorm;
        if (score > 0) vec[i] = score;
      }
      return vec;
    });

    this.ready = true;
    console.log(`✅ NLP v2 listo: ${N} Q&A, ${idx} términos en vocabulario`);
  }

  // ── Vectorizar consulta del usuario ──────────────────────────
  vectorize(text) {
    const expanded = this.expandQuery(text);
    const tokens   = this.tokenizeWithBigrams(expanded);
    if (tokens.length === 0) return {};

    const tf = new Map();
    for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);

    const vec = {};
    for (const [term, count] of tf.entries()) {
      if (!this.vocabulary.has(term)) continue;
      const i = this.vocabulary.get(term);
      vec[i] = (count / tokens.length) * this.idf[i];
    }
    return vec;
  }

  // ── Similitud coseno ──────────────────────────────────────────
  cosineSim(v1, v2) {
    let dot = 0, n1 = 0, n2 = 0;
    for (const [i, val] of Object.entries(v1)) {
      dot += val * (v2[i] || 0);
      n1  += val * val;
    }
    for (const val of Object.values(v2)) n2 += val * val;
    const denom = Math.sqrt(n1) * Math.sqrt(n2);
    return denom === 0 ? 0 : dot / denom;
  }

  // ── Bonus por coincidencia de keywords exactas ────────────────
  keywordBonus(queryNorm, docText) {
    const docNorm = this.normalize(docText);
    const qTokens = queryNorm.split(/\s+/).filter(w => w.length > 3);
    let matches = 0;
    for (const t of qTokens) {
      if (docNorm.includes(t)) matches++;
    }
    return qTokens.length > 0 ? (matches / qTokens.length) * 0.25 : 0;
  }

  // ── Consulta principal ────────────────────────────────────────
  query(userText) {
    if (!this.ready) {
      return { text: 'El sistema aún está iniciando. Por favor espera.', score: 0 };
    }

    const lower = userText.toLowerCase().trim();
    const normQ  = this.normalize(userText);

    // ── Respuestas conversacionales ──────────────────────────────
    const saludos   = ['hola','buenas','saludos','hey','buenos dias','buenas tardes','buenas noches','buen dia','buenas dia'];
    const despedidas= ['adios','chau','hasta luego','bye','nos vemos','hasta pronto'];
    const gracias   = ['gracias','muchas gracias','te agradezco','mil gracias','genial gracias'];
    const sobreMi   = ['quien eres','que eres','que haces','para que sirves','como funcionas','que puedes'];

    if (saludos.some(g => lower.includes(g))) {
      const opts = [
        '¡Hola! Soy **Tutoris**, tu asistente académico de la UNSAAC. Puedo ayudarte con:\n- 📚 Malla curricular y cursos\n- 📋 Reglamentos académicos\n- 🎓 Becas y movilidad estudiantil\n- 👩‍🏫 Sistema de tutoría\n- 💼 Prácticas pre profesionales\n\n¿Qué deseas saber?',
        '¡Bienvenido/a! Soy **Tutoris**. Estoy aquí para orientarte en todo lo académico de Ingeniería Informática y de Sistemas. ¿En qué te ayudo hoy?',
        '¡Hola! Cuéntame tu duda académica y te respondo enseguida. Sé de cursos, notas, becas, trámites, matrícula, tesis y más. 😊'
      ];
      return { text: opts[Math.floor(Math.random() * opts.length)], score: 1 };
    }

    if (despedidas.some(d => lower.includes(d))) {
      return { text: '¡Hasta pronto! 🎓 Mucho éxito en tus estudios. Recuerda que puedes volver cuando necesites orientación académica.', score: 1 };
    }

    if (gracias.some(t => lower.includes(t))) {
      const opts = [
        '¡Con gusto! Si tienes más dudas, aquí estoy. 😊',
        '¡De nada! Fue un placer ayudarte. ¿Hay algo más en lo que pueda orientarte?',
        '¡Para eso estoy! No dudes en preguntarme más cosas. 🎓'
      ];
      return { text: opts[Math.floor(Math.random() * opts.length)], score: 1 };
    }

    if (sobreMi.some(s => normQ.includes(s))) {
      return {
        text: 'Soy **Tutoris**, el asistente académico virtual de la Escuela Profesional de Ingeniería Informática y de Sistemas de la **UNSAAC** (Universidad Nacional San Antonio Abad del Cusco).\n\nFui creado para ayudarte con información sobre la malla curricular, reglamentos, tutorías, becas, movilidad estudiantil, matrícula, prácticas y más.\n\n¿Qué necesitas saber?',
        score: 1
      };
    }

    // ── Búsqueda semántica Q&A ───────────────────────────────────
    const queryVec = this.vectorize(userText);
    const isEmpty  = Object.keys(queryVec).length === 0;

    if (isEmpty) {
      return {
        text: 'No pude entender bien tu consulta. ¿Puedes escribirla de otra manera? Por ejemplo:\n- "¿Cuántos créditos necesito para las prácticas?"\n- "¿Qué pasa si jalo un curso?"\n- "¿Qué becas existen?"',
        score: 0
      };
    }

    // Calcular scores para todos los pares Q&A
    let results = this.qaVectors.map((vec, i) => {
      const sim   = this.cosineSim(queryVec, vec);
      const bonus = this.keywordBonus(normQ, this.qaItems[i].question);
      return { idx: i, score: sim + bonus };
    });

    // Ordenar por score descendente
    results.sort((a, b) => b.score - a.score);

    const best = results[0];
    const THRESHOLD = 0.08;

    if (best.score < THRESHOLD) {
      return {
        text: 'No encontré información específica sobre eso en el corpus académico de la UNSAAC. Te sugiero:\n- 🏛️ Consultar en la **Dirección de Escuela Profesional**\n- 💻 Revisar la plataforma **PLADDES** de la UNSAAC\n- 📞 Llamar a Bienestar Universitario: **084-232398**\n\n¿Puedes reformular tu pregunta?',
        score: 0
      };
    }

    // ── Formatear respuesta ───────────────────────────────────────
    const item = this.qaItems[best.idx];
    let response = item.answer.trim();

    // Capitalizar primera letra
    response = response.charAt(0).toUpperCase() + response.slice(1);

    // Si hay una segunda coincidencia muy cercana con info complementaria,
    // agregarla si no es la misma sección
    if (results[1] && results[1].score > THRESHOLD * 1.5 &&
        results[1].score > best.score * 0.75 &&
        results[1].idx !== best.idx) {
      const second = this.qaItems[results[1].idx];
      // Solo agregar si la respuesta no es muy larga
      if (response.length < 300 && second.answer.length < 200) {
        response += '\n\n📌 **Información relacionada:** ' + second.answer.trim();
      }
    }

    // Indicador de confianza
    const confidence = best.score > 0.4 ? '' : '\n\n_Si esta respuesta no es lo que buscabas, intenta reformular tu pregunta._';

    return { text: response + confidence, score: best.score };
  }
}

window.NLPEngine = NLPEngine;
