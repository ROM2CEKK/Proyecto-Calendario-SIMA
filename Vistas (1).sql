-- Vista de detalles de los eventos
CREATE VIEW vista_eventos_detalle AS
SELECT 
    e.id_evento,
    e.nombre_evento,
    e.fecha_hora,
    e.lugar,
    e.descripcion_corta,
    e.imagen_url,
    o.nombre AS organizador,
    est.estado AS estado_evento
FROM evento e
JOIN organizador o ON e.id_organizador = o.id_organizador
LEFT JOIN estado_evento est ON e.id_estado = est.id;

-- Vista de participantes por evento
CREATE VIEW vista_participantes_evento AS
SELECT 
    e.nombre_evento,
    p.nombre AS participante,
    p.correo,
    ep.estado AS estado_participacion,
    a.pago
FROM asiste a
JOIN participante p ON a.id_participante = p.id_participante
JOIN evento e ON a.id_evento = e.id_evento
JOIN estado_participacion ep ON a.id_estado_participacion = ep.id;

-- Vista de eventos por participante
CREATE VIEW vista_eventos_participante AS
SELECT 
    p.nombre AS participante,
    e.nombre_evento,
    e.fecha_hora,
    e.lugar,
    ee.estado AS estado_evento,
    ep.estado AS estado_participacion,
    a.pago
FROM asiste a
JOIN participante p ON a.id_participante = p.id_participante
JOIN evento e ON a.id_evento = e.id_evento
JOIN estado_evento ee ON e.id_estado = ee.id
JOIN estado_participacion ep ON a.id_estado_participacion = ep.id;

-- Vista de eventos proximos
CREATE VIEW vista_eventos_proximos AS
SELECT 
    e.id_evento,
    e.nombre_evento,
    e.fecha_hora,
    e.lugar,
    o.nombre AS organizador
FROM evento e
JOIN organizador o ON e.id_organizador = o.id_organizador
WHERE e.fecha_hora >= NOW()
  AND e.id_estado = (SELECT id FROM estado_evento WHERE estado = 'activo');