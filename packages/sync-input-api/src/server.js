import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 4001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ---------------------------------------------------------------------------
// In-memory store – keyed by a user-chosen noteId (defaults to "default").
// Each entry: { noteValue, updatedAt }
// Replace with a database for persistence across server restarts.
// ---------------------------------------------------------------------------
const notes = new Map();

// GET /api/note/:id – fetch the latest note
app.get("/api/note/:id", (req, res) => {
  const id = req.params.id;
  const entry = notes.get(id);

  if (!entry) {
    return res.json({ noteValue: "", updatedAt: null });
  }

  return res.json(entry);
});

// PUT /api/note/:id – save / overwrite a note
app.put("/api/note/:id", (req, res) => {
  const id = req.params.id;
  const noteValue = typeof req.body?.noteValue === "string" ? req.body.noteValue : "";
  const updatedAt = new Date().toISOString();

  notes.set(id, { noteValue, updatedAt });

  return res.json({ noteValue, updatedAt });
});

// DELETE /api/note/:id – clear a note
app.delete("/api/note/:id", (req, res) => {
  notes.delete(req.params.id);
  return res.json({ ok: true });
});

// GET /api/notes – list all note ids (handy for debugging)
app.get("/api/notes", (_req, res) => {
  const ids = [...notes.keys()];
  return res.json({ ids });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Sync-input API listening on http://localhost:${port}`);
});
