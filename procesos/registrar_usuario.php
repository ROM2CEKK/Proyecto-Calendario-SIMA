<?php
session_start();
require_once __DIR__ . '/../configuracion/conexion.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // DEBUG: Ver qué datos llegan
    error_log("📨 Datos recibidos en registro: " . print_r($_POST, true));
    
    $nombre = $_POST['nombre'] ?? '';
    $email = $_POST['email'] ?? '';
    $telefono = $_POST['telefono'] ?? '';
    $password = $_POST['password'] ?? '';
    $rol = $_POST['rol'] ?? 'participante';
    $organizacion = $_POST['organizacion'] ?? null;

    // DEBUG: Ver el nombre que llega
    error_log("🔍 Nombre recibido: '" . $nombre . "'");
    error_log("🔍 Longitud del nombre: " . strlen($nombre));

    // Si el nombre viene vacío, intentar con regName (por si acaso)
    if (empty($nombre)) {
        $nombre = $_POST['regName'] ?? '';
        error_log("🔄 Intentando con regName: '" . $nombre . "'");
    }

    // Determinar si es organizador
    $es_organizador = ($rol === 'organizer') ? true : false;
    
    // Generar nombre de usuario desde el email
    $usuario = explode('@', $email)[0];

    try {
        // Verificar si el usuario ya existe
        $stmt = $conn->prepare("SELECT id_usuario FROM usuarios WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            echo "Error: El usuario ya existe";
            exit;
        }

        // Hash de la contraseña
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        
        // Insertar nuevo usuario
        $stmt = $conn->prepare("INSERT INTO usuarios 
                               (nombre, email, telefono, usuario, password_hash, es_organizador, organizacion, rol) 
                               VALUES 
                               (:nombre, :email, :telefono, :usuario, :password_hash, :es_organizador, :organizacion, :rol)");
        
        $stmt->bindParam(':nombre', $nombre);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':telefono', $telefono);
        $stmt->bindParam(':usuario', $usuario);
        $stmt->bindParam(':password_hash', $password_hash);
        $stmt->bindParam(':es_organizador', $es_organizador, PDO::PARAM_BOOL);
        $stmt->bindParam(':organizacion', $organizacion);
        $stmt->bindParam(':rol', $rol);
        
        if ($stmt->execute()) {
            error_log("✅ Usuario registrado: " . $nombre);
            echo "Usuario registrado exitosamente";
        } else {
            echo "Error al registrar usuario";
        }
        
    } catch (PDOException $e) {
        error_log("❌ Error en registro: " . $e->getMessage());
        echo "Error de base de datos: " . $e->getMessage();
    }
} else {
    echo "Método no permitido";
}
?>