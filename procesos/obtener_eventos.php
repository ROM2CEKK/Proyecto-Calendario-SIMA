<?php
require_once __DIR__ . '/../configuracion/conexion.php';

header('Content-Type: application/json');

try {
    // Consulta para obtener eventos activos
    $stmt = $conn->prepare("
        SELECT 
            e.id_evento,
            e.organizador_id,
            e.nombre_evento,
            e.fecha_hora,
            e.lugar,
            e.descripcion_corta,
            e.descripcion_larga,
            e.cupos,
            e.cupos_disponibles,
            e.costo,
            e.invitado,
            e.estado,
            e.tipo_evento,
            e.imagen_url,
            e.organizador_nombre,
            e.fecha_creacion,
            COUNT(a.participante_id) as inscritos
        FROM evento e
        LEFT JOIN asiste a ON e.id_evento = a.evento_id
        WHERE e.estado = 'activo'
        GROUP BY e.id_evento
        ORDER BY e.fecha_hora ASC
    ");
    
    $stmt->execute();
    $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true,
        "eventos" => $eventos,
        "total" => count($eventos)
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al obtener eventos: " . $e->getMessage()
    ]);
}
?>