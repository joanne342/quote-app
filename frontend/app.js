
const API_URL = window.QUOTE_API_URL;

const quoteText = document.getElementById("quote-text");
const quoteAuthor = document.getElementById("quote-author");
const nextQuoteBtn = document.getElementById("next-quote-btn");
const form = document.getElementById("add-quote-form");
const quoteInput = document.getElementById("new-quote");
const authorInput = document.getElementById("new-author");
const addQuoteBtn = document.getElementById("add-quote-btn");
const formMessage = document.getElementById("form-message");

function showMessage(message, type = "") {
  formMessage.textContent = message;
  formMessage.className = type;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);

  // Try to read the server's JSON response.
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(data.error || "The request failed.");
  }

  return data;
}

async function loadRandomQuote() {
  nextQuoteBtn.disabled = true;
  quoteText.textContent = "Finding inspiration...";
  quoteAuthor.textContent = "";

  try {
    const quote = await requestJson(
      `${API_URL}/api/quotes/random`
    );

    quoteText.textContent = quote.quote;
    quoteAuthor.textContent = `— ${quote.author}`;
  } catch (error) {
    quoteText.textContent = "We couldn't load a quote.";
    quoteAuthor.textContent = "";
    console.error(error);
  } finally {
    nextQuoteBtn.disabled = false;
  }
}

async function addQuote(event) {
  event.preventDefault();
  showMessage("");

  const quote = quoteInput.value.trim();
  const author = authorInput.value.trim();

  if (!quote || !author) {
    showMessage("Please enter both a quote and an author.", "error");
    return;
  }

  if (quote.length > 1000 || author.length > 200) {
    showMessage("Your quote or author name is too long.", "error");
    return;
  }

  addQuoteBtn.disabled = true;
  addQuoteBtn.textContent = "Adding...";

  try {
    const result = await requestJson(`${API_URL}/api/quotes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quote, author }),
    });

    // Show the newly submitted quote immediately.
    quoteText.textContent = result.quote.quote;
    quoteAuthor.textContent = `— ${result.quote.author}`;

    form.reset();
    showMessage(result.message, "success");
  } catch (error) {
    showMessage(error.message || "Unable to add your quote.", "error");
  } finally {
    addQuoteBtn.disabled = false;
    addQuoteBtn.textContent = "Add my quote";
  }
}

nextQuoteBtn.addEventListener("click", loadRandomQuote);
form.addEventListener("submit", addQuote);

// Display the first quote as soon as the page is ready.
loadRandomQuote();
