-- =====================================================================================
--  GUÍA DE DATOS DE NOVATECH: cómo trabajar con Supabase y con el panel de directiva
-- =====================================================================================
--  Para quién: directiva y Área académica. No hace falta saber programar.
--  Este archivo NO se ejecuta completo ni es una migración. Es un guion: se lee de arriba
--  hacia abajo y se copia/pega UN bloque a la vez en Supabase > SQL Editor.
--
--  Todo lo que empieza con "--" es un comentario: Supabase lo ignora, es solo explicación.
--
--  CONTENIDO
--    0. Dónde se hace cada cosa (panel de directiva vs. Supabase)
--    1. Reglas de seguridad (leer SIEMPRE antes de borrar)
--    2. SQL básico: mirar datos (select, count, where, order by, limit)
--    3. Mapa de tablas: qué guarda cada una
--    4. Consultas de revisión del día a día
--    5. Limpieza de datos de prueba de la Academia (paso a paso, explicado)
--    6. Opcional: borrar cuentas de prueba
--    7. Opcional: reinicio total de la Academia
--    8. Opcional: pedidos y reservas de prueba
--    9. Checklist: preparar una nueva convocatoria
-- =====================================================================================


-- =====================================================================================
-- 0. DÓNDE SE HACE CADA COSA
-- =====================================================================================
--  Hay dos lugares para trabajar con los datos. Usa primero el panel de directiva; si
--  no se puede ahí, recién usa Supabase.
--
--  PANEL DE DIRECTIVA (la web, /admin) — lo cotidiano y lo seguro
--    · Convocatoria > Inscripciones ........ aceptar o rechazar solicitudes
--    · Convocatoria > Grupos ............... crear grupos (con fechas), agregar convocados,
--                                            poner fecha de fin individual, quitar convocados,
--                                            eliminar un grupo (borra también a sus convocados)
--    · Convocatoria > Avance / Entregas .... ver el progreso y calificar tareas finales
--    · Convocatoria > Prácticas ............ programar y marcar asistencia (y quitar una cita)
--    · Personas > Miembros ................. agregar o quitar miembros de Nova
--    · Personas > Roles (superadmin) ....... dar o quitar roles de directiva
--    · Servicios > Pedidos / Reservas ...... cambiar estados de pedidos y reservas
--    · Productos, robots, competencias ..... crear, editar, borrar
--    · Comunidad > Aportes ................. aprobar o eliminar aportes
--
--  SUPABASE (el panel de la base de datos) — lo que la web NO permite
--    · Borrar inscripciones, avance de lecciones, fichas, tareas finales o avisos de correo
--    · Borrar una CUENTA de usuario (Authentication > Users)
--    · Borrar archivos subidos (Storage)
--    · Hacer limpiezas masivas, contar o revisar datos con consultas
--    · Ejecutar migraciones nuevas (archivos de la carpeta supabase/migrations)
--
--  REGLA DE ORO: lo que se borra en Supabase NO se puede deshacer. Por eso este guion
--  siempre primero MIRA (select) y solo después BORRA (delete).


-- =====================================================================================
-- 1. REGLAS DE SEGURIDAD (leer siempre antes de borrar)
-- =====================================================================================
--  1) Estás conectado a la base REAL (producción). No hay "papelera".
--  2) Antes de cualquier "delete", corre el mismo filtro con "select" y mira qué filas
--     saldrían. Si el select muestra algo que no esperabas, NO borres.
--  3) Usa transacciones para borrar: se escriben así
--         begin;      -- empieza: nada es definitivo todavía
--         delete ...; -- tus cambios
--         commit;     -- confirma y los hace definitivos
--     Si algo se ve raro antes del commit, en vez de commit escribe:  rollback;
--     y todo vuelve a como estaba.
--  4) Un "delete" SIN "where" borra TODAS las filas de la tabla. Revisa siempre que
--     tenga su "where" (a menos que de verdad quieras vaciar la tabla).
--  5) Copia solo un bloque a la vez. En el SQL Editor, si seleccionas texto, solo corre
--     lo seleccionado; si no seleccionas nada, corre todo lo que hay escrito.
--  6) Los correos van siempre en minúsculas y entre comillas simples: 'persona@gmail.com'
--  7) Si dudas, pregunta antes de correr. Un mensaje a tiempo evita perder datos.
--  8) Antes de una limpieza grande, ve a Supabase > Database > Backups y revisa que haya
--     un respaldo reciente (según el plan, puede no estar disponible).


-- =====================================================================================
-- 2. SQL BÁSICO: MIRAR DATOS
-- =====================================================================================
--  Una "tabla" es como una hoja de Excel: tiene columnas (campos) y filas (registros).
--  SQL es el idioma para pedirle cosas a esas tablas. Estos comandos solo MIRAN, no
--  cambian nada, así que puedes probarlos sin miedo.

