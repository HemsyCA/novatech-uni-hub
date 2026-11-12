# Base de conocimiento de Nova

Cada archivo `.md` de estas carpetas es una página de **Conocimientos Nova** (solo para miembros).

| Carpeta | Página | ¿Existe sin archivo? |
| --- | --- | --- |
| `categorias/` | `/conocimientos/categorias/<id>` | Sí: salen de la lista de categorías de la web |
| `robots/` | `/conocimientos/robots/<slug>` | Sí: salen de la lista de robots de la web |
| `placas/` | `/conocimientos/placas/<slug>` | No: crea el archivo para agregar una placa |
| `temas/` | `/conocimientos/temas/<slug>` | No |
| `componentes/` | `/conocimientos/componentes/<slug>` | No |

## Cómo se escribe

1. Arriba, entre `---`, van los datos de la página (título, resumen, a qué categorías pertenece…).
2. Debajo, cada `## Apartado` es una sección de la plantilla de ese tipo de página. Escribe el texto
   debajo del título del apartado. **No cambies los títulos**: así la página sabe dónde va cada cosa.
3. Los comentarios `<!-- ... -->` son notas para quien redacta; no se muestran.
4. Un apartado vacío se muestra como "Próximamente", con la nota de qué irá ahí.
5. Se puede usar todo lo de las lecciones de Academia: tablas, avisos (`> **Dato:**`), imágenes
   (```` ```imagen ````), videos (```` ```video ````) y simulaciones (```` ```widget ````).

## Cómo se enlazan las páginas

- Una placa dice qué categorías la usan (`categorias: [...]`); la categoría la muestra sola.
- Un tema o componente dice sus categorías y aparece en "Para profundizar" de esa categoría.
- Una categoría elige su robot más competitivo con `robot_insignia: <slug>`.
- Un robot dice su placa con `placa: <slug>`; la placa lo muestra en "Se usa en".

Así cada cosa se escribe una sola vez y se enlaza desde donde haga falta.

## Los aportes

Los aportes de la Comunidad no van aquí: se envían desde la web (Comunidad → Compartir) y, una vez
aprobados, aparecen solos en la categoría que eligió su autor.
