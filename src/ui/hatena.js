class HatenaService {

  createEditUrl(bookmark) {
    return 'http://b.hatena.ne.jp/add?mode=confirm&url=' + encodeURIComponent(bookmark.url);
  }

  newLoader() {
    return new HatenaLoader();
  }
}

class HatenaLoader {

  load() {
    return new Promise((resolve, reject) => {
      $.ajax(
        'http://b.hatena.ne.jp/dump?mode=rss',
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
            bookmark.description = $element.find('description').text();
            bookmark.tags = $element.find('dc\\:subject').toArray().map((item) => '[' + $(item).text() + ']').join(' ');
            bookmark.time = $element.find('dc\\:date').text();
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