-- Ver todo lo que hay en una tabla (limit 20 = solo las primeras 20 filas).
--   select = "muéstrame"   *  = "todas las columnas"   from = "de esta tabla"
select * from public.academia_grupos limit 20;

-- Ver solo algunas columnas.
select nombre, starts_at, ends_at from public.academia_grupos;

-- Contar filas. count(*) = "cuántas filas hay".
select count(*) from public.academia_miembros;

-- Filtrar con "where" (solo las filas que cumplen la condición).
select nombre, email, estado from public.academia_inscripciones where estado = 'pendiente';

-- Ordenar con "order by" (asc = de menor a mayor, desc = de mayor a menor).
select nombre, email, created_at from public.academia_inscripciones order by created_at desc;

-- Combinar condiciones con "and" (y) / "or" (o).
select nombre, email from public.academia_inscripciones where estado = 'pendiente' and ciclo >= 5;

-- Buscar parte de un texto con "ilike" (no distingue mayúsculas). % significa "cualquier cosa".
select * from public.academia_inscripciones where email ilike '%gmail.com';

-- Contar agrupando con "group by": cuántas inscripciones hay por estado.
select estado, count(*) as cantidad from public.academia_inscripciones group by estado;

-- "in (...)" = "está en esta lista"; una "subconsulta" es un select dentro de otro.
-- Ejemplo: avance de las personas cuya cuenta tiene este correo.
select * from public.academia_progreso
where user_id in (select id from auth.users where email = 'persona@gmail.com');
--  Por qué así: el avance guarda el "user_id" (un código largo), no el correo. La
--  subconsulta traduce el correo a su código en la tabla de cuentas (auth.users).

-- Los otros dos comandos que existen (SOLO se usan en las secciones 5 a 8, con cuidado):
--   update tabla set columna = valor where ...;   -> CAMBIA datos existentes
--   delete from tabla where ...;                  -> BORRA filas


-- =====================================================================================
-- 3. MAPA DE TABLAS (qué guarda cada una)
-- =====================================================================================
--  CONVOCATORIA Y ACADEMIA
--    academia_grupos ........... un grupo = nombre + fecha de inicio y fin de acceso
--    academia_miembros ......... los CONVOCADOS: un correo dentro de un grupo
--                                (la columna ends_at_override es la fecha de fin individual)
--    academia_inscripciones .... las SOLICITUDES del formulario de Únete
--                                (estado: 'pendiente', 'aprobada' o 'rechazada')
--    academia_progreso ......... una fila por cada lección completada por cada persona
--    academia_fichas ........... las fichas de la Bitácora Nova que llenó cada persona
--    academia_entregas ......... la tarea final de cada persona
--                                (estado: 'enviada', 'observada' o 'aprobada')
--    academia_practicas ........ la práctica presencial de soldadura de cada persona
--    notificaciones_correo ..... registro de qué correos automáticos ya se enviaron
--                                (si se borra una fila, el correo podría volver a enviarse)
--  PERSONAS
--    auth.users ................ las CUENTAS (correo, fecha de registro). Es una tabla de
--                                Supabase, por eso lleva "auth." en vez de "public."
--    user_roles ................ quién es directiva o superadmin (columnas user_id y role)
--    nova_miembros ............. los correos de miembros de Nova
--  COMUNIDAD
--    aportes ................... aportes enviados por la comunidad (esperan revisión)
--    material_miembros ......... el material publicado en Conocimientos
--  SERVICIOS
--    orders / order_items ...... pedidos de la tienda y los productos de cada pedido
--    print_reservations ........ reservas de impresión 3D
--    products .................. productos de la tienda
--
--  CÓMO SE RELACIONAN: casi todo cuelga de la CUENTA. Si se borra una cuenta
--  (auth.users), Supabase borra solo su avance, fichas, tarea final, práctica, pedidos,
--  reservas y aportes. Eso se llama "borrado en cascada" ("on delete cascade").
--  En cambio, un correo en academia_miembros NO depende de la cuenta: es solo texto.


-- =====================================================================================
-- 4. CONSULTAS DE REVISIÓN DEL DÍA A DÍA (solo miran, no borran)
-- =====================================================================================

-- 4.1 Resumen: cuántas filas hay en cada tabla importante.
select 'academia_grupos' as tabla, count(*) as filas from public.academia_grupos
union all select 'academia_miembros (convocados)', count(*) from public.academia_miembros
union all select 'academia_inscripciones', count(*) from public.academia_inscripciones
union all select 'academia_progreso', count(*) from public.academia_progreso
union all select 'academia_fichas', count(*) from public.academia_fichas
union all select 'academia_entregas', count(*) from public.academia_entregas
union all select 'academia_practicas', count(*) from public.academia_practicas
union all select 'notificaciones_correo', count(*) from public.notificaciones_correo
union all select 'nova_miembros', count(*) from public.nova_miembros
union all select 'aportes', count(*) from public.aportes
union all select 'orders (pedidos)', count(*) from public.orders
union all select 'print_reservations', count(*) from public.print_reservations
union all select 'cuentas (auth.users)', count(*) from auth.users;
--  "union all" pega varios resultados uno debajo de otro, para verlos en una sola tabla.

