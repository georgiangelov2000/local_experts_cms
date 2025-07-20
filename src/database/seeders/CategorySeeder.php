<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\ServiceCategory;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $config = config('categories');
        if (!empty($config['categories'])) {
            foreach ($config['categories'] as $cat) {
                Category::firstOrCreate(['name' => $cat['name']], [
                    'description' => $cat['description'] ?? null,
                ]);
            }
        }
        if (!empty($config['service_categories'])) {
            foreach ($config['service_categories'] as $scat) {
                ServiceCategory::firstOrCreate(['name' => $scat['name']], [
                    'description' => $scat['description'] ?? null,
                ]);
            }
        }
    }
} 