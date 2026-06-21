# Repositorio de Conocimientos — Tutoris

Repositorio de conocimiento de la Escuela Profesional de Ingeniería
Informática y de Sistemas (EPIIS) — Universidad Nacional de San Antonio
Abad del Cusco (UNSAAC), construido para el chatbot **Tutoris**.

Este repositorio implementa el almacenamiento, la organización y la
trazabilidad del conocimiento institucional (normativa de tutorías,
malla curricular, prácticas pre profesionales, becas, trámites
académicos, etc.) que el chatbot consulta mediante un motor de
recuperación basado en TF-IDF y similitud coseno.

## Estructura

```
tutoris-repositorio-conocimiento/
├── corpus.txt              ← Corpus completo (el que usa nlp-engine.js, sin modificar)
├── corpus/                 ← El mismo corpus, dividido por categoría temática
│   ├── 01_tutoria_academica.txt
│   ├── 02_practicas_pre_profesionales.txt
│   ├── 03_malla_curricular.txt
│   ├── 04_bienestar_universitario.txt
│   ├── 05_movilidad_estudiantil.txt
│   ├── 06_becas.txt
│   ├── 07_matricula.txt
│   ├── 08_matricula_condicionada.txt
│   ├── 09_evaluacion_aprendizaje.txt
│   ├── 10_convalidacion.txt
│   ├── 11_grados_titulos.txt
│   └── 12_cursos_desaprobados.txt
├── fuentes/
│   ├── fuentes.json                       ← Trazabilidad: categoría → documento normativo
│   ├── Estatuto_UNSAAC_2022.pdf           ← Incluido
│   ├── Reglamento_Tutorias_UNSAAC.pdf     ← Pendiente de agregar
│   ├── Plan_Curricular_2024_EPIIS.pdf     ← Pendiente de agregar
│   └── Reglamento_Academico_UNSAAC.pdf    ← Pendiente de agregar
├── docs/
│   └── documentacion_tecnica_tutoris.md   ← Arquitectura, motor NLP, componentes del sistema
└── src/                                    ← Código fuente del chatbot (pendiente de agregar)
```

## ¿Por qué dos versiones del corpus?

- **`corpus.txt`** es el archivo único que consume `nlp-engine.js` en
  tiempo de ejecución (no se modifica, para no romper el sistema ya
  desplegado).
- **`corpus/`** es la misma información dividida por categoría, pensada
  para la documentación, el mantenimiento y la trazabilidad: facilita
  ubicar y actualizar el conocimiento de un tema específico sin tener
  que editar un archivo de más de 1300 líneas.

## Fuentes oficiales

El conocimiento de este repositorio proviene de cuatro documentos
normativos de la UNSAAC:

1. **Estatuto Universitario** (actualizado, 2022) — incluido en `fuentes/`.
2. **Reglamento de Tutorías** — pendiente de agregar.
3. **Plan Curricular 2024 - EPIIS** — pendiente de agregar.
4. **Reglamento Académico** — pendiente de agregar.

`fuentes/fuentes.json` mapea cada categoría del corpus a su fuente
normativa principal. Las categorías derivadas directamente del Estatuto
(matrícula condicionada, cursos desaprobados) están verificadas línea
por línea contra el PDF incluido; las demás están asignadas por tema y
deben verificarse cuando se agreguen los 3 documentos pendientes.

## Componente sensible: matrícula condicionada y cursos desaprobados

Las categorías `08_matricula_condicionada.txt` y
`12_cursos_desaprobados.txt` documentan el régimen de consecuencias por
desaprobación reiterada de una asignatura (Art. 214° del Estatuto): desde
la asignación obligatoria de un tutor hasta la suspensión o separación
del estudiante. Esta información es la base normativa del problema
descrito en el artículo del proyecto (Sección I-B): la tutoría no solo
implica orientación académica general, sino también una posible
exposición de información sensible para el estudiante.

