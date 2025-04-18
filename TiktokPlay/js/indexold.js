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

    // Função para carregar um vídeo
    function loadVideo(video) {
        document.getElementById('mainVideo').src = `videos/${video.id}?autoplay=1`;
        document.getElementById('videoTitle').textContent = video.title;
        // document.getElementById('views').textContent = video.views;
        // document.getElementById('channel').textContent = video.channel;
        // document.getElementById('description').textContent = video.description;
    }

    // Função para criar os elementos dos vídeos relacionados
    function createRelatedVideos() {

        const container = document.getElementById('relatedVideos');
        container.innerHTML = '';

        videos.forEach(video => {
            const element = document.createElement('a');
            element.className = 'list-group-item list-group-item-action related-video';
            element.innerHTML = `
                <div class="d-flex">
                    <img src="imagem/${video.thumbnail}" style="width: 120px; height: 68px;">
                    <div class="ms-3">
                        <h6>${video.title}</h6>
                        <small>${video.channel}</small><br>
                        <small>${video.views}</small>
                    </div>
                </div>
            `;
            element.addEventListener('click', () => loadVideo(video));
            container.appendChild(element);
        });
    }

    // Carregar vídeos relacionados ao iniciar
    createRelatedVideos();
    
    
});
