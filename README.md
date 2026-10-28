# TODO App with Vector Search

A powerful TODO application API built with Raindrop MCP that includes semantic search capabilities using vector embeddings.

## Features

- ✅ Create, read, and delete TODO items
- 🔍 Semantic search using vector similarity
- 🚀 Deployed on Raindrop infrastructure
- 📊 SmartBucket for intelligent storage and retrieval

## API Endpoints

### Create TODO
```
POST /todos
Content-Type: application/json

{
  "title": "Task title",
  "description": "Optional task description"
}
```

### List TODOs
```
GET /todos?limit=10&offset=0
```

### Search TODOs (Semantic Search)
```
GET /todos/search?q=your search query
```

### Delete TODO
```
DELETE /todos/:id
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Test the API:
```bash
node test-api.js
```

## Deployment

Deploy to production:
```bash
npm run deploy
```

## Architecture

This application uses:
- **Raindrop Service**: HTTP API server
- **SmartBucket**: Vector-enabled storage for TODO items
- **Semantic Search**: Natural language query capabilities

The SmartBucket automatically creates vector embeddings for stored TODO items, enabling powerful semantic search that can find relevant tasks even when the search terms don't exactly match the text.

## Example Usage

```javascript
// Create a TODO
const todo = await fetch('/todos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Buy groceries',
    description: 'Need milk, bread, and eggs'
  })
});

// Search for related TODOs
const results = await fetch('/todos/search?q=food shopping');
// Will find the grocery TODO even though "food shopping" != "groceries"
```