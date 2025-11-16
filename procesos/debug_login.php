<?php
session_start();
require_once __DIR__ . '/../configuracion/conexion.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    echo "Email recibido: " . $email . "<br>";
    echo "Password recibido: " . $password . "<br><br>";

    try {
        $stmt = $conn->prepare("SELECT id_usuario, nombre, email, password_hash, rol FROM usuarios WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "Usuario encontrado: " . ($usuario ? "SÍ" : "NO") . "<br>";
        
        if ($usuario) {
            echo "Hash en BD: " . $usuario['password_hash'] . "<br>";
            echo "Longitud hash: " . strlen($usuario['password_hash']) . "<br>";
            
            $password_verificado = password_verify($password, $usuario['password_hash']);
            echo "Password verify: " . ($password_verificado ? "TRUE" : "FALSE") . "<br>";
            
            if ($password_verificado) {
                echo "✅ Login exitoso";
            } else {
                echo "❌ Password incorrecto";
            }
        }
        
    } catch (PDOException $e) {
        echo "Error: " . $e->getMessage();
    }
}
?>