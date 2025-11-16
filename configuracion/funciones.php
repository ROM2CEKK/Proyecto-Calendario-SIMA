<?php
require_once 'config/conexion.php';

/**
 * FUNCIONES DE USUARIOS
 */
function loginUsuario($username, $password) {
    global $conn;
    try {
        $stmt = $conn->prepare("SELECT id, username, password FROM usuarios WHERE username = :username");
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($usuario && password_verify($password, $usuario['password'])) {
            return $usuario;
        }
        return false;
    } catch (PDOException $e) {
        return false;
    }
}

function registrarUsuario($username, $password, $email) {
    global $conn;
    try {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO usuarios (username, password, email) VALUES (:username, :password, :email)");
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password', $hash);
        $stmt->bindParam(':email', $email);
        return $stmt->execute();
    } catch (PDOException $e) {
        return "Error: " . $e->getMessage();
    }
}

/**
 * FUNCIONES DE EVENTOS
 */
function crearEvento($titulo, $descripcion, $fecha, $lugar, $id_organizador) {
    global $conn;
    try {
        $stmt = $conn->prepare("INSERT INTO eventos (titulo, descripcion, fecha, lugar, id_organizador) VALUES (:titulo, :descripcion, :fecha, :lugar, :id_organizador)");
        $stmt->bindParam(':titulo', $titulo);
        $stmt->bindParam(':descripcion', $descripcion);
        $stmt->bindParam(':fecha', $fecha);
        $stmt->bindParam(':lugar', $lugar);
        $stmt->bindParam(':id_organizador', $id_organizador);
        return $stmt->execute();
    } catch (PDOException $e) {
        return "Error: " . $e->getMessage();
    }
}

function obtenerEventos() {
    global $conn;
    try {
        $stmt = $conn->prepare("SELECT * FROM eventos ORDER BY fecha DESC");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return [];
    }
}

function obtenerEventoPorId($id) {
    global $conn;
    try {
        $stmt = $conn->prepare("SELECT * FROM eventos WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return false;
    }
}

/**
 * FUNCIONES DE INSCRIPCIONES
 */
function inscribirUsuario($id_evento, $id_usuario) {
    global $conn;
    try {
        // Verificar si ya está inscrito
        $stmt = $conn->prepare("SELECT id FROM inscripciones WHERE id_evento = :id_evento AND id_usuario = :id_usuario");
        $stmt->bindParam(':id_evento', $id_evento);
        $stmt->bindParam(':id_usuario', $id_usuario);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            return "Ya estás inscrito en este evento";
        }
        
        $stmt = $conn->prepare("INSERT INTO inscripciones (id_evento, id_usuario, fecha_inscripcion) VALUES (:id_evento, :id_usuario, NOW())");
        $stmt->bindParam(':id_evento', $id_evento);
        $stmt->bindParam(':id_usuario', $id_usuario);
        return $stmt->execute() ? true : "Error al inscribir";
    } catch (PDOException $e) {
        return "Error: " . $e->getMessage();
    }
}
?>
<?php
session_start();
require_once '../includes/funciones.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];
    
    $usuario = loginUsuario($username, $password);
    
    if ($usuario) {
        $_SESSION['id_usuario'] = $usuario['id'];
        $_SESSION['username'] = $usuario['username'];
        header('Location: ../pages/dashboard.php');
        exit;
    } else {
        header('Location: ../pages/Login.html?error=1');
        exit;
    }
}
?>
<?php
session_start();
require_once '../includes/funciones.php';

if (!isset($_SESSION['id_usuario'])) {
    header('Location: ../pages/Login.html');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $titulo = $_POST['titulo'];
    $descripcion = $_POST['descripcion'];
    $fecha = $_POST['fecha'];
    $lugar = $_POST['lugar'];
    $id_organizador = $_SESSION['id_usuario'];
    
    $resultado = crearEvento($titulo, $descripcion, $fecha, $lugar, $id_organizador);
    
    if ($resultado === true) {
        header('Location: ../pages/eventos.php?success=1');
    } else {
        header('Location: ../pages/crear_evento.php?error=' . urlencode($resultado));
    }
    exit;
}
?>
<?php
session_start();
require_once '../includes/funciones.php';

if (!isset($_SESSION['id_usuario'])) {
    header('Location: Login.html');
    exit;
}

