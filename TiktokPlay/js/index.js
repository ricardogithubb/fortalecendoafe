$(document).ready(async function () {

    
    // Configurações
    const API_URL = 'https://apittiktokplay.markethubplace.com/api/videos'; // Substitua pelo seu endpoint
    const CACHE_KEY = 'videos_cache';
    const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos de cache
    const maxRetries = 1;
    
    // Variável para armazenar os vídeos
    let videosData = [];
    
    // Função para carregar os vídeos
    function loadVideos() {
        return new Promise((resolve, reject) => {
            // Verificar cache primeiro
            const cachedData = getCachedVideos();
            if (cachedData) {
                videosData = cachedData;
                resolve(videosData);
                return;
            }
            
            // Fazer requisição para a API
            $.ajax({
                url: API_URL,
                method: 'GET',
                dataType: 'json',
                success: function(data) {
                    // Armazenar em cache e na variável
                    cacheVideos(data);
                    videosData = data;
                    console.log('Dados carregados da API:', videosData);
                    resolve(videosData);
                },
                error: function(xhr, status, error) {
                    console.error('Erro ao carregar vídeos:', error);
                    reject(error);
                }
            });
        });
    }
    
    // Funções auxiliares de cache
    function cacheVideos(data) {
        const cache = {
            timestamp: Date.now(),
            data: data
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
    
    function getCachedVideos() {
        const cache = localStorage.getItem(CACHE_KEY);
        if (!cache) return null;
        
        try {
            const parsedCache = JSON.parse(cache);
            const cacheAge = Date.now() - parsedCache.timestamp;
            
            if (cacheAge < CACHE_EXPIRY) {
                return parsedCache.data;
            }
            
            // Cache expirado - remover
            localStorage.removeItem(CACHE_KEY);
            return null;
        } catch (e) {
            console.error("Erro ao analisar cache", e);
            return null;
        }
    }
    
    // Inicializar carregamento
    loadVideos()
        .then(data => {
            console.log('Vídeos disponíveis na variável videosData:', videosData);
            // Aqui você pode usar os dados como quiser
            // Exemplo: processarDados(videosData);
        })
        .catch(error => {
            console.error('Falha ao carregar vídeos:', error);
        });


        // loadVideos().then(() => {
        //     console.log('Total de vídeos:', videosData.length);
        //     // Faça o que quiser com os dados aqui
        // });

    var dadosJSON = {};

    async function carregarDadosJson() {
        try {
            const response = await fetch("dadosJSON.json");
            if (!response.ok) {
                throw new Error(`Erro ao carregar JSON: ${response.status}`);
            }
            const dadosJSON = await response.json();
            return dadosJSON;
        } catch (error) {
            console.error("Erro ao carregar os dados:", error);
            return null;
        }
    }
    
    const dados = await carregarDadosJson();
    
    // Dados dos vídeos
    const videos = videosData; // dados.louvores;

    //order em ordem decrescene
    videos.sort((a, b) => b.video_num - a.video_num);

    // Exemplo de uso:

    const playlist = [];

    function addSong(title, artist, cover, source) {
        playlist.push({ title, artist, cover, source });
    }

    videos.forEach(video => {
        addSong(video.song_name, video.artist_name+" | "+video.video_num,video.capa_url,video.video_url);
    });
    
    const jsonPlaylist = JSON.stringify(playlist, null, 4);
    
    // Generate playlist items
    playlist.forEach((item, index) => {
        $('#playlist').append(`
            <div class="playlist-item rounded mb-2 p-2 cursor-pointer ${index === 0 ? 'active' : ''}" 
                 data-source="${item.source}" 
                 data-index="${index}">
                <div class="d-flex align-items-center">
                    <img src="${item.cover}" 
                         class="rounded-2 me-3" 
                         width="90" 
                         height="60">
                    <div>
                        <h6 class="mb-0">${item.title}</h6>
                        <small class="text-secondary artist-name">${item.artist}</small>
                    </div>
                </div>
            </div>
        `);
    });

    // Video element and controls
    const video = document.getElementById('main-video');
    const progress = document.getElementById('progress');

    // Handle video selection
    $('.playlist-item').click(function() {
        const source = $(this).data('source');
        const index = $(this).data('index');
        const item = playlist[index];
        
        video.src = source;
        video.play();
        
        $('#video-title').text(item.title);
        $('#video-artist').text(item.artist);
        
        $('.playlist-item').removeClass('active');
        $(this).addClass('active');
    });

    // Update progress bar
    video.addEventListener('timeupdate', () => {
        const progressPercent = (video.currentTime / video.duration) * 100;
        progress.style.width = `${progressPercent}%`;
    });

    // Click to seek
    document.querySelector('.progress-container').addEventListener('click', (e) => {
        const rect = e.target.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
    });

    // Auto play next video
    video.addEventListener('ended', () => {
        const currentIndex = $('.playlist-item.active').data('index');
        const nextIndex = (currentIndex + 1) % playlist.length;
        $('.playlist-item').eq(nextIndex).click();
    });

    // Play first video on load
    $('.playlist-item').first().click();

    

});