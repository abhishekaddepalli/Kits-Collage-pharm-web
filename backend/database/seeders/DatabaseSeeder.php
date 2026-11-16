<?php

namespace Database\Seeders;

use App\Services\InstitutionalBaselineSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        app(InstitutionalBaselineSeeder::class)->seed();
    }
}
