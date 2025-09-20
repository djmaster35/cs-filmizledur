    // Ana sayfadaki filmleri/dizileri listeleyecek fonksiyon
    async mainPage(page) {
        const url = `${this.mainUrl}/page/${page}`;
        const html = await app.get(url).text;
        
        // Ana film kutusu bu sefer: 'div.item-film' olabilir. 
        // Onun içindeki 'a.image' etiketini de alabiliriz. 
        // En iyisi doğrudan linkleri seçmek.
        const items = document.querySelectorAll('div.poster > a.image');

        const result = [];
        for (const item of items) {
            // Linki doğrudan item'ın kendisinden alıyoruz (çünkü item artık 'a' etiketi)
            const link = item.href;

            // Başlığı 'h2' etiketinden alıyoruz
            const title = item.querySelector('h2').innerText;

            // Posteri 'img' etiketinden alıyoruz
            const poster = item.querySelector('img').src;

            result.push({
                name: title,
                url: link,
                posterUrl: poster,
                type: 'movie'
            });
        }
        return result;
    }

    // Arama fonksiyonu da bu yeni yapıya göre güncellenmeli
    async search(query) {
        const url = `${this.mainUrl}/?s=${query}`;
        const html = await app.get(url).text;

        // Arama sonuçları da büyük ihtimalle aynı yapıyı kullanıyordur.
        const items = document.querySelectorAll('div.poster > a.image');
        
        // ... (yukarıdaki for döngüsünün aynısı buraya gelecek)
        const result = [];
        for (const item of items) {
            const link = item.href;
            const title = item.querySelector('h2').innerText;
            const poster = item.querySelector('img').src;
            result.push({ name: title, url: link, posterUrl: poster, type: 'movie' });
        }
        return result;
    }
