# Mi plan alimentario / Il mio piano alimentare

Sitio web **estático, mobile-first, bilingüe** (español e italiano) para consultar los seis días de un plan alimentario anónimo. No necesita backend, cuentas, base de datos ni compilación.

## Publicación en GitHub Pages

1. Crear un repositorio de GitHub (o utilizar uno destinado exclusivamente a esta web).
2. Copiar **todo el contenido** de esta carpeta a la raíz del repositorio (conservar `data/`, `css/`, `js/` e `icons/`).
3. En el repositorio, entrar en **Settings → Pages → Build and deployment**.
4. Elegir **Deploy from a branch**, seleccionar la rama (generalmente `main`) y la carpeta **`/(root)`**, y guardar.
5. Visitar la dirección que GitHub muestre al completar la publicación.

El sitio funciona en subdirectorios de GitHub Pages, porque utiliza rutas relativas. Para comprobarlo localmente, iniciar un servidor web estático desde la carpeta del proyecto: `python -m http.server 8000`, y abrir `http://localhost:8000`. Abrir `index.html` mediante `file://` no permite cargar `data/plan.json` en algunos navegadores.

## Secciones

- **Día / Giorno**: cinco momentos alimentarios en el orden original, con ingredientes y alternativas. Muestra además los alimentos e indicaciones del apartado «Durante la giornata» donde existe.
- **Semana / Settimana**: vista general de lunes a sábado.
- **Preparaciones / Preparazioni**: recetas, notas de preparación e indicaciones generales.
- **Alimentos / Alimenti**: catálogo buscable de todos los alimentos, incluidos los que aparecen únicamente como alternativas, con las sustituciones específicas por día y comida.

El botón **ES / IT** cambia de idioma instantáneamente en todas las secciones. Las elecciones de sustituciones y la preferencia de idioma se guardan **solo en el navegador local** (`localStorage`). Se pueden borrar eliminando los datos del sitio en el navegador. No se almacenan historiales de consumo ni otros datos de la persona usuaria.

Se puede instalar como aplicación web progresiva en navegadores compatibles. Tras una primera visita, los recursos estáticos se guardan para funcionar sin conexión, según el soporte del navegador.

## Fidelidad al documento

El archivo `data/plan.json` contiene los **seis días**, el orden original de las cinco comidas, las cantidades de los alimentos principales, las sustituciones con sus **cantidades particulares** y las instrucciones disponibles. Las marcas comerciales se mantienen cuando aparecen en las denominaciones de alimentos, pero no se incluyen datos identificatorios de pacientes o profesionales.

Particularidades preservadas:

- **Lunes:** la merienda tiene alternativas diferentes de otros días.
- **Martes:** la indicación sobre aumentar el pescado no fija cantidad; no se inventa.
- **Jueves:** el maíz dulce de 30 g y el yogur griego de 60 g figuran «Durante el día», sin asignarles un momento de consumo; la observación sobre pasta y zucchini se conserva como sugerencia y el arroz sigue siendo el alimento principal de la tabla.
- **Sábado:** se muestra la preparación de pancakes separada de las entradas de café **100 g** y **40 g** (ambas están en el original); la sección de colación dice «sin colación» pero incluye café de **40 g** en el listado; no se asigna tamaño a «una pizza semplice».
- Las instrucciones generales y el apartado de hidratación aparecen **solo de lunes a viernes**.
- Las cantidades de recetas no explicitadas no se rellenan artificialmente.

La aplicación reproduce las indicaciones del documento sin validar sus afirmaciones clínicas. No calcula calorías ni propone sustituciones nuevas.

## Archivos

- `index.html`: estructura y accesibilidad.
- `css/styles.css`: presentación adaptable, diseñada primero para móviles.
- `js/app.js`: navegación, traducciones, búsqueda, alternativas y preferencias.
- `data/plan.json`: contenido dietético y recetas, en italiano y español.
- `manifest.webmanifest`, `sw.js` e `icons/`: instalación y acceso offline.

## Actualización de contenido

Editar `data/plan.json`. Después de publicar una actualización, **cambiar la versión** de la constante `CACHE` en `sw.js` (p. ej. `plan-alimentario-static-v2`) para obligar a que los dispositivos recuperen los archivos actualizados en su próxima visita con conexión. El programa no requiere dependencias externas.
