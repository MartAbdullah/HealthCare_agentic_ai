import feedparser

feed_url = 'https://feeds.bbci.co.uk/news/health/rss.xml'
feed = feedparser.parse(feed_url)

entry = feed.entries[0]
print("Title:", entry.get('title'))
print("\nAll keys in entry:")
for key in entry.keys():
    print(f"  {key}")

print("\nmedia_thumbnail in entry:", 'media_thumbnail' in entry)

if 'media_thumbnail' in entry:
    print("Type of media_thumbnail:", type(entry['media_thumbnail']))
    print("media_thumbnail value:", entry['media_thumbnail'])
    
    if isinstance(entry['media_thumbnail'], list):
        print("Number of thumbnails:", len(entry['media_thumbnail']))
        for i, thumb in enumerate(entry['media_thumbnail']):
            print(f"  Thumbnail {i}: type={type(thumb)}")
            if isinstance(thumb, dict):
                print(f"    Keys: {thumb.keys()}")
                print(f"    URL: {thumb.get('url')}")
