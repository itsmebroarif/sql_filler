<?php

declare(strict_types=1);

namespace App\Core;

class View
{
    /** Render sebuah view di dalam layout utama. */
    public static function render(string $view, array $data = [], string $layout = 'layout'): void
    {
        extract($data, EXTR_SKIP);
        $viewFile = __DIR__ . '/../../resources/views/' . $view . '.php';
        $layoutFile = __DIR__ . '/../../resources/views/' . $layout . '.php';

        if (!file_exists($viewFile)) {
            throw new \RuntimeException("View {$view} tidak ditemukan: {$viewFile}");
        }

        ob_start();
        require $viewFile;
        $content = ob_get_clean();

        if ($layout === null || !file_exists($layoutFile)) {
            echo $content;
            return;
        }

        require $layoutFile;
    }

    public static function renderPartial(string $view, array $data = []): void
    {
        extract($data, EXTR_SKIP);
        require __DIR__ . '/../../resources/views/' . $view . '.php';
    }
}
