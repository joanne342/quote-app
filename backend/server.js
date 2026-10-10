
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

const quotes = [
  {
    quote: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    quote: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
  },
  {
    quote: "Great things are done by a series of small things brought together.",
    author: "Vincent van Gogh",
  },
  {
    quote: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
  },
];

app.use(cors());
app.use(express.json({ limit: "10kb" }));

// Check that the API is running.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Return a random quote.
app.get("/api/quotes/random", (req, res) => {
  const index = Math.floor(Math.random() * quotes.length);
  res.json(quotes[index]);
});

// Validate a submitted quote.
function validateQuote(body) {
  if (
    body === null ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return "Request body must be a JSON object.";
  }

  if (typeof body.quote !== "string") {
    return "Quote must be a string.";
  }

  if (typeof body.author !== "string") {
    return "Author must be a string.";
  }

  const quote = body.quote.trim();
  const author = body.author.trim();

  if (!quote) return "Please enter a quote.";
  if (!author) return "Please enter an author.";
  if (quote.length > 1000) return "Quote must be 1000 characters or fewer.";
  if (author.length > 200) return "Author must be 200 characters or fewer.";

  return null;
}

// Add a new quote.
app.post("/api/quotes", (req, res) => {
  const error = validateQuote(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  const newQuote = {
    quote: req.body.quote.trim(),
    author: req.body.author.trim(),
  };

  quotes.push(newQuote);

  return res.status(201).json({
    message: "Quote added successfully.",
    quote: newQuote,
  });
});

// Handle malformed JSON and other middleware errors.
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Invalid JSON in request body.",
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      error: "Request body is too large.",
    });
  }

  console.error(err);
  return res.status(500).json({
    error: "An unexpected server error occurred.",
  });
});

app.listen(PORT, () => {
  console.log(`Quote API listening on port ${PORT}`);
});
