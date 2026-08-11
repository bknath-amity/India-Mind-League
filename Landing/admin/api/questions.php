<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';

function out($data) { echo json_encode($data); exit; }

$VALID_CATS = ['IQ', 'EQ', 'Values'];
$VALID_GRADES = ['9', '10', '11', '12'];

$method = $_SERVER['REQUEST_METHOD'];

/* ---------------- GET: list (sortable) ---------------- */
if ($method === 'GET') {
    // Full list — the admin UI filters by grade/category client-side.
    // Whitelist: only these columns (matching the admin table headers) can be sorted on.
    $sortMap = [
        'id'      => 'id',
        'q'       => 'question',
        'grade'   => 'grade',
        'cat'     => 'category',
        'correct' => 'correct_index',
    ];
    $sortKey = $_GET['sort'] ?? 'id';
    $sortCol = $sortMap[$sortKey] ?? 'id';
    $dir = (strtolower($_GET['dir'] ?? 'asc') === 'desc') ? 'DESC' : 'ASC';
    $orderBy = "ORDER BY $sortCol $dir" . ($sortCol !== 'id' ? ", id ASC" : "");

    $stmt = $conn->prepare(
        "SELECT id, grade, category, question, option_a, option_b, option_c, option_d, correct_index
         FROM questions
         $orderBy"
    );
    $stmt->execute();
    $res = $stmt->get_result();

    $rows = [];
    while ($r = $res->fetch_assoc()) {
        $rows[] = [
            'id'      => 'Q' . $r['id'],
            '_id'     => (int)$r['id'],
            'grade'   => $r['grade'],
            'cat'     => $r['category'],
            'q'       => $r['question'],
            'opts'    => [$r['option_a'], $r['option_b'], $r['option_c'], $r['option_d']],
            'correct' => (int)$r['correct_index'],
        ];
    }
    $stmt->close();
    out(['ok' => true, 'rows' => $rows]);
}

/* ---------------- POST: create / update / delete ---------------- */
if ($method === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'create' || $action === 'update') {
        $grade   = trim($_POST['grade'] ?? '');
        $cat     = trim($_POST['cat'] ?? '');
        $qtext   = trim($_POST['q'] ?? '');
        $optA    = trim($_POST['optA'] ?? '');
        $optB    = trim($_POST['optB'] ?? '');
        $optC    = trim($_POST['optC'] ?? '');
        $optD    = trim($_POST['optD'] ?? '');
        $correct = (int)($_POST['correct'] ?? -1);

        if ($qtext === '' || $optA === '' || $optB === '' || $optC === '' || $optD === '') {
            out(['ok' => false, 'message' => 'Question text and all four options are required.']);
        }
        if (!in_array($cat, $VALID_CATS, true)) out(['ok' => false, 'message' => 'Invalid category.']);
        if (!in_array($grade, $VALID_GRADES, true)) out(['ok' => false, 'message' => 'Invalid grade.']);
        if ($correct < 0 || $correct > 3) out(['ok' => false, 'message' => 'Select the correct answer.']);

        if ($action === 'create') {
            $stmt = $conn->prepare(
                "INSERT INTO questions (grade, category, question, option_a, option_b, option_c, option_d, correct_index)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $stmt->bind_param('sssssssi', $grade, $cat, $qtext, $optA, $optB, $optC, $optD, $correct);
            if (!$stmt->execute()) out(['ok' => false, 'message' => 'Insert failed: ' . $stmt->error]);
            $newId = $conn->insert_id;
            $stmt->close();
            out(['ok' => true, 'row' => ['id' => 'Q' . $newId, '_id' => $newId]]);
        } else {
            $id = (int)($_POST['id'] ?? 0);
            if ($id <= 0) out(['ok' => false, 'message' => 'Invalid record id.']);

            $stmt = $conn->prepare(
                "UPDATE questions
                 SET grade=?, category=?, question=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_index=?
                 WHERE id=?"
            );
            $stmt->bind_param('sssssssii', $grade, $cat, $qtext, $optA, $optB, $optC, $optD, $correct, $id);
            if (!$stmt->execute()) out(['ok' => false, 'message' => 'Update failed: ' . $stmt->error]);
            $stmt->close();
            out(['ok' => true]);
        }
    }

    if ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        if ($id <= 0) out(['ok' => false, 'message' => 'Invalid record id.']);
        $stmt = $conn->prepare("DELETE FROM questions WHERE id = ?");
        $stmt->bind_param('i', $id);
        if (!$stmt->execute()) out(['ok' => false, 'message' => 'Delete failed: ' . $stmt->error]);
        $stmt->close();
        out(['ok' => true]);
    }

    out(['ok' => false, 'message' => 'Unknown action.']);
}

http_response_code(405);
out(['ok' => false, 'message' => 'Method not allowed.']);