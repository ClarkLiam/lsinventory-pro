<?php

session_start();

function requireLogin() {

    if (!isset($_SESSION['user_id'])) {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Not authenticated"
        ]);

        exit;
    }

}