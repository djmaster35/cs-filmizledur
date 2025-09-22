# -*- coding: utf-8 -*-
import sys
import xbmcaddon
import xbmcgui
import xbmcplugin
import json
import os

addon_handle = int(sys.argv[1])
addon = xbmcaddon.Addon()
addon_path = addon.getAddonInfo('path')

# provider.json dosyasını yükle
provider_file = os.path.join(addon_path, 'provider.json')
with open(provider_file, 'r', encoding='utf-8') as f:
    provider_data = json.load(f)

# Kategorileri listele
def list_categories():
    categories = provider_data.get("categories", [])
    for cat in categories:
        li = xbmcgui.ListItem(cat["name"])
        url = sys.argv[0] + "?category=" + cat["id"]
        xbmcplugin.addDirectoryItem(handle=addon_handle, url=url, listitem=li, isFolder=True)
    xbmcplugin.endOfDirectory(addon_handle)

# Kategoriye göre içerik listele
def list_category_items(cat_id):
    from resources.lib.filmizledur_scraper import FilmizleDurScraper
    scraper = FilmizleDurScraper()

    # Kategori ID'sine göre URL'yi bul
    cat_config = next((c for c in provider_data["categories"] if c["id"] == cat_id), None)
    if not cat_config:
        return

    items = scraper.scrape_category(cat_config["url"])

    for item in items:
        li = xbmcgui.ListItem(item['title'])
        if item.get('thumbnail'):
            li.setArt({'thumb': item['thumbnail']})
        url = sys.argv[0] + "?video=" + item['url']
        xbmcplugin.addDirectoryItem(
            handle=addon_handle,
            url=url,
            listitem=li,
            isFolder=False if 'is_folder' in item and not item['is_folder'] else True
        )

    xbmcplugin.endOfDirectory(addon_handle)

# Video oynatma
def play_video(video_url):
    from resources.lib.filmizledur_scraper import FilmizleDurScraper
    scraper = FilmizleDurScraper()
    sources = scraper.scrape_video_sources(video_url)

    if not sources:
        xbmcgui.Dialog().notification("Hata", "Kaynak bulunamadı", xbmcgui.NOTIFICATION_ERROR)
        return

    # İlk kaynağı oynat
    source = sources[0]
    play_item = xbmcgui.ListItem(path=source['url'])
    xbmcplugin.setResolvedUrl(addon_handle, True, play_item)

# Router
if __name__ == '__main__':
    args = sys.argv[2][1:]
    if not args:
        list_categories()
    elif args.startswith('category='):
        cat_id = args.split('=', 1)[1]
        list_category_items(cat_id)
    elif args.startswith('video='):
        video_url = args.split('=', 1)[1]
        play_video(video_url)
