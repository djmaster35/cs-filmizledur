// Sağlayıcıyı Cloudstream'e tanıtıyoruz. Sınıf adı dosya adıyla aynı olmalı.
class FilmizledurProvider extends MainAPI {
    // Sağlayıcının temel bilgileri
    name = "Filmizledur";
    mainUrl = "https://filmizledur.net";
    lang = "tr";

    // Ana sayfadaki filmleri/dizileri listeleyecek fonksiyon
    async mainPage(page) {
        const url = `${this.mainUrl}/page/${page}`;
        const html = await app.get(url).text;
        
        const items = document.querySelectorAll('article.item-film');

        const result = [];
        for (const item of items) {
            const title = item.querySelector('h3.film-title').innerText;
            const link = item.querySelector('a').href;
            let poster = item.querySelector('img').src;
            if (poster.startsWith('/')) {
                poster = this.mainUrl + poster;
            }

            result.push({
                name: title,
                url: link,
                posterUrl: poster,
                type: 'movie'
            });
        }
        return result;
    }

    // Bir filme tıklandığında video linkini bulacak fonksiyon
    async loadLinks(url) {
        const html = await app.get(url).text;
        
        const iframeSrc = document.querySelector('iframe#player').src;

        await this.submitUrl(
            'Filmizledur Oynatıcı',
            iframeSrc,
            'iframe'
        );
        return true;
    }

    // Arama fonksiyonu
    async search(query) {
        const url = `${this.mainUrl}/?s=${query}`;
        const html = await app.get(url).text;

        const items = document.querySelectorAll('article.item-film');
        const result = [];
        for (const item of items) {
            const title = item.querySelector('h3.film-title').innerText;
            const link = item.querySelector('a').href;
            let poster = item.querySelector('img').src;
            if (poster.startsWith('/')) {
                poster = this.mainUrl + poster;
            }

            result.push({
                name: title,
                url: link,
                posterUrl: poster,
                type: 'movie'
            });
        }
        return result;
    }
}
