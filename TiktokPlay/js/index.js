$(document).ready(async function () {

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
    const videos = dados.louvores;
    // Exemplo de uso:

    const playlist = [];

    function addSong(title, artist, cover, source) {
        playlist.push({ title, artist, cover, source });
    }

    videos.forEach(video => {
        addSong(video.title, video.artist, 'imagem/' + video.thumbnail, 'videos/' + video.id);
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