<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';

function out($data) { echo json_encode($data); exit; }

function fmtId($n) { return 'R' . str_pad((string)$n, 4, '0', STR_PAD_LEFT); }

$method = $_SERVER['REQUEST_METHOD'];

/* ---------------- GET: list (optionally search, sortable) ---------------- */
if ($method === 'GET') {
    $q = trim($_GET['q'] ?? '');

    // Whitelist: only these columns (matching the admin table headers) can be sorted on.
    // This is required because column names can't be passed as bound parameters —
    // building ORDER BY from unfiltered user input would be a SQL-injection risk.
    $sortMap = [
        'id'     => 'id',
        'name'   => 'student_name',
        'grade'  => 'class_grade',
        'school' => 'school_name',
        'phone'  => 'mobile_number',
        'status' => 'status',
    ];
    $sortKey = $_GET['sort'] ?? 'id';
    $sortCol = $sortMap[$sortKey] ?? 'id';
    $dir = (strtolower($_GET['dir'] ?? 'desc') === 'asc') ? 'ASC' : 'DESC';
    $orderBy = "ORDER BY $sortCol $dir" . ($sortCol !== 'id' ? ", id DESC" : "");

    if ($q !== '') {
        $like = '%' . $q . '%';
        $stmt = $conn->prepare(
            "SELECT id, student_name, class_grade, school_name, parent_name, mobile_number, email, status, created_at
             FROM registrations
             WHERE student_name LIKE ? OR school_name LIKE ? OR mobile_number LIKE ?
             $orderBy"
        );
        $stmt->bind_param('sss', $like, $like, $like);
    } else {
        $stmt = $conn->prepare(
            "SELECT id, student_name, class_grade, school_name, parent_name, mobile_number, email, status, created_at
             FROM registrations
             $orderBy"
        );
    }
    $stmt->execute();
    $res = $stmt->get_result();

    $rows = [];
    while ($r = $res->fetch_assoc()) {
        $rows[] = [
            'id'     => fmtId($r['id']),
            '_id'    => (int)$r['id'],
            'name'   => $r['student_name'],
            'grade'  => $r['class_grade'],
            'school' => $r['school_name'],
            'parent' => $r['parent_name'],
            'phone'  => $r['mobile_number'],
            'email'  => $r['email'],
            'status' => $r['status'] ?: 'Registered',
            'date'   => substr($r['created_at'], 0, 10),
        ];
    }
    $stmt->close();
    out(['ok' => true, 'rows' => $rows]);
}

/* ---------------- POST: create / update / delete ---------------- */
if ($method === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'create' || $action === 'update') {
        $name   = trim($_POST['name'] ?? '');
        $grade  = trim($_POST['grade'] ?? '');
        $school = trim($_POST['school'] ?? '');
        $parent = trim($_POST['parent'] ?? '');
        $phone  = trim($_POST['phone'] ?? '');
        $email  = trim($_POST['email'] ?? '');
        $status = trim($_POST['status'] ?? 'Registered');

        if ($name === '' || $grade === '' || $phone === '') {
            out(['ok' => false, 'message' => 'Student name, grade and mobile are required.']);
        }
        if (!preg_match('/^[6-9][0-9]{9}$/', $phone)) {
            out(['ok' => false, 'message' => 'Enter a valid 10-digit mobile number.']);
        }
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            out(['ok' => false, 'message' => 'Invalid email address.']);
        }
        if (!in_array($status, ['Registered', 'Test Taken', 'Qualified'], true)) {
            $status = 'Registered';
        }

        if ($action === 'create') {
            // duplicate checks
            $stmt = $conn->prepare("SELECT id FROM registrations WHERE mobile_number = ?");
            $stmt->bind_param('s', $phone);
            $stmt->execute(); $stmt->store_result();
            if ($stmt->num_rows > 0) { $stmt->close(); out(['ok' => false, 'message' => 'This mobile number is already registered.']); }
            $stmt->close();

            if ($email !== '') {
                $stmt = $conn->prepare("SELECT id FROM registrations WHERE email = ?");
                $stmt->bind_param('s', $email);
                $stmt->execute(); $stmt->store_result();
                if ($stmt->num_rows > 0) { $stmt->close(); out(['ok' => false, 'message' => 'This email address is already registered.']); }
                $stmt->close();
            }

            $stmt = $conn->prepare(
                "INSERT INTO registrations (student_name, class_grade, school_name, parent_name, mobile_number, email, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?)"
            );
            $stmt->bind_param('sssssss', $name, $grade, $school, $parent, $phone, $email, $status);
            if (!$stmt->execute()) out(['ok' => false, 'message' => 'Insert failed: ' . $stmt->error]);
            $newId = $conn->insert_id;
            $stmt->close();
            out(['ok' => true, 'row' => ['id' => fmtId($newId), '_id' => $newId]]);
        } else {
            $id = (int)($_POST['id'] ?? 0);
            if ($id <= 0) out(['ok' => false, 'message' => 'Invalid record id.']);

            // duplicate mobile check, excluding this row
            $stmt = $conn->prepare("SELECT id FROM registrations WHERE mobile_number = ? AND id <> ?");
            $stmt->bind_param('si', $phone, $id);
            $stmt->execute(); $stmt->store_result();
            if ($stmt->num_rows > 0) { $stmt->close(); out(['ok' => false, 'message' => 'This mobile number is already registered.']); }
            $stmt->close();

            $stmt = $conn->prepare(
                "UPDATE registrations
                 SET student_name=?, class_grade=?, school_name=?, parent_name=?, mobile_number=?, email=?, status=?
                 WHERE id=?"
            );
            $stmt->bind_param('sssssssi', $name, $grade, $school, $parent, $phone, $email, $status, $id);
            if (!$stmt->execute()) out(['ok' => false, 'message' => 'Update failed: ' . $stmt->error]);
            $stmt->close();
            out(['ok' => true]);
        }
    }

    if ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        if ($id <= 0) out(['ok' => false, 'message' => 'Invalid record id.']);
        $stmt = $conn->prepare("DELETE FROM registrations WHERE id = ?");
        $stmt->bind_param('i', $id);
        if (!$stmt->execute()) out(['ok' => false, 'message' => 'Delete failed: ' . $stmt->error]);
        $stmt->close();
        out(['ok' => true]);
    }

    out(['ok' => false, 'message' => 'Unknown action.']);
}

http_response_code(405);
out(['ok' => false, 'message' => 'Method not allowed.']);