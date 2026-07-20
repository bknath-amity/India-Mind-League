<?php
$host = "localhost";
$username = "root";
$password = "akcds@345";
$database = "india_mind_league";

$conn = new mysqli($host, $username, $password, $database);
if ($conn->connect_error) {
    die(json_encode([
        "status" => "error",
        "message" => "Database connection failed: " . $conn->connect_error
    ]));
}
$conn->set_charset("utf8");
?>