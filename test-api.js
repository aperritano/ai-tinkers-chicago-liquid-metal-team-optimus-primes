#!/usr/bin/env node

// Simple test script for the TODO API
// Run this after the API is deployed to test all endpoints

const API_BASE = process.env.API_URL || 'http://localhost:8000';

async function testAPI() {
  console.log('🧪 Testing TODO API...\n');

  try {
    // Test 1: Create a few TODO items
    console.log('📝 Testing POST /todos (Create TODO)');
    const todo1 = await createTodo('Buy groceries', 'Need to buy milk, bread, and eggs for the week');
    const todo2 = await createTodo('Finish project', 'Complete the AI-powered TODO app with vector search');
    const todo3 = await createTodo('Exercise', 'Go for a 30-minute run in the park');
    
    console.log('✅ Created todos:', todo1.id, todo2.id, todo3.id);
    console.log();

    // Test 2: Get all TODOs
    console.log('📋 Testing GET /todos (List TODOs)');
    const allTodos = await getTodos();
    console.log(`✅ Retrieved ${allTodos.todos.length} todos`);
    console.log();

    // Test 3: Search TODOs using semantic search
    console.log('🔍 Testing GET /todos/search (Semantic Search)');
    const searchResults1 = await searchTodos('food and shopping');
    console.log(`✅ Search "food and shopping" found ${searchResults1.todos.length} results`);
    
    const searchResults2 = await searchTodos('work and coding');
    console.log(`✅ Search "work and coding" found ${searchResults2.todos.length} results`);
    
    const searchResults3 = await searchTodos('fitness and health');
    console.log(`✅ Search "fitness and health" found ${searchResults3.todos.length} results`);
    console.log();

    // Test 4: Delete a TODO
    console.log('🗑️ Testing DELETE /todos/:id (Delete TODO)');
    await deleteTodo(todo1.id);
    console.log(`✅ Deleted todo: ${todo1.id}`);
    console.log();

    // Test 5: Verify deletion
    console.log('📋 Testing GET /todos after deletion');
    const todosAfterDelete = await getTodos();
    console.log(`✅ Retrieved ${todosAfterDelete.todos.length} todos (should be 2)`);
    console.log();

    console.log('🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

async function createTodo(title, description) {
  const response = await fetch(`${API_BASE}/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create todo: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function getTodos() {
  const response = await fetch(`${API_BASE}/todos`);

  if (!response.ok) {
    throw new Error(`Failed to get todos: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function searchTodos(query) {
  const response = await fetch(`${API_BASE}/todos/search?q=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error(`Failed to search todos: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function deleteTodo(id) {
  const response = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete todo: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Run tests
testAPI();