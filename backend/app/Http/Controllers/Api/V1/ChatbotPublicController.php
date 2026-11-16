<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ChatbotAiService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatbotPublicController extends Controller
{
    use ApiResponse;

    public function respond(Request $request, ChatbotAiService $chatbot): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'min:1', 'max:500'],
            'sessionToken' => ['nullable', 'string', 'max:100'],
        ]);

        $sessionToken = $validated['sessionToken'] ?: ($request->session()->getId() ?: 'visitor-'.md5((string) $request->ip()));
        $result = $chatbot->answerVisitor($validated['message'], $sessionToken, $request->ip());

        return $this->ok($result);
    }
}