-- 4.2 Cuentas, su rol y cuánto avance tiene cada una (sirve para distinguir cuentas de prueba).
select u.email,
       u.created_at::date as creada,
       coalesce((select string_agg(r.role::text, ', ') from public.user_roles r where r.user_id = u.id), '—') as rol,
       (select count(*) from public.academia_progreso p where p.user_id = u.id) as lecciones,
       (select count(*) from public.academia_entregas e where e.user_id = u.id) as tarea_final
from auth.users u
order by u.created_at;
--  "coalesce(x, '—')" = "si no hay valor, muestra —".  "string_agg" junta varios roles en un texto.

-- 4.3 Grupos con cuántos convocados tiene cada uno y si siguen vigentes hoy.
select g.nombre, g.starts_at, g.ends_at,
       count(m.id) as convocados,
       (current_date between g.starts_at and g.ends_at) as vigente_hoy
from public.academia_grupos g
left join public.academia_miembros m on m.grupo_id = g.id
group by g.id
order by g.starts_at desc;
--  "left join" une cada grupo con sus convocados, incluso si el grupo no tiene ninguno.

-- 4.4 Solicitudes pendientes de revisar.
select nombre, email, carrera, ciclo, created_at::date as enviada
from public.academia_inscripciones
where estado = 'pendiente'
order by created_at;

-- 4.5 Tareas finales por calificar.
select u.email, e.estado, e.created_at::date as enviada
from public.academia_entregas e
join auth.users u on u.id = e.user_id
where e.estado = 'enviada'
order by e.created_at;
--  "join" une dos tablas por un campo en común (aquí, el código de la cuenta).

-- 4.6 Quiénes tienen rol de directiva o superadmin (esas cuentas NUNCA se deben borrar por error).
select u.email, r.role
from public.user_roles r
join auth.users u on u.id = r.user_id
order by r.role, u.email;


-- =====================================================================================
-- 5. LIMPIEZA DE DATOS DE PRUEBA DE LA ACADEMIA (paso a paso)
-- =====================================================================================
--  Objetivo: dejar la Academia lista para entregarla, sin borrar a las personas reales.
--  Se conservan el grupo, los convocados reales, las inscripciones y todas las cuentas.
--
--  PASO 5.1 · MIRAR primero (sección 4.1 y 4.2 de arriba). Anota qué cuentas son de prueba.
--
--  PASO 5.2 · Borrar el AVANCE de las cuentas de prueba (progreso, fichas, tarea final y
--  práctica). La cuenta y su acceso como convocado quedan intactos: la persona puede volver
--  a empezar de cero. Cambia los correos de la lista por los de PRUEBA y corre todo el bloque.

begin;   -- empieza la transacción: nada es definitivo hasta el "commit"

-- Tabla temporal: una lista de correos que existe solo durante esta transacción
-- ("on commit drop" = se elimina sola al terminar). Así escribes los correos UNA sola vez.
create temporary table _prueba (email text) on commit drop;
insert into _prueba values
  ('prueba1@ejemplo.com');
  -- Para agregar más correos: cambia el ";" de la línea de arriba por una coma
  -- y escribe cada correo así:   , ('prueba2@ejemplo.com')

-- Cada línea borra un tipo de dato SOLO de las cuentas cuyo correo está en la lista:
--   1. busca los códigos (id) de las cuentas con esos correos  -> (select id from auth.users where email in (...))
--   2. borra las filas de esa tabla que pertenezcan a esos códigos
delete from public.academia_progreso  where user_id in (select id from auth.users where email in (select email from _prueba));
delete from public.academia_fichas    where user_id in (select id from auth.users where email in (select email from _prueba));
delete from public.academia_entregas  where user_id in (select id from auth.users where email in (select email from _prueba));
delete from public.academia_practicas where user_id in (select id from auth.users where email in (select email from _prueba));

commit;  -- confirma. (Si dudaste antes de llegar aquí, cambia esta línea por: rollback; )

--  PASO 5.3 · COMPROBAR que quedó limpio (debe salir 0 en todo, solo para esas cuentas):
select u.email,
       (select count(*) from public.academia_progreso  p where p.user_id = u.id) as lecciones,
       (select count(*) from public.academia_fichas    f where f.user_id = u.id) as fichas,
       (select count(*) from public.academia_entregas  e where e.user_id = u.id) as tarea_final,
       (select count(*) from public.academia_practicas x where x.user_id = u.id) as practica
