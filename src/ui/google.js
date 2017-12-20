class GoogleService {

  createEditUrl(bookmark) {
    return 'http://www.google.com/bookmarks/mark?op=edit&output=popup&bkmk=' + encodeURIComponent(bookmark.url);
  }

  newLoader() {
    return new GoogleLoader();
  }
}

class GoogleLoader {

  async load() {
    const num = 1000;
    let bookmarks = [];
    let tempBookmarks = [];

    do {
      tempBookmarks = await this._load(bookmarks.length, num);
      bookmarks = bookmarks.concat(tempBookmarks);
    } while(tempBookmarks.length == num);

    return bookmarks;
  }

  _load(start, num) {
    return new Promise((resolve, reject) => {
      $.ajax(
        `https://www.google.com/bookmarks/lookup?output=rss&sort=date&start=${start}&num=${num}`,
        {
          dataType: 'xml'
        })
        .done((xml) => {
          
          const $xml = $(xml);
          const bookmarks = $xml.find('item').map((index, element) => {
            const $element = $(element);

            const bookmark = {};
            bookmark.id = index;
            bookmark.url = $element.find('link').text();
            bookmark.title = $element.find('title').text();
            bookmark.description = $element.find('smh\\:bkmk_annotation').text();
            bookmark.tags = $element.find('smh\\:bkmk_label').toArray().map((item) => '[' + $(item).text() + ']').join(' ');
            bookmark.time = $element.find('pubDate').text();
            bookmark.searchableText = [
              bookmark.title,
              bookmark.description,
              bookmark.tags
            ].join("\n").toLowerCase();

            return bookmark;
          })
          .toArray();

          resolve(bookmarks);
        })
        .fail((jqXHR, textStatus, errorThrown) => {
          reject(`${jqXHR.status}(${jqXHR.statusText})`);
        });
    });
  }

}