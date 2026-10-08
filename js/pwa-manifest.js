        const manifestData = {
            "name": "SQL FILLER Studio",
            "short_name": "SQL Filler",
            "start_url": "./",
            "display": "standalone",
            "background_color": "#121824",
            "theme_color": "#6200ee",
            "orientation": "portrait-primary",
            "icons": [
                { "src": "icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any" },
                { "src": "icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "maskable" },
                {
                    "src": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/192x192/1f5c3.png",
                    "sizes": "192x192",
                    "type": "image/png"
                },
                {
                    "src": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/512x512/1f5c3.png",
                    "sizes": "512x512",
                    "type": "image/png"
                }
            ]
        };
        const stringManifest = JSON.stringify(manifestData);
        const blobManifest = new Blob([stringManifest], { type: 'application/json' });
        const manifestURL = URL.createObjectURL(blobManifest);
        const linkManifest = document.createElement('link');
        linkManifest.rel = 'manifest';
        linkManifest.href = manifestURL;
        document.head.appendChild(linkManifest);
