chrome.runtime.onMessage.addListener((message) => {
  console.log({ message });
  if (message.type === 'SAVE_HIGHLIGHT') {
    chrome.storage.local.get({ highlights: [] }, (result) => {
      const updated = result.highlights;
      updated.push({ text: message.text, url: message.url, timestamp: Date.now() });
      chrome.storage.local.set({ highlights: updated });
    });
  }
});
