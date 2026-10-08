        function tableToSlug(name) {
            return (name || "table").toString().toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_|_$/g, "");
        }

        function getRandomElement(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }

        // Escape aman untuk konten HTML & attribute (mencegah broken DOM / XSS)
        function escapeHtml(str) {
            return String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }
