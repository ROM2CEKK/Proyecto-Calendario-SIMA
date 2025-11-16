<?php
require_once __DIR__ . '/../configuracion/conexion.php';

echo "<h3>🔍 INVESTIGACIÓN PROFUNDA DEL PROBLEMA</h3>";

// 1. Verificar los hashes actuales en la BD
echo "<h4>1. Hashes actuales en la base de datos:</h4>";
$stmt = $conn->query("SELECT email, password_hash FROM usuarios");
$usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($usuarios as $usuario) {
    echo "Email: {$usuario['email']}<br>";
    echo "Hash: {$usuario['password_hash']}<br>";
    echo "Longitud: " . strlen($usuario['password_hash']) . " caracteres<br>";
    
    // Probar con la contraseña que debería ser (123456)
    $resultado = password_verify('123456', $usuario['password_hash']);
    echo "Verificación con '123456': " . ($resultado ? "✅ COINCIDE" : "❌ NO COINCIDE") . "<br><br>";
}

// 2. Crear un nuevo usuario con contraseña conocida
echo "<h4>2. Creando usuario de prueba FRESCO:</h4>";
$email_prueba = "prueba@uadec.mx";
$password_prueba = "123456";

// Eliminar si existe
$conn->exec("DELETE FROM usuarios WHERE email = '$email_prueba'");

// Crear nuevo
$hash_fresco = password_hash($password_prueba, PASSWORD_DEFAULT);
$stmt = $conn->prepare("INSERT INTO usuarios (nombre, email, usuario, password_hash, rol) VALUES ('Usuario Prueba', :email, 'prueba', :hash, 'student')");
$stmt->bindParam(':email', $email_prueba);
$stmt->bindParam(':hash', $hash_fresco);

if ($stmt->execute()) {
    echo "✅ Usuario de prueba creado: $email_prueba<br>";
    echo "Password: $password_prueba<br>";
    echo "Hash fresco: $hash_fresco<br>";
    
    // Verificar inmediatamente
    $verificacion = password_verify($password_prueba, $hash_fresco);
    echo "Verificación inmediata: " . ($verificacion ? "✅ OK" : "❌ FALLO") . "<br>";
} else {
    echo "❌ Error creando usuario de prueba<br>";
}

// 3. Probar la función password_verify con valores fijos
echo "<h4>3. Test de password_verify con valores fijos:</h4>";
$test_password = "123456";
$test_hash = '$2y$10$TA22zWkp8appcvpEWwj3D.NZ1A5MOE3sBN81Rz6zSVmG6GaeSNSuW'; // Un hash conocido

$test_result = password_verify($test_password, $test_hash);
echo "Password: '$test_password'<br>";
echo "Hash: $test_hash<br>";
echo "Resultado: " . ($test_result ? "✅ VERDADERO" : "❌ FALSO") . "<br>";

// 4. Verificar versión de PHP y configuraciones
echo "<h4>4. Información del servidor:</h4>";
echo "PHP Version: " . phpversion() . "<br>";
echo "password_hash disponible: " . (function_exists('password_hash') ? "✅ SÍ" : "❌ NO") . "<br>";
echo "password_verify disponible: " . (function_exists('password_verify') ? "✅ SÍ" : "❌ NO") . "<br>";
?>