// ==Cloudstream==
// @name        HdfilmCehennemi
// @description Hdfilmcehennemi.date için Cloudstream eklentisi
// @author      djmaster35
// @language    tr
// @version     1.0.1
// @icon        https://www.hdfilmcehennemi.date/wp-content/uploads/logo.png
// @website     https://www.hdfilmcehennemi.date/
// ==/Cloudstream==

const BASE_URL = "https://www.hdfilmcehennemi.date";

function search(query) {
    const url = `${BASE_URL}/?s=${encodeURIComponent(query)}`;
    return fetch(url)
        .then(res => res.text())
        .then(html => {
            const results = [];
            // Daha güvenilir bir regex ile film posterlerini yakalayalım
            const regex = /<div class="poster">\s*<a href="(.*?)".*?title="(.*?)".*?<img.*?src="(.*?)"/gs;
            let match;
            while ((match = regex.exec(html)) !== null) {
                results.push({
                    title: match[2].trim(),
                    url: match[1],
                    poster: match[3]
                });
            }
            return results;
        });
}

function load(url) {
    return fetch(url)
        .then(res => res.text())
        .then(html => {
            // Sayfa başlığını al
            const titleMatch = html.match(/<title>(.*?)<\/title>/i);
            const title = titleMatch ? titleMatch[1].replace(" - HdFilmCehennemi", "").trim() : "";

            // Görsel linkini al
            const posterMatch = html.match(/property="og:image" content="(.*?)"/i);
            const poster = posterMatch ? posterMatch[1] : "";

            // Video kaynaklarını bul (iframe veya doğrudan mp4)
            const sources = [];
            const iframeMatch = html.match(/<iframe[^>]*src=["'](.*?)["']/i);
            if (iframeMatch) {
                sources.push({
                    url: iframeMatch[1],
                    name: "Embed"
                });
            }

            // Alternatif: doğrudan mp4 bağlantısı varsa
            const directVideoMatch = html.match(/src="(https?:\/\/.*?\.mp4.*?)"/i);
            if (directVideoMatch) {
                sources.push({
                    url: directVideoMatch[1],
                    name: "Direct"
                });
            }

            return {
                title: title,
                poster: poster,
                sources: sources
            };
        });
}

// Cloudstream dışa aktarımları
module.exports = {
    search: search,
    load: load
};
