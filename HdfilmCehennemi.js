// ==Cloudstream==
// @name        HdfilmCehennemi
// @description HdfilmCehennemi.site için Cloudstream eklentisi
// @author      djmaster35
// @language    tr
// @version     1.0.0
// @icon        https://www.hdfilmcehennemi.date/wp-content/uploads/logo.png
// @website     https://www.hdfilmcehennemi.date/
// ==/Cloudstream==

function search(query) {
    return fetch(`https://www.hdfilmcehennemi.date/?s=${encodeURIComponent(query)}`)
        .then(res => res.text())
        .then(html => {
            const results = [];
            const regex = /<div class="poster">.*?<a href="(.*?)".*?title="(.*?)".*?<img.*?src="(.*?)"/gs;
            let match;
            while ((match = regex.exec(html)) !== null) {
                results.push({
                    title: match[2],
                    url: match[1],
                    poster: match[3]
                });
            }
            return results;
        });
}

function details(url) {
    return fetch(url)
        .then(res => res.text())
        .then(html => {
            const videoMatch = html.match(/src="([^"]*\.mp4[^"]*)"/);
            return {
                streams: videoMatch ? [{url: videoMatch[1], quality: "720p"}] : [],
                title: html.match(/<title>(.*?)<\/title>/)?.[1] || "",
                poster: html.match(/property="og:image" content="(.*?)"/)?.[1] || ""
            };
        });
}

// Cloudstream API gibi yükleme örneği (genellikle framework otomatik algılar)
// exports.search = search;
// exports.details = details;
