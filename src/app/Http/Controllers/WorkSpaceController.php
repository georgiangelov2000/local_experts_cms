<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use Illuminate\Http\Request;

class WorkSpaceController extends Controller
{
    public function index()
    {
        // Eager load 'city' relationship
        $workspaces = Workspace::with('city')->get();

        // Map to desired structure
        $data = $workspaces->map(function ($workspace) {
            return [
                'id' => $workspace->id,
                'name' => $workspace->city ? $workspace->city->name : null,
                // Add more fields as needed
            ];
        });

        return response()->json(['data' => $data]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'city_id' => 'required|integer|exists:cities,id',
        ]);
        $workspace = Workspace::create($validated);
        return response()->json(['data' => $workspace->load('city')], 201);
    }

    public function update(Request $request, $id)
    {
        $workspace = Workspace::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'city_id' => 'sometimes|required|integer|exists:cities,id',
        ]);
        $workspace->update($validated);
        return response()->json(['data' => $workspace->fresh('city')]);
    }

    public function destroy($id)
    {
        $workspace = Workspace::findOrFail($id);
        $workspace->delete();
        return response()->json(['message' => 'Workspace deleted']);
    }
} 