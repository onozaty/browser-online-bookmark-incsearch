class Bookmarks {

  constructor(bookmarks) {
    this._bookmarks = bookmarks;
  }

  all() {
    return this._bookmarks;
  }

  total() {
    return this._bookmarks.length;
  }

  find(conditions) {
    return this._bookmarks
      .filter((bookmark) => conditions.match(bookmark.searchableText));
  }
}

const NOT_CONDITION_MATCH_POSITION = {};

class Condition {

  constructor(conditionText) {
    this._positionOf = this._parseConditionText(conditionText);
  }

  match(text) {
    return this._positionOf(text) != null;
  }

  highlightPositionOf(text) {
    const position = this._positionOf(text);

    if (position == NOT_CONDITION_MATCH_POSITION) {
      // NOT Condition
      return null;
    } else {
      return position;
    }
  }

  static comparePosition(a, b) {
    if (a.start != b.start) {
      return a.start - b.start;
    }
    return a.width - b.width;
  }

  _parseConditionText(conditionText) {

    if (conditionText.startsWith('!')) {
      // Not word
      conditionText = conditionText.slice(1);
      return (text) => {
        if (text.indexOf(conditionText) != -1) {
          return null;
        } else {
          // Can not express the position because it is unmatch
          return NOT_CONDITION_MATCH_POSITION;
        }
      }
    }

    if (conditionText.indexOf('|') != -1) {
      // Multi word (OR)
      const conditions = conditionText.split('|')
                            .filter((condition) => condition.length > 0);
      return (text) => {
        const matchPositions = conditions
          .map((condition) => {
            const index = text.indexOf(condition);
            if (index == -1) {
              return null;
            }
            return {start: index, width: condition.length};
          })
          .filter((position) => position != null)
          .sort(Condition.comparePosition);

        if (matchPositions.length == 0) {
          return null;
        } else {
          // first index
          return matchPositions[0];
        }
      }
    }

    // Single word
    return (text) => {
      const index = text.indexOf(conditionText);
      if (index == -1) {
        return null;
      }
      return {start: index, width: conditionText.length};
    }
  }
}

class Conditions {

  constructor(conditionsText) {
    this._conditions = conditionsText.split(' ')
      .filter((conditionText) => conditionText != '')
      .map((conditionText) => new Condition(conditionText));
  }

  match(text) {
    return this._conditions.every((condition) => condition.match(text));
  }

  highlightPositionOf(text) {
    const highlightPositions = this._conditions
      .map((condition, index) => {
        const position = condition.highlightPositionOf(text);
        if (position) {
          position.conditionIndex = index;
        }

        return position;
      })
      .filter((position) => position != null)
      .sort(Condition.comparePosition);

    if (highlightPositions.length == 0) {
      return null;
    } else {
      // first position
      return highlightPositions[0];
    }
  }
}