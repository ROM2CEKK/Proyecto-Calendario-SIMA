<?php
session_start();
require_once __DIR__ . '/../configuracion/conexion.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $id_evento = $_POST['id_evento'] ?? '';
    $id_usuario = $_POST['id_usuario'] ?? '';

    // Validar que los IDs sean números válidos
    if (!is_numeric($id_evento) || !is_numeric($id_usuario)) {
        echo "Error: IDs de evento o usuario inválidos";
        exit;
    }

    // Convertir a enteros
    $id_evento = (int)$id_evento;
    $id_usuario = (int)$id_usuario;

    try {
        // Verificar si ya está inscrito
        $stmt = $conn->prepare("SELECT participante_id FROM asiste WHERE evento_id = :evento_id AND participante_id = :usuario_id");
        $stmt->bindParam(':evento_id', $id_evento, PDO::PARAM_INT);
        $stmt->bindParam(':usuario_id', $id_usuario, PDO::PARAM_INT);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            echo "Ya estás inscrito en este evento";
            exit;
        }

        // Verificar si el usuario existe en la tabla participante
        $stmt = $conn->prepare("SELECT id_participante FROM participante WHERE usuario_id = :usuario_id");
        $stmt->bindParam(':usuario_id', $id_usuario, PDO::PARAM_INT);
        $stmt->execute();
        $participante = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $id_participante = null;
        
        if ($participante) {
            // Si ya existe en participante, usar ese ID
            $id_participante = $participante['id_participante'];
        } else {
            // Si no existe, crear un nuevo registro en participante
            $stmt_user = $conn->prepare("SELECT nombre, email FROM usuarios WHERE id_usuario = :usuario_id");
            $stmt_user->bindParam(':usuario_id', $id_usuario, PDO::PARAM_INT);
            $stmt_user->execute();
            $usuario = $stmt_user->fetch(PDO::FETCH_ASSOC);
            
            if ($usuario) {
                $stmt_part = $conn->prepare("INSERT INTO participante (usuario_id, nombre, correo) VALUES (:usuario_id, :nombre, :correo) RETURNING id_participante");
                $stmt_part->bindParam(':usuario_id', $id_usuario, PDO::PARAM_INT);
                $stmt_part->bindParam(':nombre', $usuario['nombre']);
                $stmt_part->bindParam(':correo', $usuario['email']);
                $stmt_part->execute();
                
                $nuevo_participante = $stmt_part->fetch(PDO::FETCH_ASSOC);
                $id_participante = $nuevo_participante['id_participante'];
            }
        }

        if (!$id_participante) {
            echo "Error: No se pudo crear el participante";
            exit;
        }

        // Verificar cupos disponibles
        $stmt = $conn->prepare("SELECT cupos_disponibles FROM evento WHERE id_evento = :evento_id");
        $stmt->bindParam(':evento_id', $id_evento, PDO::PARAM_INT);
        $stmt->execute();
        $evento = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$evento) {
            echo "Evento no encontrado";
            exit;
        }
        
        if ($evento['cupos_disponibles'] <= 0) {
            echo "No hay cupos disponibles para este evento";
            exit;
        }

        // Obtener datos del usuario y evento
        $stmt_user = $conn->prepare("SELECT nombre, email FROM usuarios WHERE id_usuario = :usuario_id");
        $stmt_user->bindParam(':usuario_id', $id_usuario, PDO::PARAM_INT);
        $stmt_user->execute();
        $usuario = $stmt_user->fetch(PDO::FETCH_ASSOC);

        $stmt_evento = $conn->prepare("SELECT nombre_evento, fecha_hora FROM evento WHERE id_evento = :evento_id");
        $stmt_evento->bindParam(':evento_id', $id_evento, PDO::PARAM_INT);
        $stmt_evento->execute();
        $evento_info = $stmt_evento->fetch(PDO::FETCH_ASSOC);

        // Insertar inscripción en tabla "asiste"
        $stmt = $conn->prepare("INSERT INTO asiste 
                               (evento_id, participante_id, participante_nombre, participante_correo, evento_nombre, evento_fecha) 
                               VALUES 
                               (:evento_id, :participante_id, :participante_nombre, :participante_correo, :evento_nombre, :evento_fecha)");
        
        $stmt->bindParam(':evento_id', $id_evento, PDO::PARAM_INT);
        $stmt->bindParam(':participante_id', $id_participante, PDO::PARAM_INT);
        $stmt->bindParam(':participante_nombre', $usuario['nombre']);
        $stmt->bindParam(':participante_correo', $usuario['email']);
        $stmt->bindParam(':evento_nombre', $evento_info['nombre_evento']);
        $stmt->bindParam(':evento_fecha', $evento_info['fecha_hora']);
        
        if ($stmt->execute()) {
            // Actualizar cupos disponibles
            $stmt = $conn->prepare("UPDATE evento SET cupos_disponibles = cupos_disponibles - 1 WHERE id_evento = :evento_id");
            $stmt->bindParam(':evento_id', $id_evento, PDO::PARAM_INT);
            $stmt->execute();
            
            echo "Inscripción exitosa";
        } else {
            echo "Error al inscribirse";
        }
        
    } catch (PDOException $e) {
        echo "Error de base de datos: " . $e->getMessage();
    }
} else {
    echo "Método no permitido";
}
?>