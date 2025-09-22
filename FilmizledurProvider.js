class FilmizledurProvider {
    constructor() {
        this.name = 'HDFilmCehennemi';
        this.url = 'https://www.hdfilmcehennemi.date';
        this.lang = 'tr';
        this.type = 'movie';
        this.quality = 'HD';
        this.categorized = true;
        this.filterable = true;
        this.page = 1;
    }

    async getFilters() {
        return {
            "categories": [
                {
                    "name": "Kategori",
                    "type": "SELECT",
                    "values": [
                        { "id": "/filmler", "name": "Filmler" },
                        { "id": "/diziler", "name": "Diziler" },
                        { "id": "/yeni-filmler", "name": "Yeni Eklenenler" }
                    ]
                }
            ]
        };
    }

    async scrapeCategory(category, page = 1) {
        let url = this.url + category + (page > 1 ? `/page/${page}` : '');
        let res = await this.request(url);
        let items = [];

        let $ = cheerio.load(res.body);

        // Genel yapıya göre item seçimi — site değişirse burası güncellenmeli
        $('.item, .film, .movie, [class*="col-"], .post').each((i, el) => {
            let titleEl = $(el).find('h2 a, h3 a, .title a, .name a, a[title]').first();
            let imgEl = $(el).find('img').first();
            let linkEl = $(el).find('a').first();

            if (!titleEl.length || !linkEl.length) return;

            let title = titleEl.text().trim();
            let href = linkEl.attr('href');
            if (!href.startsWith('http')) {
                href = href.startsWith('/') ? this.url + href : this.url + '/' + href;
            }

            let thumb = '';
            if (imgEl.length) {
                thumb = imgEl.attr('data-src') || imgEl.attr('src') || '';
                if (thumb.startsWith('//')) thumb = 'https:' + thumb;
                else if (thumb.startsWith('/')) thumb = this.url + thumb;
            }

            items.push({
                name: title,
                url: href,
                image: thumb,
                type: 'movie' // dizi ise 'tv' olabilir
            });
        });

        return {
            currentPage: page,
            hasNextPage: $('.pagination .next, .pagination a:contains("Sonraki"), .pagination a:contains("Next")').length > 0,
            list: items
        };
    }

    async scrapeMovie(url) {
        let res = await this.request(url);
        let $ = cheerio.load(res.body);
        let sources = [];

        // iframe kaynaklarını bul
        $('iframe').each((i, el) => {
            let src = $(el).attr('src');
            if (src && src.includes('http')) {
                sources.push({
                    url: src,
                    quality: 'HD',
                    isM3U8: false
                });
            }
        });

        // script içindeki video dosyalarını bul (file: "..." formatı)
        $('script').each((i, el) => {
            if (!el.children || !el.children[0]) return;
            let scriptContent = el.children[0].data;
            if (!scriptContent) return;

            let fileMatches = scriptContent.matchAll(/file\s*:\s*["']([^"']+)/g);
            for (let match of fileMatches) {
                let fileUrl = match[1];
                if (fileUrl.startsWith('http') && !fileUrl.endsWith('.js')) {
                    sources.push({
                        url: fileUrl,
                        quality: 'HD',
                        isM3U8: fileUrl.includes('.m3u8')
                    });
                }
            }
        });

        // video tag varsa onu da ekle
        $('video source, video').each((i, el) => {
            let src = $(el).attr('src') || $(el).attr('data-src');
            if (src && src.startsWith('http')) {
                sources.push({
                    url: src,
                    quality: 'HD',
                    isM3U8: src.includes('.m3u8')
                });
            }
        });

        return {
            sources: sources,
            subtitles: [] // istersen altyazı desteği eklenebilir
        };
    }

    async search(query, page = 1) {
        let searchUrl = `${this.url}/?s=${encodeURIComponent(query)}`;
        let res = await this.request(searchUrl);
        let $ = cheerio.load(res.body);
        let items = [];

        $('.item, .film, .movie, [class*="col-"], .post').each((i, el) => {
            let titleEl = $(el).find('h2 a, h3 a, .title a, .name a, a[title]').first();
            let imgEl = $(el).find('img').first();
            let linkEl = $(el).find('a').first();

            if (!titleEl.length || !linkEl.length) return;

            let title = titleEl.text().trim();
            let href = linkEl.attr('href');
            if (!href.startsWith('http')) {
                href = href.startsWith('/') ? this.url + href : this.url + '/' + href;
            }

            let thumb = '';
            if (imgEl.length) {
                thumb = imgEl.attr('data-src') || imgEl.attr('src') || '';
                if (thumb.startsWith('//')) thumb = 'https:' + thumb;
                else if (thumb.startsWith('/')) thumb = this.url + thumb;
            }

            items.push({
                name: title,
                url: href,
                image: thumb,
                type: 'movie'
            });
        });

        return {
            currentPage: page,
            hasNextPage: false, // aramada sayfalama yok varsaydık
            list: items
        };
    }
}

// CloudStream kayıt
if (typeof module !== 'undefined') {
    module.exports = FilmizledurProvider;
}
