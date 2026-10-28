import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';

interface TodoItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export default class TodoAPI extends Service<Env> {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route handling
      if (path === '/todos' && method === 'POST') {
        return await this.createTodo(request, corsHeaders);
      } else if (path === '/todos' && method === 'GET') {
        return await this.getTodos(request, corsHeaders);
      } else if (path.startsWith('/todos/') && method === 'DELETE') {
        const todoId = path.split('/')[2];
        return await this.deleteTodo(todoId, corsHeaders);
      } else if (path === '/todos/search' && method === 'GET') {
        return await this.searchTodos(request, corsHeaders);
      }

      return new Response(
        JSON.stringify({ error: 'Not found' }),
        { status: 404, headers: corsHeaders }
      );
    } catch (error) {
      console.error('API Error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: corsHeaders }
      );
    }
  }

  private async createTodo(request: Request, headers: Record<string, string>): Promise<Response> {
    try {
      const body = await request.json() as { title?: string; description?: string };
      const { title, description } = body;

      if (!title) {
        return new Response(
          JSON.stringify({ error: 'Title is required' }),
          { status: 400, headers }
        );
      }

      const todoId = crypto.randomUUID();
      const todo: TodoItem = {
        id: todoId,
        title,
        description: description || '',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store in SmartBucket for vector search capabilities
      await this.env.TODOS_SB.put(todoId, JSON.stringify(todo), {
        httpMetadata: {
          contentType: 'application/json'
        }
      });

      return new Response(JSON.stringify(todo), { status: 201, headers });
    } catch (error) {
      console.error('Create todo error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create todo' }),
        { status: 500, headers }
      );
    }
  }

  private async getTodos(request: Request, headers: Record<string, string>): Promise<Response> {
    try {
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      // List objects from SmartBucket
      const objects = await this.env.TODOS_SB.list({
        limit,
        cursor: offset > 0 ? offset.toString() : undefined
      });

      const todos: TodoItem[] = [];
      
      // Fetch each todo object
      for (const obj of objects.objects) {
        try {
          const todoData = await this.env.TODOS_SB.get(obj.key);
          if (todoData) {
            const todoText = await todoData.text();
            const todo = JSON.parse(todoText);
            todos.push(todo);
          }
        } catch (error) {
          console.error(`Error fetching todo ${obj.key}:`, error);
        }
      }

      // Sort by creation date (newest first)
      todos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return new Response(
        JSON.stringify({
          todos,
          pagination: {
            total: todos.length,
            limit,
            offset,
            hasMore: objects.truncated
          }
        }),
        { headers }
      );
    } catch (error) {
      console.error('Get todos error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch todos' }),
        { status: 500, headers }
      );
    }
  }

  private async deleteTodo(todoId: string, headers: Record<string, string>): Promise<Response> {
    try {
      // Check if todo exists
      const existing = await this.env.TODOS_SB.get(todoId);
      if (!existing) {
        return new Response(
          JSON.stringify({ error: 'Todo not found' }),
          { status: 404, headers }
        );
      }

      // Delete from SmartBucket
      await this.env.TODOS_SB.delete(todoId);

      return new Response(
        JSON.stringify({ message: 'Todo deleted successfully' }),
        { headers }
      );
    } catch (error) {
      console.error('Delete todo error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to delete todo' }),
        { status: 500, headers }
      );
    }
  }

  private async searchTodos(request: Request, headers: Record<string, string>): Promise<Response> {
    try {
      const url = new URL(request.url);
      const query = url.searchParams.get('q');
      
      if (!query) {
        return new Response(
          JSON.stringify({ error: 'Query parameter "q" is required' }),
          { status: 400, headers }
        );
      }

      const requestId = crypto.randomUUID();

      // Use SmartBucket semantic search
      const searchResults = await this.env.TODOS_SB.search({
        input: query,
        requestId: requestId
      });

      const todos: TodoItem[] = [];

      // Process search results
      for (const result of searchResults.results) {
        if (result.source && result.text) {
          try {
            // Parse the stored todo data
            const todo = JSON.parse(result.text);
            todos.push({
              ...todo,
              _searchScore: result.score || 0
            });
          } catch (error) {
            console.error('Error parsing search result:', error);
          }
        }
      }

      return new Response(
        JSON.stringify({
          query,
          todos,
          pagination: searchResults.pagination
        }),
        { headers }
      );
    } catch (error) {
      console.error('Search todos error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to search todos' }),
        { status: 500, headers }
      );
    }
  }
}
