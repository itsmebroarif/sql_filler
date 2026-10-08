<?php

declare(strict_types=1);

namespace App\Core;

class Router
{
    /** @var array<int, array{method:string, pattern:string, handler:array{0:string,1:string}}> */
    private array $routes = [];

    public function get(string $pattern, array $handler): self
    {
        return $this->add('GET', $pattern, $handler);
    }

    public function post(string $pattern, array $handler): self
    {
        return $this->add('POST', $pattern, $handler);
    }

    public function add(string $method, string $pattern, array $handler): self
    {
        $this->routes[] = ['method' => $method, 'pattern' => $pattern, 'handler' => $handler];
        return $this;
    }

    public function match(array $methods, string $pattern, array $handler): self
    {
        foreach ($methods as $method) {
            $this->add($method, $pattern, $handler);
        }
        return $this;
    }

    public function dispatch(string $uri, string $method): void
    {
        $path = '/' . trim($uri, '/');
        if ($uri === '/' || $uri === '') {
            $path = '/';
        }

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            $regex = preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $route['pattern']);
            $regex = '#^' . $regex . '$#';
            if (preg_match($regex, $path, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                [$class, $action] = $route['handler'];
                /** @var \App\Core\Controller $controller */
                $controller = new $class();
                $controller->{$action}($params);
                return;
            }
        }

        http_response_code(404);
        View::render('error', ['title' => '404', 'message' => 'Halaman tidak ditemukan.']);
    }
}
