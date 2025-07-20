<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::with(['serviceProvider.media', 'media'])->whereIn('role_id',[2,3]);

        // Search
        if ($search = $request->input('search.value')) {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%");
            });
        }

        // Total records before filtering
        $recordsTotal = User::count();

        // Filtered records
        $recordsFiltered = $query->count();

        // Order
        if ($order = $request->input('order.0.column')) {
            $columns = ['id', 'email', 'role_id']; // adjust as needed
            $dir = $request->input('order.0.dir', 'asc');
            $query->orderBy($columns[$order], $dir);
        } else {
            $query->orderBy('id', 'desc');
        }

        if ($categoryFilter = $request->input('category')) {
            $query->whereHas('serviceProvider.category', function ($q) use ($categoryFilter) {
                $q->where('id', $categoryFilter);
            });
        }

        if ($serviceCategoryFilter = $request->input('service_category')) {
            $query->whereHas('serviceProvider.serviceCategory', function ($q) use ($serviceCategoryFilter) {
                $q->where('id', $serviceCategoryFilter);
            });
        }

        if ($workstationFilter = $request->input('workstation')) {
            $query->whereHas('serviceProvider.workspaces', function ($q) use ($workstationFilter) {
                $q->where('id', $workstationFilter);
            });
        }

        if ($verifiedFilter = $request->input('verified')) {
            if ($verifiedFilter == 'yes') {
                $query->whereNotNull('email_verified_at');
            } elseif ($verifiedFilter == 'no') {
                $query->whereNull('email_verified_at');
            }
        }

        if ($lastLoggedInFilter = $request->input('last_logged_in')) {
            if ($lastLoggedInFilter == 'yes') {
                $query->whereNotNull('last_logged_in');
            } elseif ($lastLoggedInFilter == 'no') {
                $query->whereNull('last_logged_in');
            }
        }

        if ($ratingFilter = $request->input('rating')) {
            $query->whereHas('serviceProvider', function ($q) use ($ratingFilter) {
                $q->whereHas('reviews', function ($q2) use ($ratingFilter) {
                    $q2->havingRaw('AVG(rating) >= ?', [$ratingFilter]);
                });
            });
        }

        // Pagination
        $start = $request->input('start', 0);
        $length = $request->input('length', 10);
        $users = $query->skip($start)->take($length)->get();

        // Format for DataTables
        $data = $users->map(function ($user) {
            $isServiceProvider = $user->role_id == User::SERVICE_PROVIDER;
            $mediaUrl = null;
            if ($isServiceProvider && $user->serviceProvider && $user->serviceProvider->media->count() > 0) {
                $mediaModel = $user->serviceProvider->media->first();
                $mediaUrl = url('/storage/' . ltrim($mediaModel->file_path . '/' . '/'));
            } elseif ($user->media && $user->media->count() > 0) {
                $mediaModel = $user->media->first();
                $mediaUrl = url('/storage/' . ltrim($mediaModel->file_path . '/' . '/'));
            }
            return [
                'id' => $user->id,
                'email' => $user->email,
                'role_id' => $user->role_id,
                'email_verified_at' => $user->email_verified_at,
                'last_logged_in' => $user->last_logged_in,
                'media' => $mediaUrl,
                'service_provider' => $isServiceProvider && $user->serviceProvider
                    ? [
                        'id' => $user->serviceProvider->id,
                        'business_name' => $user->serviceProvider->business_name,
                        'service_category' => $user->serviceProvider->serviceCategory->name ?? null,
                        'category' => $user->serviceProvider->category->name ?? null,
                        'start_date' => $user->serviceProvider->start_date,
                        'end_date' => $user->serviceProvider->end_date,
                        'rating' => $user->serviceProvider->rating(),
                        'workspaces' => $user->serviceProvider->workspaces->count() > 0
                            ? $user->serviceProvider->workspaces->map(function ($workspace) {
                                return $workspace->city->name;
                            })->implode(', ')
                            : '',
                    ]
                    : null,
            ];
        });

        return response()->json([
            'data' => $data,
            'recordsTotal' => $recordsTotal,
            'recordsFiltered' => $recordsFiltered,
            'draw' => intval($request->input('draw')), // DataTables draw counter
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::findOrFail($id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        if($user->role_id === User::SERVICE_PROVIDER) {
            $user->load([
                'serviceProvider.media', 
                'media', 
                'serviceProvider.reviews', 
                'serviceProvider.workspaces',
                'serviceProvider.serviceCategory',
                'serviceProvider.category',
                'serviceProvider.projects',
                'serviceProvider.services',
                'serviceProvider.certifications'
            ]);
        }
        
        $cities = City::all();
        
        $user->load('contacts');

        return response()->json([
            'data' => $user,
            'cities' => $cities
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        $validated = $request->validate([
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'role_id' => 'sometimes|required|integer',
            'password' => 'nullable|min:6',
            'business_name' => 'nullable|string',
            'service_category' => 'nullable|string',
            'category' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);
        if (isset($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        } else {
            unset($validated['password']);
        }
        $user->update($validated);

        // If user is a service provider, update service provider fields
        if (($validated['role_id'] ?? $user->role_id) == User::SERVICE_PROVIDER) {
            $spData = array_filter([
                'business_name' => $validated['business_name'] ?? null,
                'service_category' => $validated['service_category'] ?? null,
                'category' => $validated['category'] ?? null,
                'start_date' => $validated['start_date'] ?? null,
                'end_date' => $validated['end_date'] ?? null,
            ], fn($v) => !is_null($v));
            if (!empty($spData)) {
                $serviceProvider = $user->serviceProvider;
                if ($serviceProvider) {
                    $serviceProvider->update($spData);
                }
            }
        }
        return response()->json(['data' => $user->fresh('serviceProvider')]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
