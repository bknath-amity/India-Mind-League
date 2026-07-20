<?php
// Start session at the very top
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Invalid request."]);
    exit;
}

$contact = trim($_POST['contact'] ?? '');
$contactType = trim($_POST['contact_type'] ?? '');
$otp = trim($_POST['otp'] ?? '');

if (empty($contact) || empty($contactType) || empty($otp)) {
    echo json_encode(["status" => "error", "message" => "Missing required fields."]);
    exit;
}

if (!in_array($contactType, ['email', 'phone'])) {
    echo json_encode(["status" => "error", "message" => "Invalid login type."]);
    exit;
}

// Find matching OTP
$stmt = $conn->prepare("
    SELECT id, expires_at, is_verified
    FROM login_otp
    WHERE contact = ? AND contact_type = ? AND otp = ?
    ORDER BY id DESC
    LIMIT 1
");
$stmt->bind_param("sss", $contact, $contactType, $otp);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Invalid OTP."]);
    $stmt->close();
    exit;
}

$row = $result->fetch_assoc();

// Check if already used
if ((int)$row['is_verified'] === 1) {
    echo json_encode(["status" => "error", "message" => "OTP already used."]);
    $stmt->close();
    exit;
}

// Check expiry
if (strtotime($row['expires_at']) < time()) {
    echo json_encode(["status" => "error", "message" => "OTP has expired."]);
    $stmt->close();
    exit;
}

// Mark as verified
$update = $conn->prepare("UPDATE login_otp SET is_verified = 1 WHERE id = ?");
$update->bind_param("i", $row['id']);
if (!$update->execute()) {
    echo json_encode(["status" => "error", "message" => "Failed to verify OTP."]);
    $update->close();
    $stmt->close();
    exit;
}
$update->close();
$stmt->close();

// Fetch user details
if ($contactType === "email") {
    $userStmt = $conn->prepare("SELECT * FROM registrations WHERE email = ?");
} else {
    $userStmt = $conn->prepare("SELECT * FROM registrations WHERE mobile_number = ?");
}
$userStmt->bind_param("s", $contact);
$userStmt->execute();
$userData = $userStmt->get_result()->fetch_assoc();
$userStmt->close();

if (!$userData) {
    echo json_encode(["status" => "error", "message" => "User not found."]);
    exit;
}

// Regenerate session ID for security
session_regenerate_id(true);

// Set session variables
$_SESSION['logged_in']   = true;
$_SESSION['user_id']     = (int)$userData['id'];
$_SESSION['student_name']= $userData['student_name'];
$_SESSION['email']       = $userData['email'];
$_SESSION['mobile']      = $userData['mobile_number'];

// Optional: set a cookie with session ID to ensure persistence
// (PHP already does this via session cookies)

echo json_encode([
    "status" => "success",
    "message" => "Login successful.",
    "redirect" => "dashboard.html"
]);

$conn->close();
?>