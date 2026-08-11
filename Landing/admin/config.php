<?php
/**
 * Admin panel DB config.
 *
 * This just pulls in the SAME config.php your public register.php already
 * uses (the one that defines $conn), so there's only one place to manage
 * DB credentials.
 *
 * Your folder layout is:
 *   Landing/config.php        <-- the real credentials live here
 *   Landing/admin/config.php  <-- this file
 *
 * so "one level up" is correct. If you ever move the admin folder,
 * update the path below.
 */
require_once __DIR__ . '/../config.php';

// Sanity check — fail loudly instead of silently if $conn isn't defined.
if (!isset($conn) || !($conn instanceof mysqli)) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Database connection ($conn) not found. Check admin/config.php path to ../config.php.'
    ]);
    exit;
}