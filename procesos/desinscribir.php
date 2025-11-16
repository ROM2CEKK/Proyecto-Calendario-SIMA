<?php
session_start();
require_once __DIR__ . '/../configuracion/conexion.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $id_evento = $_POST['id_evento'] ?? '';
    $id_usuario = $_POST['id_usuario'] ?? '';

    // Validar IDs
    if (!is_numeric($id_evento) || !is_numeric($id_usuario)) {
        echo "Error: IDs inválidos";
        exit;
    }

    $id_evento = (int)$id_evento;
    $id_usuario = (int)$id_usuario;

    try {
        // Buscar el participante_id basado en el usuario_id
        $stmt = $conn->prepare("SELECT id_participante FROM participante WHERE usuario_id = :usuario_id");
        $stmt->bindParam(':usuario_id', $id_usuario, PDO::PARAM_INT);
        $stmt->execute();
        $participante = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$participante) {
            echo "No se encontró el participante";
            exit;
        }

        $participante_id = $participante['id_participante'];

        // Verificar que existe la inscripción
        $stmt = $conn->prepare("SELECT * FROM asiste WHERE evento_id = :evento_id AND participante_id = :participante_id");
        $stmt->bindParam(':evento_id', $id_evento, PDO::PARAM_INT);
        $stmt->bindParam(':participante_id', $participante_id, PDO::PARAM_INT);
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            echo "No estás inscrito en este evento";
            exit;
        }

        // Eliminar la inscripción
        $stmt = $conn->prepare("DELETE FROM asiste WHERE evento_id = :evento_id AND participante_id = :participante_id");
        $stmt->bindParam(':evento_id', $id_evento, PDO::PARAM_INT);
        $stmt->bindParam(':participante_id', $participante_id, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            // Actualizar cupos disponibles
            $stmt = $conn->prepare("UPDATE evento SET cupos_disponibles = cupos_disponibles + 1 WHERE id_evento = :evento_id");
            $stmt->bindParam(':evento_id', $id_evento, PDO::PARAM_INT);
            $stmt->execute();
            
            echo "Desinscripción exitosa";
        } else {
            echo "Error al desinscribirse";
        }
        
    } catch (PDOException $e) {
        echo "Error de base de datos: " . $e->getMessage();
    }
} else {
    echo "Método no permitido";
}
?>