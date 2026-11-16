<?php

return [
    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-4-hydrogen'),
        'endpoint' => 'https://generativelanguage.googleapis.com/v1beta/models',
    ],
];
