<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Psy\Readline\Hoa\Console;

class VideoController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'video' => 'required|file|mimetypes:video/*',
                'thumbnail' => 'required|image|mimes:jpeg',
                'file_name' => 'required|string|max:255',
                'song_name' => 'nullable|string|max:255',
                'artist_name' => 'nullable|string|max:255'
            ]);

            // Gerar nome do arquivo
            $timestamp = date('YmdHis');
            $videoExtension = $request->file('video')->getClientOriginalExtension();
            $videoFileName = $timestamp . '.' . $videoExtension;

            // Fazer upload
            $videoPath = $request->file('video')->storeAs(
                'public/videos',
                $validated['file_name']
            );

            $thumbnailPath = $request->file('thumbnail')->storeAs(
                '../public/capas',
                $timestamp.'.jpg'
            );

            echo $thumbnailPath;

            $video = new \App\Models\Video([
                'file_name' => $validated['file_name'],
                'song_name' => $validated['song_name'],
                'artist_name' => $validated['artist_name'],
                'video_url' => Storage::url($videoPath),
                'thumbnail_url' => Storage::url($thumbnailPath)
            ]);

            $video->save();

            return response()->json([
                'message' => 'Video uploaded successfully',
                'data' => $video
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro no servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
