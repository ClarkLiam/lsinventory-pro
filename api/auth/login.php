<?php

session_start();

require_once '../db.php';

header('Content-Type: application/json');

$data = json_decode(
    file_get_contents('php://input'),
    true
);

$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

$stmt = $conn->prepare(
    "SELECT id,password_hash,role
     FROM users
     WHERE username = ?"
);

$stmt->bind_param("s", $username);

$stmt->execute();

$result = $stmt->get_result();

$user = $result->fetch_assoc();

if (!$user) {

    echo json_encode([
        "success" => false
    ]);

    exit;
}

if (!password_verify(
    $password,
    $user['password_hash']
)) {

    echo json_encode([
        "success" => false
    ]);

    exit;
}

$_SESSION['user_id'] = $user['id'];
$_SESSION['role'] = $user['role'];

echo json_encode([
    "success" => true
]);