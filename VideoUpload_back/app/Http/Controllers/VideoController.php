<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VideoController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'video' => 'required|file|mimetypes:video/*',
                'thumbnail' => 'required|image|mimes:jpeg',
                'file_name' => 'required|string|max:255|unique:videos',
                'song_name' => 'nullable|string|max:255',
                'artist_name' => 'nullable|string|max:255'
            ]);

            // Gerar nome de arquivos
            $timestamp = date('YmdHis');
            $videoExtension = $request->file('video')->getClientOriginalExtension();
            $videoFileName = $validated['file_name'];

            // Caminho absoluto da pasta externa
            $externalVideoPath = base_path('../TiktokPlay/videos');

            // Cria a pasta caso não exista
            if (!file_exists($externalVideoPath)) {
                mkdir($externalVideoPath, 0777, true);
            }

            // Move o vídeo para a pasta TiktokPlay/video
            $request->file('video')->move($externalVideoPath, $videoFileName);

            // Caminho absoluto da pasta externa para imagens
            $externalImagePath = base_path('../TiktokPlay/imagem');

            if (!file_exists($externalImagePath)) {
                mkdir($externalImagePath, 0777, true);
            }

            $thumbnailFileName = $timestamp . '.jpg';

            $request->file('thumbnail')->move($externalImagePath, $thumbnailFileName);

            $videoPath = url('http://127.0.0.1:5500/TiktokPlay/videos/' . $videoFileName);

            $thumbnailPath = url('http://127.0.0.1:5500/TiktokPlay/imagem/' . $thumbnailFileName);

            // Cria o modelo do vídeo
            $video = new \App\Models\Video([
                'file_name' => $videoFileName,
                'song_name' => $validated['song_name'],
                'artist_name' => $validated['artist_name'],
                'video_url' => url($videoPath),
                'capa_url' => url($thumbnailPath),
                'video_num' => 'Video ' . $timestamp
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
    //listar os videos
    public function index()
    {
        $videos = \App\Models\Video::all();
        return response()->json($videos);
    }

    //deletar video
    public function destroy($id)
    {
        $video = \App\Models\Video::find($id);
        if (!$video) {
            return response()->json([
                'message' => 'Video not found'
            ], 404);
        }
        $video->delete();
        return response()->json([
            'message' => 'Video deleted successfully'
        ], 200);
    }
}
