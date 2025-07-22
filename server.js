const { addonBuilder, serveHTTP, publishToCentral } = require('stremio-addon-sdk');
const express = require('express');
const cors = require('cors');

// Configuración del addon
const builder = new addonBuilder({
    id: 'org.videolinks.stremio.addon',
    version: '1.0.0',
    name: 'Video Links Player',
    description: 'Play videos from direct links in Stremio',
    resources: ['stream'],
    types: ['movie', 'series'],
    idPrefixes: ['tt'],
    behaviorHints: {
        configurable: true,
        configurationRequired: false
    }
});

// Almacenamiento para los enlaces de video del usuario
let userVideoLinks = {};

// Manejo de la configuración
builder.defineConfigSchema({
    type: 'object',
    properties: {
        videoLinks: {
            type: 'string',
            description: 'Enter video links (one per line)'
        }
    }
});

// Endpoint para streams
builder.defineStreamHandler((args) => {
    return new Promise((resolve) => {
        const imdbId = args.id.split(':')[0];
        
        if (userVideoLinks[imdbId]) {
            const streams = userVideoLinks[imdbId].map((url, index) => ({
                id: `${imdbId}-${index}`,
                title: `Video Link ${index + 1}`,
                url: url,
                behaviorHints: {
                    notWebReady: !url.match(/\.(mp4|mkv|avi|mov)$/i)
                }
            }));
            
            resolve({ streams: streams });
        } else {
            resolve({ streams: [] });
        }
    });
});

// Configuración del servidor Express para la página de configuración
const addonInterface = builder.getInterface();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('static'));

app.get('/configure', (req, res) => {
    res.sendFile(__dirname + '/static/configure.html');
});

app.post('/save-config', (req, res) => {
    const { imdbId, links } = req.body;
    
    if (imdbId && links) {
        userVideoLinks[imdbId] = links.split('\n').filter(link => link.trim() !== '');
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, error: 'Missing parameters' });
    }
});

app.get('/manifest.json', (req, res) => {
    res.json(builder.getManifest());
});

// Iniciar el servidor
serveHTTP(addonInterface, { port: process.env.PORT || 7000 }).then(() => {
    console.log('Addon running on http://localhost:7000');
});

// Opcional: Publicar en el directorio central de Stremio
// publishToCentral("https://your-addon-url.com/manifest.json");