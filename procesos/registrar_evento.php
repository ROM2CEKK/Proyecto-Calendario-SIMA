<?php
session_start();
require_once __DIR__ . '/../configuracion/conexion.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Recibir datos del formulario - CORREGIDOS para tu BD
    $organizador_id = $_POST['organizador_id'] ?? 1;
    $nombre_evento = $_POST['nombre_evento'] ?? '';
    $fecha_hora = $_POST['fecha_hora'] ?? '';
    $lugar = $_POST['lugar'] ?? '';
    $descripcion_corta = $_POST['descripcion_corta'] ?? '';
    $descripcion_larga = $_POST['descripcion_larga'] ?? '';
    $cupos = $_POST['cupos'] ?? 50;
    $costo = $_POST['costo'] ?? 0;
    $invitado = $_POST['invitado'] ?? '';
    $estado = $_POST['estado'] ?? 'activo';
    $tipo_evento = $_POST['tipo_evento'] ?? 'general';
    $imagen_url = $_POST['imagen_url'] ?? '';

    // Calcular cupos disponibles (inicialmente igual a cupos)
    $cupos_disponibles = $cupos;

    try {
        // Obtener nombre del organizador
        $stmt_org = $conn->prepare("SELECT nombre FROM usuarios WHERE id_usuario = :organizador_id");
        $stmt_org->bindParam(':organizador_id', $organizador_id);
        $stmt_org->execute();
        $organizador = $stmt_org->fetch(PDO::FETCH_ASSOC);
        $organizador_nombre = $organizador['nombre'] ?? '';

        // Insertar evento en la base de datos - CORREGIDO para tabla "evento"
        $stmt = $conn->prepare("INSERT INTO evento 
                               (organizador_id, nombre_evento, fecha_hora, lugar, descripcion_corta, 
                                descripcion_larga, cupos, cupos_disponibles, costo, invitado, estado, 
                                tipo_evento, imagen_url, organizador_nombre) 
                               VALUES 
                               (:organizador_id, :nombre_evento, :fecha_hora, :lugar, :descripcion_corta, 
                                :descripcion_larga, :cupos, :cupos_disponibles, :costo, :invitado, :estado, 
                                :tipo_evento, :imagen_url, :organizador_nombre)");
        
        $stmt->bindParam(':organizador_id', $organizador_id);
        $stmt->bindParam(':nombre_evento', $nombre_evento);
        $stmt->bindParam(':fecha_hora', $fecha_hora);
        $stmt->bindParam(':lugar', $lugar);
        $stmt->bindParam(':descripcion_corta', $descripcion_corta);
        $stmt->bindParam(':descripcion_larga', $descripcion_larga);
        $stmt->bindParam(':cupos', $cupos);
        $stmt->bindParam(':cupos_disponibles', $cupos_disponibles);
        $stmt->bindParam(':costo', $costo);
        $stmt->bindParam(':invitado', $invitado);
        $stmt->bindParam(':estado', $estado);
        $stmt->bindParam(':tipo_evento', $tipo_evento);
        $stmt->bindParam(':imagen_url', $imagen_url);
        $stmt->bindParam(':organizador_nombre', $organizador_nombre);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Evento creado exitosamente"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error al crear evento"]);
        }
        
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error de base de datos: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
}
?>