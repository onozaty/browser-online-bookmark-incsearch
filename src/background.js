chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.create({url: 'ui/index.html', active: true});
});
