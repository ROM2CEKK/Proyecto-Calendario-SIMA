<?php
$host = "localhost";
$dbname = "Tablas";
$user = "postgres";
$password = "server";

try {
    $conn = new PDO("pgsql:host=$host;dbname=$dbname", $user, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // echo "Conexión exitosa"; 
} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}
?>