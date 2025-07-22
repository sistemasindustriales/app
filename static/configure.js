document.addEventListener('DOMContentLoaded', function() {
    const saveBtn = document.getElementById('saveBtn');
    const imdbIdInput = document.getElementById('imdbId');
    const videoLinksInput = document.getElementById('videoLinks');
    const statusMsg = document.getElementById('statusMsg');

    saveBtn.addEventListener('click', function() {
        const imdbId = imdbIdInput.value.trim();
        const links = videoLinksInput.value.trim();
        
        if (!imdbId || !links) {
            showStatus('Please fill in all fields', 'error');
            return;
        }
        
        if (!imdbId.startsWith('tt')) {
            showStatus('IMDb ID should start with "tt"', 'error');
            return;
        }
        
        fetch('/save-config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imdbId: imdbId,
                links: links
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showStatus('Configuration saved successfully!', 'success');
            } else {
                showStatus('Error saving configuration: ' + (data.error || 'Unknown error'), 'error');
            }
        })
        .catch(error => {
            showStatus('Error: ' + error.message, 'error');
        });
    });
    
    function showStatus(message, type) {
        statusMsg.textContent = message;
        statusMsg.className = 'status ' + type;
        statusMsg.style.display = 'block';
        
        setTimeout(() => {
            statusMsg.style.display = 'none';
        }, 5000);
    }
});