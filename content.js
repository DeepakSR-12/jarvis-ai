const openAiApiCall = async (apiKey, prompt) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo-1106",
      messages: [{ role: "assistant", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
};

chrome.runtime.sendMessage({ type: "getKeys" }, async (response) => {
  const apiKey = response.apiKey;

  if (!apiKey) {
    alert("Please set your OpenAI API key in the extension options.");
    return;
  }

  document.addEventListener("keyup", async (event) => {
    if (event.key !== ";") {
      return;
    }

    const target = event.target;
    let inputText = target.value;

    if (inputText === "" || inputText === undefined) {
      inputText = document.activeElement.innerText; // LinkedIn
      if (inputText === "" || inputText === undefined) {
        inputText = document.activeElement.textContent; // Twitter
      }
    }

    // Match formats
    const helpRegex = /help:\s*(.+?);/g;
    const langRegex = /translate,([a-zA-Z]+):\s*(.+?);/g;
    const codeRegex = /code,([a-zA-Z]+):\s*(.+?);/g;

    const updateInput = async (regex, callback) => {
      let updatedText = inputText;
      let match;
      let matchFound = false;

      while ((match = regex.exec(updatedText)) !== null) {
        matchFound = true;
        const generatedText = await callback(match);
        updatedText = updatedText.replace(match[0], generatedText);

        // Reset lastIndex to 0 to avoid infinite loops
        regex.lastIndex = 0;
      }
      if (matchFound) {
        // Simulate typing the updatedText in the Twitter input field
        const activeElement = document.activeElement;
        const oldText = activeElement.textContent;
        activeElement.textContent = "";
        activeElement.focus();

        document.execCommand("insertText", false, updatedText);
        activeElement.dispatchEvent(new Event("change", { bubbles: true }));

        // If the input field is not updated, fallback to the old method
        if (activeElement.textContent !== updatedText) {
          activeElement.textContent = oldText;
        }

        target.value = updatedText; //General
        document.activeElement.innerText = updatedText; //Linkedin
      }
    };

    const generateText = async (query) => {
      return await openAiApiCall(apiKey, query);
    };

    const translateText = async (language, query) => {
      const prompt = `Translate the following English text to ${language}: "${query}"`;
      return await openAiApiCall(apiKey, prompt);
    };

    const generateCode = async (language, query) => {
      const prompt = `Write ${language} code to ${query}`;
      return await openAiApiCall(apiKey, prompt);
    };

    await updateInput(helpRegex, (match) => generateText(match[1]));
    await updateInput(langRegex, (match) => translateText(match[1], match[2]));
    await updateInput(codeRegex, (match) => generateCode(match[1], match[2]));
  });
});
