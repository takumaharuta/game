<?php
namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Content;
use App\Policies\ContentPolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Content::class => ContentPolicy::class,
    ];

    public function boot()
    {
        $this->registerPolicies();

        Gate::define('edit-content', [ContentPolicy::class, 'editContent']);
    }
}