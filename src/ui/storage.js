class Storage {

  static set(obj) {
    return new Promise((resolve) => {
      chrome.storage.local.set(obj, () => resolve() );
    });
  }
  
  static get(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (obj) => {
        resolve(obj[key]);
      });
    });
  }

  static remove(key) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(key, () => {
        resolve();
      });
    });
  }
}
