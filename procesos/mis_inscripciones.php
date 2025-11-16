<?php
session_start();
require_once __DIR__ . '/../configuracion/conexion.php';

header('Content-Type: application/json');

// Obtener el ID del usuario desde la solicitud
$usuario_id = $_GET['usuario_id'] ?? $_POST['usuario_id'] ?? '';

if (empty($usuario_id)) {
    echo json_encode([
        "success" => false,
        "message" => "ID de usuario requerido"
    ]);
    exit;
}

try {
    // Consulta para obtener los eventos en los que el usuario está inscrito
    $stmt = $conn->prepare("
        SELECT 
            e.id_evento,
            e.nombre_evento as title,
            e.fecha_hora as date,
            e.lugar as location,
            e.descripcion_corta,
            a.fecha_inscripcion
        FROM asiste a
        INNER JOIN evento e ON a.evento_id = e.id_evento
        INNER JOIN participante p ON a.participante_id = p.id_participante
        WHERE p.usuario_id = :usuario_id
        ORDER BY e.fecha_hora ASC
    ");
    
    $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
    $stmt->execute();
    $inscripciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true,
        "inscripciones" => $inscripciones,
        "total" => count($inscripciones)
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al obtener inscripciones: " . $e->getMessage()
    ]);
}
?>