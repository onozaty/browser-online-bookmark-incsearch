const NUMBER_FORMAT = new Intl.NumberFormat();
const format = (num) => {
  return NUMBER_FORMAT.format(num);
}

class SearchableTable {
  constructor(bookmarks, numberOfRowsPerPage, service, elements) {

    this._bookmarks = new Bookmarks(bookmarks);
    this._numberOfRowsPerPage = numberOfRowsPerPage;
    this._service = service;
    this._elements = elements;

    this._setup();
  }

  refresh(bookmarks, numberOfRowsPerPage, service) {
    this._bookmarks = new Bookmarks(bookmarks);
    this._numberOfRowsPerPage = numberOfRowsPerPage;
    this._service = service;

    this._oldQuery = null;
  }

  _setup() {

    this._elements.$pagerPrev.on('click', this._prevPage.bind(this));
    this._elements.$pagerNext.on('click', this._nextPage.bind(this));
    this._elements.$document.on('keydown', this._handleShortcutKey.bind(this));

    this._results = this._bookmarks.all();

    this._checkQueryLoop();
  }

  _handleShortcutKey(event) {

    if (event.ctrlKey) {
      switch(event.keyCode) {
        case 13:  // Enter
        case 77:  // m (Enter Mac OS X)
          this._openCurrentRowUrl();
          return false;

        case 37:  // Left
          this._prevPage();
          return false;

        case 38:  // Up
          this._prevRow();
          return false;

        case 39:  // Right
          this._nextPage();
          return false;

        case 40:  // Down
          this._nextRow();
          return false;

        case 69:  // e
          this._openCurrentRowEditWindow();
          return false;
 
        default:
          break;
      }
    }
  }

  _checkQueryLoop() {

    if (this._checkQueryLoopTimer) {
      clearTimeout(this._checkQueryLoopTimer);
    }

    const query = this._elements.$query.val().trim();
    if (query != this._oldQuery) {
      this._oldQuery = query;
      this._search(query);
    }

    this._checkQueryLoopTimer = setTimeout(this._checkQueryLoop.bind(this), 500);
  }

  _search(query) {

    if (query.length == 0) {
      this._conditions = null;
      this._results = this._bookmarks.all();
    } else {
      this._conditions = new Conditions(query.toLowerCase());
      this._results = this._bookmarks.find(this._conditions);
    }

    this._showResults();

    this._currentRowNumber = (this._results.length == 0) ? 0 : 1;
    this._setActiveRow(this._currentRowNumber);
  }

  _nextPage() {
    if (this._currentPageNumber >= Math.ceil(this._results.length / this._numberOfRowsPerPage)) {
      return;
    }

    this._showResults(this._currentPageNumber + 1);

    this._currentRowNumber = ((this._currentPageNumber - 1) * this._numberOfRowsPerPage) + 1;
    this._setActiveRow(this._currentRowNumber);
  }

  _prevPage(currentRowNumber) {
    if (this._currentPageNumber <= 1) {
      return;
    }

    this._showResults(this._currentPageNumber - 1);

    this._currentRowNumber = ((this._currentPageNumber - 1) * this._numberOfRowsPerPage) + 1;
    this._setActiveRow(this._currentRowNumber);
  }

  _nextRow() {
    if (this._currentRowNumber >= this._results.length) {
      return;
    }

    this._currentRowNumber++;
    const pageNumber = Math.ceil(this._currentRowNumber / this._numberOfRowsPerPage);
    if (pageNumber != this._currentPageNumber) {
      // change page
      this._showResults(pageNumber);
    }
    this._setActiveRow(this._currentRowNumber);
  }

  _prevRow() {
    if (this._currentRowNumber <= 1) {
      return;
    }

    this._currentRowNumber--;
    const pageNumber = Math.ceil(this._currentRowNumber / this._numberOfRowsPerPage);
    if (pageNumber != this._currentPageNumber) {
      // change page
      this._showResults(pageNumber);
    }
    this._setActiveRow(this._currentRowNumber);
  }

  _setActiveRow(rowNumber) {

    this._elements.$resultTable.find('tr.active').removeClass('active');
    this._elements.$resultTable.find(`tr[data-row-number="${rowNumber}"]`).addClass('active');
  }

  _getCurrentRowBookmark() {
    return this._results[this._currentRowNumber - 1];
  }

  _openCurrentRowUrl() {
    window.open(this._getCurrentRowBookmark().url, '_blank');
  }

  _openCurrentRowEditWindow() {
    window.open(this._service.createEditUrl(this._getCurrentRowBookmark()), '_blank');
  }

  _showResults(pageNumber) {
    pageNumber = pageNumber || 1;

    this._currentPageNumber = pageNumber;
    const start = (this._results.length == 0)
                    ? 0 : (pageNumber - 1) * this._numberOfRowsPerPage + 1;
    let end = start + this._numberOfRowsPerPage - 1;
    if (end > this._results.length) {
      end = this._results.length;
    }
    
    this._renderTableBody(start, end);

    this._elements.$status.text(this._createStatusText(start, end));

    if (start > 1) {
      this._elements.$pagerPrev.show();
    } else {
      this._elements.$pagerPrev.hide();
    }

    if (end < this._results.length) {
      this._elements.$pagerNext.show();
    } else {
      this._elements.$pagerNext.hide();
    }
  }

  _createStatusText(start, end) {
    return `${format(this._results.length)} hits (display: ${format(start)}-${format(end)}) / total: ${format(this._bookmarks.total())}`;
  }

  _renderTableBody(start, end) {
    this._elements.$resultTable.children().remove();

    const pageResults = this._results.slice(start - 1, end);

    let rowNumber = start;
    for (const bookmark of pageResults) {
      const row = this._createRecord(bookmark);
      this._elements.$resultTable.append($(row).attr('data-row-number', rowNumber));

      rowNumber++;
    }
  }

  _createRecord(bookmark) {
    let fragments = ['<tr><td class="cursor"></td>'];
    
    fragments.push('<td class="description">');
    fragments.push(`<a href="${bookmark.url}" target="_blank">${this._createText(bookmark.title, this._conditions)}</a>`);

    if (bookmark.description) {
      fragments.push(`<p>${this._createText(bookmark.description, this._conditions)}</p>`);
    }
    fragments.push('</td>');

    fragments.push(`<td class="tags">${this._createText(bookmark.tags, this._conditions)}</td>`);
    fragments.push(`<td class="time">${this._createText(bookmark.time)}</td>`);
    fragments.push(`<td class="edit"><a href="${this._service.createEditUrl(bookmark)}" target="_blank">edit</a></td>`);

    return fragments.join('');
  }

  _createText(value, conditions) {
    if (!conditions) {
      return this._escapeHTML(value);
    }

    const fragments = [];
    let position;
    while ((position = conditions.highlightPositionOf(value.toLowerCase())) != null) {

      fragments.push(this._escapeHTML(value.substr(0, position.start)));
      fragments.push(`<span class="highlight color${(position.conditionIndex % 4) + 1}">`);
      fragments.push(this._escapeHTML(value.substr(position.start, position.width)));
      fragments.push('</span>');

      value = value.substr(position.start + position.width);
    }

    fragments.push(value);

    return fragments.join('');
  }

  _escapeHTML(value) {
    return value
      .replace(/\&/g, '&amp;')
      .replace( /</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/\'/g, '&#39;')
      .replace(/\n|\r\n/g, '<br />');
  }
}
