class PinboardService {

  createEditUrl(bookmark) {
    return 'https://pinboard.in/add?next=same&url=' + encodeURIComponent(bookmark.url);
  }

  newLoader() {
    return new PinboardLoader();
  }
}

class PinboardLoader {

  load() {
    return new Promise((resolve, reject) => {
      $.ajax(
        'https://api.pinboard.in/v1/posts/all',
        {
          dataType: 'xml'
        })
        .done((xml) => {
          
          const $xml = $(xml);
          const bookmarks = $xml.find('post').map((index, element) => {
            const $element = $(element);

            const bookmark = {};
            bookmark.id = index;
            bookmark.url = $element.attr('href');
            bookmark.title = $element.attr('description');
            bookmark.description = $element.attr('extended');
            const tags = $element.attr('tag');
            bookmark.tags = (tags == '') ? '' : tags.split(' ').map((item) => '[' + item + ']').join(' ');
            bookmark.time = $element.attr('time');
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