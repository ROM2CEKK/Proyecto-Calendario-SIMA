<?php
require_once __DIR__ . '/../configuracion/conexion.php';

// Crear usuario de prueba
$email = "test@test.com";
$password = "123456";
$nombre = "Usuario Test";

try {
    // Verificar si ya existe
    $stmt = $conn->prepare("SELECT id_usuario FROM usuarios WHERE email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    if ($stmt->rowCount() == 0) {
        // Crear usuario de prueba
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        $usuario = explode('@', $email)[0];
        
        $stmt = $conn->prepare("INSERT INTO usuarios (nombre, email, usuario, password_hash, rol) VALUES (:nombre, :email, :usuario, :password_hash, 'student')");
        $stmt->bindParam(':nombre', $nombre);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':usuario', $usuario);
        $stmt->bindParam(':password_hash', $password_hash);
        
        if ($stmt->execute()) {
            echo "Usuario de prueba creado:<br>";
            echo "Email: $email<br>";
            echo "Password: $password<br>";
            echo "Hash: $password_hash<br>";
        }
    } else {
        echo "El usuario de prueba ya existe";
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>