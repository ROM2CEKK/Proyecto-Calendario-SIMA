<?php
session_start();
require_once __DIR__ . '/../configuracion/conexion.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Decodificar JSON si es necesario
    if (strpos($_SERVER["CONTENT_TYPE"], "application/json") !== false) {
        $input = json_decode(file_get_contents("php://input"), true);
        $_POST = $input ?? [];
    }

    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $userType = $_POST['userType'] ?? 'student';

    if (empty($email) || empty($password)) {
        echo "Error: Email y contraseña son obligatorios";
        exit;
    }

    try {
        $stmt = $conn->prepare("SELECT id_usuario, nombre, email, password_hash, rol FROM usuarios WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuario && password_verify($password, $usuario['password_hash'])) {
            $_SESSION['user_id'] = $usuario['id_usuario'];
            $_SESSION['user_email'] = $usuario['email'];
            $_SESSION['user_name'] = $usuario['nombre'];
            $_SESSION['user_type'] = $usuario['rol'];

            echo "Login exitoso|" . $usuario['id_usuario'] . "|" . $usuario['nombre'];
        } else {
            echo "Credenciales incorrectas";
        }

    } catch (PDOException $e) {
        echo "Error de conexión: " . $e->getMessage();
    }
} else {
    echo "Método no permitido";
}
?>