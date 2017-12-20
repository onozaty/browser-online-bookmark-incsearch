function createDummyBookmakrs(size) {

  const description = 'This extension is a incremental search UI for online bookmarks(Google Bookmarks, Pinboard, etc.), You can find bookmarks quickly.';
  const bookmarks = [];

  for (var i = 0; i < size; i++) {
    bookmarks.push(create(i, 'http://example.com/' + i, 'title' + i, description, '[test] [xxx] [' + i + ']', new Date().toISOString()));
  }

  return bookmarks;

  function create(id, url, title, description, tags, time) {
    return {
      id: id,
      url: url,
      title: title,
      description: description,
      tags: tags,
      time: time,
      searchableText: [title, description, tags].join("\n").toLowerCase()
    };
  }
}
