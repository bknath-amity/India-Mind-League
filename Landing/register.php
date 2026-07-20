<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
    exit;
}

$student_name = trim($_POST['name'] ?? '');
$class_grade  = trim($_POST['grade'] ?? '');
$school_name  = trim($_POST['school'] ?? '');
$parent_name  = trim($_POST['parentName'] ?? '');
$mobile       = trim($_POST['phone'] ?? '');
$email        = trim($_POST['email'] ?? '');

if (empty($student_name) || empty($class_grade) || empty($mobile) || empty($email)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Please fill all required fields.']);
    exit;
}

if (!preg_match('/^[6-9][0-9]{9}$/', $mobile)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid mobile number.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid email address.']);
    exit;
}

// Duplicate checks
$stmt = $conn->prepare("SELECT id FROM registrations WHERE mobile_number = ?");
$stmt->bind_param('s', $mobile);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['status' => 'error', 'message' => 'This mobile number is already registered.']);
    $stmt->close();
    exit;
}
$stmt->close();

$stmt = $conn->prepare("SELECT id FROM registrations WHERE email = ?");
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['status' => 'error', 'message' => 'This email address is already registered.']);
    $stmt->close();
    exit;
}
$stmt->close();

// Insert
$stmt = $conn->prepare("
    INSERT INTO registrations (student_name, class_grade, school_name, parent_name, mobile_number, email)
    VALUES (?, ?, ?, ?, ?, ?)
");
$stmt->bind_param('ssssss', $student_name, $class_grade, $school_name, $parent_name, $mobile, $email);

if ($stmt->execute()) {
    echo json_encode([
        'status'    => 'success',
        'message'   => 'Registration completed successfully.',
        'insert_id' => $conn->insert_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Insert failed: ' . $stmt->error]);
}
$stmt->close();
$conn->close();
?>