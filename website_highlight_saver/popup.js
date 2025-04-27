const summarizeBtn = document.getElementById('summarize-btn');

function loadHighlights() {
  chrome.storage.local.get({ highlights: [] }, (result) => {
    const list = document.getElementById('highlight-list');
    list.innerHTML = '';

    result.highlights.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'highlight-item';
      div.innerText = item.text;

      const delBtn = document.createElement('button');
      delBtn.className = 'delete-btn';
      delBtn.innerText = 'X';
      delBtn.addEventListener('click', () => deleteHighlight(index));

      div.appendChild(delBtn);
      list.appendChild(div);
    });

    if (result.highlights.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-message';
      emptyMessage.innerText = 'No highlights saved yet.';
      list.appendChild(emptyMessage);
      summarizeBtn.style.display = 'none';
    } else {
      summarizeBtn.style.display = 'block';
    }
  });
}

function deleteHighlight(index) {
  chrome.storage.local.get({ highlights: [] }, (result) => {
    const updated = result.highlights;
    updated.splice(index, 1);
    chrome.storage.local.set({ highlights: updated }, loadHighlights);
  });
}

async function summarizeHighlights() {
  chrome.storage.local.get({ highlights: [] }, async (result) => {
    const allText = result.highlights.map(h => h.text).join('\n');

    const apiKey = 'YOUR_OPENAI_API_KEY';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: `Summarize the following highlights:\n\n${allText}` }]
      })
    });
    const data = await response.json();
    alert(data.choices[0].message.content);
  });
}

document.getElementById('summarize-btn').addEventListener('click', summarizeHighlights);

loadHighlights();
