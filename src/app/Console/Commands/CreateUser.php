<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\ServiceProvider;
use Illuminate\Support\Facades\Hash;

class CreateUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:create
        {email : The user\'s email}
        {password : The user\'s password}
        {role_id : The user\'s role (1=Admin, 2=Service Provider, 3=User)}
        {--business_name=}
        {--description=}
        {--category_id=}
        {--service_category_id=}
        {--start_time=}
        {--stop_time=}
        {--alias=}
    ';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new user (optionally as a service provider)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');
        $role_id = (int)$this->argument('role_id');

        if (User::where('email', $email)->exists()) {
            $this->error('A user with this email already exists.');
            return 1;
        }

        $user = new User();
        $user->email = $email;
        $user->password = Hash::make($password);
        $user->role_id = $role_id;
        $user->email_verified_at = now();
        $user->save();

        if ($role_id === 2) {
            $sp = new ServiceProvider();
            $sp->user_id = $user->id;
            $sp->business_name = $this->option('business_name');
            $sp->description = $this->option('description');
            $sp->category_id = $this->option('category_id');
            $sp->service_category_id = $this->option('service_category_id');
            $sp->start_time = $this->option('start_time');
            $sp->stop_time = $this->option('stop_time');
            $sp->alias = $this->option('alias');
            $sp->save();
        }

        $this->info('User created successfully! ID: ' . $user->id);
        return 0;
    }
} 