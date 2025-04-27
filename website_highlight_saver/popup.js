const summarizeBtn = document.getElementById('summarize-btn');

const API_URL = 'https://api.openai.com/v1/chat/completions';
const API_KEY = 'XXXX';

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
  summarizeBtn.disabled = true;
  summarizeBtn.innerText = 'Summarizing...';

  chrome.storage.local.get({ highlights: [] }, async (result) => {
    const allText = result.highlights.map((h) => h.text).join('\n');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: `Summarize the following highlights:\n\n${allText}`
            }
          ]
        })
      });
      const data = await response.json();
      const summaryText = data.choices[0].message.content;
      showSummary(summaryText);
    } catch (error) {
      console.log('Summarization failed:', error);
      alert('Failed to summarize. Please try again later.');
    } finally {
      summarizeBtn.disabled = false;
      summarizeBtn.innerText = 'Summarize Highlights';
    }
  });
}

function showSummary(summaryText) {
  const list = document.getElementById('highlight-list');

  const existingSummary = document.getElementById('summary-item');
  if (existingSummary) {
    existingSummary.remove();
  }

  const summaryDiv = document.createElement('div');
  summaryDiv.className = 'highlight-item';
  summaryDiv.id = 'summary-item';

  const icon = document.createElement('img');
  icon.src = 'icons/ai.png';
  icon.alt = 'AI Icon';
  icon.classList.add('ai-icon');

  const headerDiv = document.createElement('div');
  headerDiv.className = 'summary-header';
  const headerText = document.createElement('span');
  headerText.innerText = 'AI Summary:';
  headerDiv.appendChild(icon);
  headerDiv.appendChild(headerText);
  summaryDiv.appendChild(headerDiv);

  const text = document.createElement('span');
  text.innerText = summaryText;

  summaryDiv.appendChild(text);
  list.appendChild(summaryDiv);

  // Auto scroll to bottom
  list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
}

summarizeBtn.addEventListener('click', summarizeHighlights);

loadHighlights();
