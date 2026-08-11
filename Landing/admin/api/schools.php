<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';

function out($data) { echo json_encode($data); exit; }

function fmtId($n) { return 'S' . str_pad((string)$n, 2, '0', STR_PAD_LEFT); }

$method = $_SERVER['REQUEST_METHOD'];

/* ---------------- GET: list (sortable) ---------------- */
if ($method === 'GET') {
    // Whitelist: only these columns (matching the admin table headers) can be sorted on.
    $sortMap = [
        'id'          => 'id',
        'name'        => 'name',
        'city'        => 'city',
        'coordinator' => 'coordinator',
        'contact'     => 'contact',
        'students'    => 'students',
    ];
    $sortKey = $_GET['sort'] ?? 'id';
    $sortCol = $sortMap[$sortKey] ?? 'id';
    $dir = (strtolower($_GET['dir'] ?? 'asc') === 'desc') ? 'DESC' : 'ASC';
    $orderBy = "ORDER BY $sortCol $dir" . ($sortCol !== 'id' ? ", id ASC" : "");

    $stmt = $conn->prepare("SELECT id, name, city, coordinator, contact, students FROM schools $orderBy");
    $stmt->execute();
    $res = $stmt->get_result();

    $rows = [];
    while ($r = $res->fetch_assoc()) {
        $rows[] = [
            'id'          => fmtId($r['id']),
            '_id'         => (int)$r['id'],
            'name'        => $r['name'],
            'city'        => $r['city'],
            'coordinator' => $r['coordinator'],
            'contact'     => $r['contact'],
            'students'    => (int)$r['students'],
        ];
    }
    $stmt->close();
    out(['ok' => true, 'rows' => $rows]);
}

/* ---------------- POST: create / update / delete ---------------- */
if ($method === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'create' || $action === 'update') {
        $name        = trim($_POST['name'] ?? '');
        $city        = trim($_POST['city'] ?? '');
        $coordinator = trim($_POST['coordinator'] ?? '');
        $contact     = trim($_POST['contact'] ?? '');
        $students    = (int)($_POST['students'] ?? 0);

        if ($name === '') out(['ok' => false, 'message' => 'School name is required.']);
        if ($students < 0) $students = 0;

        if ($action === 'create') {
            $stmt = $conn->prepare("INSERT INTO schools (name, city, coordinator, contact, students) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param('ssssi', $name, $city, $coordinator, $contact, $students);
            if (!$stmt->execute()) out(['ok' => false, 'message' => 'Insert failed: ' . $stmt->error]);
            $newId = $conn->insert_id;
            $stmt->close();
            out(['ok' => true, 'row' => ['id' => fmtId($newId), '_id' => $newId]]);
        } else {
            $id = (int)($_POST['id'] ?? 0);
            if ($id <= 0) out(['ok' => false, 'message' => 'Invalid record id.']);

            $stmt = $conn->prepare("UPDATE schools SET name=?, city=?, coordinator=?, contact=?, students=? WHERE id=?");
            $stmt->bind_param('ssssii', $name, $city, $coordinator, $contact, $students, $id);
            if (!$stmt->execute()) out(['ok' => false, 'message' => 'Update failed: ' . $stmt->error]);
            $stmt->close();
            out(['ok' => true]);
        }
    }

    if ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        if ($id <= 0) out(['ok' => false, 'message' => 'Invalid record id.']);
        $stmt = $conn->prepare("DELETE FROM schools WHERE id = ?");
        $stmt->bind_param('i', $id);
        if (!$stmt->execute()) out(['ok' => false, 'message' => 'Delete failed: ' . $stmt->error]);
        $stmt->close();
        out(['ok' => true]);
    }

    out(['ok' => false, 'message' => 'Unknown action.']);
}

http_response_code(405);
out(['ok' => false, 'message' => 'Method not allowed.']);