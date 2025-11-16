<?php
session_start();
require_once __DIR__ . '/../configuracion/conexion.php';

// Headers para JSON
header('Content-Type: application/json');

// Permitir CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Recibir datos como JSON
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    $response = [
        'status' => 'testing',
        'post_data' => $_POST,
        'json_data' => $data,
        'raw_input' => $json,
        'server_method' => $_SERVER['REQUEST_METHOD']
    ];
    
    // Si tenemos datos, probar el login
    if (isset($data['email']) && isset($data['password'])) {
        $email = $data['email'];
        $password = $data['password'];
        
        try {
            $stmt = $conn->prepare("SELECT id_usuario, nombre, email, password_hash, rol FROM usuarios WHERE email = :email");
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($usuario) {
                $password_correcta = password_verify($password, $usuario['password_hash']);
                
                $response['user_found'] = true;
                $response['password_match'] = $password_correcta;
                $response['user_email'] = $usuario['email'];
                
                if ($password_correcta) {
                    $_SESSION['user_id'] = $usuario['id_usuario'];
                    $_SESSION['user_email'] = $usuario['email'];
                    $_SESSION['user_name'] = $usuario['nombre'];
                    $_SESSION['user_type'] = $usuario['rol'];
                    
                    $response['status'] = 'success';
                    $response['message'] = 'Login exitoso';
                } else {
                    $response['status'] = 'error';
                    $response['message'] = 'Contraseña incorrecta';
                }
            } else {
                $response['status'] = 'error';
                $response['message'] = 'Usuario no encontrado';
                $response['user_found'] = false;
            }
        } catch (PDOException $e) {
            $response['status'] = 'error';
            $response['message'] = 'Error de base de datos: ' . $e->getMessage();
        }
    }
    
    echo json_encode($response, JSON_PRETTY_PRINT);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
}
?>