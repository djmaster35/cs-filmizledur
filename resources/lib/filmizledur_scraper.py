import requests
from bs4 import BeautifulSoup
import re

class FilmizleDurScraper:
    def __init__(self):
        self.base_url = "https://www.hdfilmcehennemi.date"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
        })

    def scrape_category(self, category_path, page=1):
        url = self.base_url + category_path
        if page > 1:
            url += f"/page/{page}"

        try:
            res = self.session.get(url, timeout=10)
            res.raise_for_status()
        except Exception as e:
            print(f"[FilmizleDur] Sayfa alınırken hata: {e}")
            return []

        soup = BeautifulSoup(res.text, 'html.parser')
        items = []

        # Genel yapıya göre item'leri seç (sınıf isimleri değişebilir, genel yapı korunmuş)
        elements = soup.select('.item, .film, .movie, [class*="col-"], .post')

        for el in elements:
            title_tag = el.select_one('h2 a, h3 a, .title a, .name a, a[title]')
            img_tag = el.select_one('img')
            link_tag = el.select_one('a')

            if not title_tag or not link_tag:
                continue

            title = title_tag.get_text(strip=True)
            href = link_tag.get('href', '')
            if not href.startswith('http'):
                href = self.base_url + href if href.startswith('/') else self.base_url + '/' + href

            thumb = ''
            if img_tag:
                thumb = img_tag.get('data-src') or img_tag.get('src', '')
                if thumb.startswith('//'):
                    thumb = 'https:' + thumb
                elif thumb.startswith('/'):
                    thumb = self.base_url + thumb

            items.append({
                'title': title,
                'url': href,
                'thumbnail': thumb,
                'is_folder': True
            })

        return items

    def scrape_video_sources(self, video_url):
        try:
            res = self.session.get(video_url, timeout=10)
            res.raise_for_status()
        except Exception as e:
            print(f"[FilmizleDur] Video sayfası alınırken hata: {e}")
            return []

        soup = BeautifulSoup(res.text, 'html.parser')
        sources = []

        # 1. iframe kaynaklarını bul
        for iframe in soup.select('iframe'):
            src = iframe.get('src', '').strip()
            if src and any(x in src for x in ['vk.com', 'ok.ru', 'mail.ru', 'youtube.com', 'dailymotion', 'player']):
                sources.append({'label': 'Embed Kaynağı', 'url': src})

        # 2. script içindeki video dosyalarını ara (file: "url" formatı)
        scripts = soup.find_all('script', string=re.compile(r'file\s*:\s*[\'"]'))
        for script in scripts:
            matches = re.findall(r'file\s*:\s*[\'"]([^\'"]+)', script.string or '')
            for url in matches:
                if url.startswith('http') and not url.endswith('.js'):
                    sources.append({'label': 'Direct Video', 'url': url})

        # 3. video tag’i varsa onu da ekle
        for video_tag in soup.select('video source, video'):
            src = video_tag.get('src') or video_tag.get('data-src')
            if src:
                sources.append({'label': 'HTML5 Video', 'url': src})

        return sources
