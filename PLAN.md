# Global Searchbar + Dashboard Universal Results (Grouped + Deep Navigation)

## Summary
Unificaremos un solo searchbar global en `Layout`, manteniendo comportamiento contextual en módulos, y en `Dashboard` lo convertiremos en buscador universal agrupado por entidades.  
En Dashboard, la búsqueda consultará: módulos, cursos, secciones, estudiantes y profesores.  
Al hacer click en un resultado, se navegará a la ruta correspondiente con deep-link por query params para abrir el estado correcto (incluyendo sección y estudiante expandido).

## Functional Goal (locked)
1. Searchbar única global para toda la app.
2. Funcionalidad contextual por módulo se mantiene.
3. En Dashboard, la búsqueda muestra resultados agrupados en vivo.
4. Click en resultado redirige al módulo/ruta correcta.
5. Click en sección abre `Courses` en sección específica.
6. Click en estudiante abre `Students` filtrado por criterio (`q`) y expandido en el estudiante seleccionado.
7. Activación teclado: type-to-search fuera de inputs + shortcut `/`.

## Grouping and Result Rules
1. Orden de grupos: `Modules`, `Courses`, `Sections`, `Students`, `Professors`.
2. Matching: usar `matchesSearch(...)` con normalización actual.
3. Ranking interno por grupo:
   1. `startsWith` en campo principal.
   2. `includes` en campos secundarios.
   3. desempate alfabético.
4. Límite por grupo: 6 resultados visibles por defecto.
5. Empty state: mostrar “No results” cuando no haya coincidencias.
6. Sections label format: `Course Name - Section Name` (consistente con seed naming).

## Navigation Contracts (deep-link URL)
1. Module result:
   1. `/attendance`, `/courses`, `/students`, `/professors`, `/schedule`, `/payments`.
2. Course result:
   1. `/courses?q=<query>&courseId=<courseId>`
   2. Abre vista `sections` del curso seleccionado.
3. Section result:
   1. `/courses?q=<query>&courseId=<courseId>&sectionId=<sectionId>`
   2. Abre vista `sectionDetails`.
4. Student result:
   1. `/students?q=<query>&studentId=<studentId>`
   2. Aplica filtro con `q`, expande fila de `studentId`.
5. Professor result:
   1. `/professors?q=<query>`.

## Implementation Plan

### 1) Global Search State and UI Shell
1. Crear `src/shared/hooks/useGlobalSearch.tsx`:
   1. Estado: `query`, `setQuery`, `clearQuery`, `placeholder`, `setPlaceholder`.
   2. Refs: `inputRef`, `focusSearch`.
   3. Flags: `isEnabled`, `setEnabled`.
2. Envolver router en `GlobalSearchProvider` en `src/App.tsx`.
3. Renderizar searchbar única en `src/shared/components/Layout.tsx` arriba de `<Outlet />`.
4. Reset query al cambiar `location.pathname`.
5. Mantener placeholder por defecto por ruta y permitir override desde módulo activo.

### 2) Keyboard Activation
1. En `Layout` o hook global:
   1. Si tecla imprimible fuera de campos editables, focus search + append carácter.
   2. Si tecla `/` fuera de campos editables, `preventDefault()` + focus search.
2. No interceptar si target está en `input`, `textarea`, `select`, `contenteditable`, o controles de modal.

### 3) Dashboard Universal Search Engine
1. Nuevo hook `src/features/dashboard/useDashboardUniversalSearch.ts`:
   1. Lee `courses`, `sections`, `students`, `professors` desde `StorageService`.
   2. Construye grupos y aplica ranking.
   3. Incluye grupo `Modules` (catálogo estático alineado al sidebar).
2. Integrar en `src/features/dashboard/Dashboard.tsx`:
   1. Consumir `query` global.
   2. Si hay `query`, renderizar dropdown/panel de resultados agrupados bajo la searchbar global.
   3. Cada item ejecuta `navigate(...)` con contratos de URL definidos.
3. No filtrar cards/KPIs del dashboard; solo mostrar panel de resultados.

### 4) Query Param Consumers (deep-link open state)
1. `src/features/courses/Courses.tsx`:
   1. Leer `q`, `courseId`, `sectionId` desde `useSearchParams`.
   2. Aplicar `q` como search actual.
   3. Si `courseId` válido: `viewMode='sections'` y `selectedCourseId`.
   4. Si `sectionId` válido y pertenece al curso: `viewMode='sectionDetails'` y `selectedSectionId`.
2. `src/features/users/StudentsModule.tsx`:
   1. Recibir `q` y `studentId` desde `Students.tsx` usando `useSearchParams`.
   2. Aplicar filtro de tabla por `q` (nombre formateado, email, phone).
   3. Expandir automáticamente `expandedStudentId=studentId` cuando esté en lista filtrada.
3. `src/features/users/Students.tsx`:
   1. Pasar `searchQuery` y `focusStudentId` como props a `StudentsModule`.
4. `src/features/users/ProfessorsModule.tsx`:
   1. Aplicar filtro por `q` (nombre, email, specialization).

### 5) Preserve Existing Contextual Search in Other Modules
1. `Attendance` mantiene búsqueda contextual actual (courses/sections/students/records).
2. `Schedule` mantiene modo definido previamente por módulo.
3. `Payments` y demás mantienen filtro por `q` si ya fue definido en el plan base global.

### 6) Results UI Details
1. Panel results debe cerrar en:
   1. `Escape`.
   2. click fuera.
   3. navegación por selección.
2. Soporte teclado en resultados:
   1. flechas arriba/abajo.
   2. `Enter` abre resultado activo.
3. Mostrar badge de grupo en cada bloque para claridad.

## Important Public Interfaces / Contracts
1. Nuevo contexto compartido: `useGlobalSearch`.
2. Nuevos query params soportados:
   1. `/courses`: `q`, `courseId`, `sectionId`.
   2. `/students`: `q`, `studentId`.
   3. `/professors`: `q`.
3. Nuevas props internas:
   1. `StudentsModule` acepta `searchQuery?`, `focusStudentId?`.
4. No cambia API de negocio (`StorageService`) ni rutas base del router.

## Test Cases and Scenarios
1. Dashboard universal grouping:
   1. Buscar `att` devuelve grupo Modules con Attendance.
   2. Buscar nombre de curso devuelve en Courses.
   3. Buscar `morning` devuelve en Sections con label `Course - Section`.
2. Navigation from results:
   1. Click `Attendance` -> `/#/attendance`.
   2. Click section -> `/#/courses?courseId=...&sectionId=...&q=...` y abre details.
   3. Click student -> `/#/students?q=...&studentId=...` y fila expandida.
3. Students behavior:
   1. Tabla filtrada por `q`.
   2. `studentId` expandido automáticamente.
4. Keyboard:
   1. Type-to-search funciona fuera de inputs.
   2. `/` enfoca searchbar.
   3. En formularios/modales no roba foco.
5. Route reset:
   1. Query se limpia al cambiar de ruta normal.
   2. En deep-link desde Dashboard, query de URL se aplica en módulo destino.
6. Build/QA:
   1. `npm run build` verde.
   2. Ajustar/añadir Playwright para deep-link section/student.

## Assumptions and Defaults
1. El panel de resultados agrupados se muestra solo en Dashboard.
2. Se mantiene HashRouter y navegación por query params en hash routes.
3. Si `courseId` o `sectionId` no existen, `Courses` cae a vista segura (`courses` o `sections`).
4. Si `studentId` no matchea con filtro `q`, se mantiene filtro por `q` y no forza expansión invisible.
