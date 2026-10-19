
<?php

header('Content-Type: application/json');

echo json_encode([
    'status' => 'ok',
    'message' => 'Vercel PHP function is working'
]);
