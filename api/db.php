<?php

require_once 'config.php';

$conn = new mysqli(
    DB_HOST,
    DB_USER,
    DB_PASS,
    DB_NAME
);

if ($conn->connect_error) {
    http_response_code(500);
    exit("Database connection failed");
}
