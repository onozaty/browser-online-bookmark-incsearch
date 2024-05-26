chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({url: 'ui/index.html', active: true});
});
