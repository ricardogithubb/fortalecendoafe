$(document).ready(function () {
    
    const videoInput = document.getElementById('videoInput');
    const videoPreview = document.getElementById('videoPreview');
    const thumbnailCanvas = document.getElementById('thumbnailCanvas');
    let currentVideoFile = null;

    // Video Load Handler
    videoInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        currentVideoFile = file;
        
        videoPreview.src = URL.createObjectURL(file);
        document.getElementById('fileName').value = file.name;

        videoPreview.addEventListener('loadedmetadata', () => {
            videoPreview.currentTime = Math.min(0.1, videoPreview.duration);
        });

        videoPreview.addEventListener('seeked', () => {
            captureThumbnail();
        });
    });

    // Thumbnail Capture Logic
    function captureThumbnail() {
        const ctx = thumbnailCanvas.getContext('2d');
        const targetWidth = 1280;
        const targetHeight = 720;
        
        thumbnailCanvas.width = targetWidth;
        thumbnailCanvas.height = targetHeight;

        const videoRatio = videoPreview.videoWidth / videoPreview.videoHeight;
        const targetRatio = targetWidth / targetHeight;

        let sx, sy, sw, sh;

        if (videoRatio > targetRatio) {
            sw = videoPreview.videoHeight * targetRatio;
            sh = videoPreview.videoHeight;
            sx = (videoPreview.videoWidth - sw) / 2;
            sy = 0;
        } else {
            sw = videoPreview.videoWidth;
            sh = videoPreview.videoWidth / targetRatio;
            sx = 0;
            sy = (videoPreview.videoHeight - sh) / 2;
        }

        ctx.drawImage(videoPreview, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
        addFilmEffect(ctx, targetWidth, targetHeight);
    }

    // Film Border Effect
    function addFilmEffect(ctx, width, height) {
        // Top and bottom bars
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, width, 35);
        ctx.fillRect(0, height - 35, width, 35);

        // Perforations
        ctx.fillStyle = '#333';
        const holeCount = Math.floor(width / 60);
        for (let i = 0; i < holeCount; i++) {
            const x = (width / (holeCount + 1)) * (i + 1);
            ctx.beginPath();
            ctx.arc(x, 17, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, height - 17, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Random Thumbnail
    document.getElementById('randomThumbnail').addEventListener('click', function(e) {
        e.preventDefault();
        if (!videoPreview.duration) return;

        const randomTime = Math.random() * (videoPreview.duration - 1);
        videoPreview.currentTime = Math.min(randomTime, videoPreview.duration - 0.1);
    });

    // No início do upload:
    $('#progressModal').modal({
        backdrop: 'static',
        keyboard: false
    }).modal('show');

    // Atualizar progresso:
    function updateProgress(percent) {
        const progressBar = $('#progressModal .progress-bar');
        progressBar.css('width', percent + '%')
                .attr('aria-valuenow', percent)
                .find('.progress-text')
                .text(percent + '%');
                
        if(percent >= 100) {
            progressBar.removeClass('progress-bar-animated');
        }
    }

    // Ao finalizar/erro:
    $('#progressModal').modal('hide');

    // Adicionar cálculo de tamanho de arquivo
    function formatFileSize(bytes) {
        if(bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // No evento change do vídeo:
    if(currentVideoFile) {
        $('#fileSize').text(formatFileSize(currentVideoFile.size));
    }

    // Form Submission
    // Substitua a função de submit por esta versão atualizada
    $('#videoForm').submit(async function(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('video', currentVideoFile);
        formData.append('file_name', $('#fileName').val());
        formData.append('song_name', $('#songName').val());
        formData.append('artist_name', $('#artistName').val());

        thumbnailCanvas.toBlob(async (blob) => {
            formData.append('thumbnail', blob, 'thumbnail.jpg');

            // Configurar a barra de progresso
            $('#uploadProgress').show().find('.progress-bar').css('width', '0%');
            $('button[type="submit"]').prop('disabled', true);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'http://127.0.0.1:8000/api/upload-video');

            // Atualizar progresso
            xhr.upload.addEventListener('progress', function(e) {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    const progressBar = $('#uploadProgress .progress-bar');
                    
                    progressBar.css('width', percent + '%')
                                .attr('aria-valuenow', percent)
                                .find('.progress-text')
                                .text(percent + '%');
                }
            });

            xhr.onload = function() {
                $('button[type="submit"]').prop('disabled', false);
                $('#uploadProgress').hide();

                if (xhr.status === 201) {
                    alert('✅ Upload realizado com sucesso!');
                    location.reload();
                } else {
                    console.log(xhr.responseText);
                    alert('❌ Erro: ' + xhr.responseText);
                }
            };

            xhr.onerror = function() {
                $('button[type="submit"]').prop('disabled', false);
                $('#uploadProgress').hide();
                alert('❌ Erro de conexão com o servidor');
            };

            xhr.send(formData);
        }, 'image/jpeg', 0.85);
    });
    
});