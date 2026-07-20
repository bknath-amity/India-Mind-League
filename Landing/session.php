<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    echo json_encode([
        "status" => "success",
        "logged_in" => true,
        "user" => [
            "id" => $_SESSION['user_id'] ?? null,
            "student_name" => $_SESSION['student_name'] ?? '',
            "email" => $_SESSION['email'] ?? '',
            "mobile" => $_SESSION['mobile'] ?? ''
        ]
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "logged_in" => false,
        "message" => "Not logged in."
    ]);
}
?>