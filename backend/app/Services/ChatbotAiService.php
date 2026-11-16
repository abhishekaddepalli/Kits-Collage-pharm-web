<?php

namespace App\Services;

use App\Models\ChatbotConversation;
use App\Models\ChatbotFaq;
use App\Models\ChatbotMessage;
use App\Models\ChatbotSetting;
use Illuminate\Support\Facades\Http;

class ChatbotAiService
{
    public function answerVisitor(string $query, string $sessionToken, ?string $ipAddress = null): array
    {
        $settings = ChatbotSetting::first();
        $conversation = ChatbotConversation::firstOrCreate(
            ['session_token' => $sessionToken],
            [
                'visitor_ip_hash' => $ipAddress ? hash('sha256', $ipAddress) : null,
                'started_at' => now(),
                'last_message_at' => now(),
            ]
        );
        $conversation->update(['last_message_at' => now()]);

        ChatbotMessage::create([
            'conversation_id' => $conversation->id,
            'sender' => 'user',
            'message_text' => $query,
            'provider' => 'faq',
            'matched' => true,
            'created_at' => now(),
        ]);

        // 1. Score curated institutional FAQs first (deterministic & accurate)
        $faqs = ChatbotFaq::where('enabled', true)->with('keywords')->orderBy('sort_order')->get();
        $normalized = strtolower(trim($query));
        $bestScore = 0;
        $bestFaq = null;

        foreach ($faqs as $faq) {
            $score = 0;
            if (str_contains(strtolower($faq->question), $normalized)) {
                $score += 6;
            }
            foreach ($faq->keywords as $kw) {
                if (str_contains($normalized, strtolower($kw->keyword))) {
                    $score += 3;
                }
            }
            if (str_contains($normalized, strtolower($faq->category_name))) {
                $score += 2;
            }
            if ($score > $bestScore) {
                $bestScore = $score;
                $bestFaq = $faq;
            }
        }

        if ($bestFaq && $bestScore >= 3) {
            ChatbotMessage::create([
                'conversation_id' => $conversation->id,
                'sender' => 'bot',
                'message_text' => $bestFaq->answer,
                'matched_faq_id' => $bestFaq->id,
                'provider' => 'faq',
                'matched' => true,
                'created_at' => now(),
            ]);

            return [
                'reply' => $bestFaq->answer,
                'provider' => 'faq',
                'matchedFaqId' => (string) $bestFaq->id,
                'matched' => true,
            ];
        }

        // 2. Optional server-side Gemini API grounding if GEMINI_API_KEY is configured
        $apiKey = config('services.gemini.api_key');
        if ($settings?->ai_enabled && !empty($apiKey)) {
            $aiReply = $this->queryGeminiServerSide($query, $faqs->take(8)->all(), $apiKey, $settings->ai_model ?: 'gemini-4-hydrogen');
            if ($aiReply !== null) {
                ChatbotMessage::create([
                    'conversation_id' => $conversation->id,
                    'sender' => 'bot',
                    'message_text' => $aiReply,
                    'provider' => 'gemini',
                    'matched' => true,
                    'created_at' => now(),
                ]);

                return [
                    'reply' => $aiReply,
                    'provider' => 'gemini',
                    'matchedFaqId' => null,
                    'matched' => true,
                ];
            }
        }

        // 3. Institutional fallback response
        $fallback = $settings?->fallback_message
            ?: 'Thank you for your question! Please contact the KITS Admissions Cell at +91 97015 18708 or submit an enquiry at /admissions.';

        ChatbotMessage::create([
            'conversation_id' => $conversation->id,
            'sender' => 'bot',
            'message_text' => $fallback,
            'provider' => 'fallback',
            'matched' => false,
            'created_at' => now(),
        ]);

        return [
            'reply' => $fallback,
            'provider' => 'fallback',
            'matchedFaqId' => null,
            'matched' => false,
        ];
    }

    protected function queryGeminiServerSide(string $query, array $faqs, string $apiKey, string $model): ?string
    {
        try {
            $faqContext = collect($faqs)
                ->map(fn ($f) => "Q: {$f->question}\nA: {$f->answer}")
                ->implode("\n\n");

            $systemPrompt = "You are the official KITS AI Assistant for KITS College of Pharmacy for Women, Divili, Peddapuram Mandal, Kakinada District, Andhra Pradesh (533433). Only provide accurate, polite answers regarding KITS Pharmacy programs (B.Pharmacy, M.Pharmacy), admissions, JNTU Kakinada affiliation, PCI approval, departments, campus hostel/facilities, and contact details (+91 97015 18708, kitspharmacollege@gmail.com). Do not invent fee numbers or placement guarantees.\n\nCurated Institutional Knowledge:\n{$faqContext}";

            $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

            $response = Http::timeout(12)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($endpoint, [
                    'systemInstruction' => ['parts' => [['text' => $systemPrompt]]],
                    'contents' => [['role' => 'user', 'parts' => [['text' => $query]]]],
                    'generationConfig' => ['temperature' => 0.3, 'maxOutputTokens' => 350],
                ]);

            if (!$response->successful()) {
                return null;
            }

            return $response->json('candidates.0.content.parts.0.text');
        } catch (\Throwable) {
            return null;
        }
    }
}
