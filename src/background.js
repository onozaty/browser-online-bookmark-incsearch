chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.create({url: 'ui/index.html', selected: true});
});