from auth.users u
where u.email in ('prueba1@ejemplo.com');

--  Los archivos que alguien haya subido (si los hay) NO se borran con SQL: ver sección 8.


-- =====================================================================================
-- 6. OPCIONAL: BORRAR CUENTAS DE PRUEBA
-- =====================================================================================
--  Borra la cuenta COMPLETA y, en cascada, todo lo suyo (avance, fichas, pedidos, reservas,
--  aportes...). La persona tendría que registrarse de nuevo. Se puede hacer desde
--  Supabase > Authentication > Users (botón de borrar), o con SQL:
--
--  Primero MIRA a quién vas a borrar:
select id, email, created_at from auth.users where email in ('prueba1@ejemplo.com');

--  Luego borra. La última línea protege a la directiva: nunca borra una cuenta con rol.
-- begin;
-- delete from auth.users
-- where email in ('prueba1@ejemplo.com')
--   and id not in (select user_id from public.user_roles);
-- commit;
--  (Quita los "--" del inicio de cada línea para activarlo.)


-- =====================================================================================
-- 7. OPCIONAL: REINICIO TOTAL DE LA ACADEMIA
-- =====================================================================================
--  SOLO si quieres empezar de cero para TODOS (incluidos convocados reales y directiva).
--  Borra grupos, convocados, inscripciones, avisos de correo y el avance de todas las cuentas.
--  Las cuentas NO se borran. Es irreversible: antes mira la sección 4.1 y confirma.
--
-- begin;
-- delete from public.academia_miembros;        -- convocados
-- delete from public.academia_inscripciones;   -- solicitudes
-- delete from public.academia_grupos;          -- grupos
-- delete from public.notificaciones_correo where tipo in ('inscripcion', 'convocado');
-- delete from public.academia_progreso;
-- delete from public.academia_fichas;
-- delete from public.academia_entregas;
-- delete from public.academia_practicas;
-- -- delete from public.aportes;   -- aportes de Comunidad: déjalo comentado si hay alguno real
-- commit;
--
--  Equivalente desde el panel (sin SQL): Convocatoria > Grupos > eliminar grupo. Eso borra el
--  grupo y sus convocados, pero NO las inscripciones, el avance ni los avisos de correo.


-- =====================================================================================
-- 8. OPCIONAL: PEDIDOS Y RESERVAS DE PRUEBA
-- =====================================================================================
--  Primero cuenta cuántos hay y mira cuáles son:
select (select count(*) from public.orders) as pedidos,
       (select count(*) from public.order_items) as productos_en_pedidos,
       (select count(*) from public.print_reservations) as reservas;

select transaction_code, total, status, created_at::date from public.orders order by created_at desc limit 20;

--  Vaciarlos TODOS (solo cuando ya no haya ninguno real). Primero los productos de cada
--  pedido y luego el pedido, porque un producto de pedido depende de su pedido:
-- begin;
-- delete from public.order_items;
-- delete from public.orders;
-- delete from public.print_reservations;
-- commit;
--
--  También se puede borrar solo lo de una fecha o estado, por ejemplo solo los cancelados:
-- delete from public.orders where status = 'cancelled';
--
--  Los ARCHIVOS 3D de las reservas viven en Supabase > Storage > bucket "print-files".
--  SQL no los borra: entra a Storage y elimina las carpetas a mano. Lo mismo para cualquier
--  archivo que se haya subido en otras partes.
--  Esto también pone en 0 los contadores de Pedidos y Reservas del panel de directiva.


-- =====================================================================================
-- 9. CHECKLIST: PREPARAR UNA NUEVA CONVOCATORIA
-- =====================================================================================
--  1. Revisa el estado actual con la sección 4.1 y 4.3.
--  2. Si hay datos de prueba, límpialos con la sección 5 (y 6 / 8 si hace falta).
--  3. Abre las inscripciones: las personas llenan el formulario de Únete y se registran.
--  4. Panel de directiva > Convocatoria > Inscripciones: acepta o rechaza cada solicitud.
--  5. Panel de directiva > Convocatoria > Grupos: crea el grupo nuevo con su fecha de inicio
--     y de fin (3 semanas de acceso) y agrega los correos de los aceptados.
--     Si alguien necesita más tiempo, ponle una "fecha de fin individual".
--  6. Verifica con 4.3 que el grupo aparece como vigente y con el número de convocados esperado.
--  7. Durante la convocatoria: califica en Entregas y programa en Prácticas.
--  8. Al terminar: el acceso se cierra solo al llegar la fecha de fin. No hace falta borrar nada.
--
--  Nota: el grupo anterior puede quedarse. Solo asegúrate de que sus fechas ya hayan pasado,
--  para que nadie tenga dos accesos a la vez.
