let popupElement = null;

document.addEventListener('mouseup', (e) => {
  if (popupElement && popupElement.contains(e.target)) {
    // clicked on popup
    return;
  }

  const selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 0) {
    showSavePopup(e.pageX, e.pageY, selectedText);
  }
});

function showSavePopup(x, y, selectedText) {
  removeSavePopup();

  const popup = document.createElement('div');
  popupElement = popup;
  popup.id = 'highlight-save-popup';
  popup.innerText = 'Save Highlight?';
  popup.style.position = 'absolute';
  popup.style.top = `${y + 10}px`;
  popup.style.left = `${x + 10}px`;
  popup.style.background = 'yellow';
  popup.style.padding = '8px';
  popup.style.cursor = 'pointer';
  popup.style.zIndex = 9999;
  popup.style.border = '1px solid #ccc';
  popup.style.borderRadius = '5px';
  popup.style.fontSize = '14px';

  popup.addEventListener('click', () => {
    // console.log('click', { selectedText });
    chrome.runtime.sendMessage({
      type: 'SAVE_HIGHLIGHT',
      text: selectedText,
      url: window.location.href
    });

    popup.innerHTML = '✅ Saved Successfully!';
    popup.style.background = '#4CAF50';
    popup.style.color = 'white';
    popup.style.border = 'none';
    popup.style.padding = '10px 14px';

    setTimeout(removeSavePopup, 1500); // auto-hide after 1.5 seconds

    popup.remove();
  });

  document.body.appendChild(popup);
}

function removeSavePopup() {
  if (!popupElement) return;
  popupElement.remove();
  popupElement = null;
}
