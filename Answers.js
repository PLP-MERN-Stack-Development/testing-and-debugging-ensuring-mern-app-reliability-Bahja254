// ============================================
// Week 6: Testing and Debugging – MERN App
// ============================================

// ====================
// Task 1: Setting Up Testing Environment
// ====================

// 1. Jest for server-side tests
// Install: npm install --save-dev jest supertest cross-env
// package.json scripts example:
// "scripts": {
//   "test": "jest --detectOpenHandles --forceExit",
//   "test:unit": "jest --testPathPattern=unit",
//   "test:integration": "jest --testPathPattern=integration"
// }

// 2. React Testing Library for client-side tests
// Install: npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

// 3. Supertest for API testing
// Install: npm install --save-dev supertest

// 4. Separate test database
// In .env.test:
// TEST_MONGO_URI=mongodb://localhost:27017/mern_test_db

// 5. Test scripts example:
// npm run test:unit
// npm run test:integration
// npm run test:e2e


// ====================
// Task 2: Unit Testing
// ====================

// ---------- Server: Unit Test Example ----------
// utils/add.js
const add = (a, b) => a + b;
module.exports = add;

// server/unit/add.test.js
const addFn = require('../../utils/add');
test("adds two numbers correctly", () => {
  expect(addFn(2, 3)).toBe(5);
});

// ---------- Client: React Component Unit Test ----------
import { render, screen } from '@testing-library/react';
import Button from '../../components/Button';

test("renders Button component with text", () => {
  render(<Button text="Click me"/>);
  expect(screen.getByText("Click me")).toBeInTheDocument();
});

// ---------- Custom Hook Unit Test ----------
import { renderHook, act } from '@testing-library/react-hooks';
import useCounter from '../../hooks/useCounter';

test('increments counter', () => {
  const { result } = renderHook(() => useCounter());
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});

// ---------- Middleware Test Example ----------
const request = require('supertest');
const express = require('express');
const app = express();

// Dummy middleware
const logger = (req, res, next) => {
  req.logged = true;
  next();
};
app.use(logger);
app.get('/test', (req, res) => res.json({ logged: req.logged }));

test('logger middleware sets logged', async () => {
  const res = await request(app).get('/test');
  expect(res.body.logged).toBe(true);
});


// ====================
// Task 3: Integration Testing
// ====================

const mongoose = require('mongoose');
const supertest = require('supertest');
const serverApp = require('../../server'); // Express app
beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI);
});
afterAll(async () => {
  await mongoose.connection.close();
});

test("GET /api/posts returns posts array", async () => {
  const res = await supertest(serverApp).get('/api/posts');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test("POST /api/posts creates a new post", async () => {
  const newPost = { title: "Test Post", body: "Content" };
  const res = await supertest(serverApp).post('/api/posts').send(newPost);
  expect(res.status).toBe(201);
  expect(res.body.title).toBe("Test Post");
});

// ---------- Client API Integration ----------
import { render, screen, waitFor } from '@testing-library/react';
import App from '../../App';

test('App fetches and displays posts', async () => {
  render(<App />);
  await waitFor(() => expect(screen.getByText(/Posts/i)).toBeInTheDocument());
});


// ====================
// Task 4: End-to-End Testing
// ====================

// Using Cypress
// Install: npm install --save-dev cypress
// cypress/e2e/blog.spec.js
describe('Blog App E2E', () => {
  it('loads homepage and shows posts', () => {
    cy.visit('http://localhost:5173');
    cy.contains('Posts');
  });

  it('creates a new blog post', () => {
    cy.get('input[name=title]').type('New Post');
    cy.get('textarea[name=body]').type('Blog content');
    cy.get('button[type=submit]').click();
    cy.contains('New Post');
  });

  it('navigates to post details', () => {
    cy.contains('New Post').click();
    cy.url().should('include', '/posts/');
  });
});


// ====================
// Task 5: Debugging Techniques
// ====================

// ---------- Server-side Logging ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

// ---------- Client-side Error Boundary ----------
import React from 'react';
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError(error) { return { hasError: true }; }
  render() { 
    if (this.state.hasError) return <h1>Something went wrong.</h1>;
    return this.props.children;
  }
}
export default ErrorBoundary;

// ---------- Browser DevTools ----------
/*
- Use Network tab to inspect API requests
- Use React DevTools to debug component tree
- Use console for logs
- Use Performance tab for profiling
*/

// ---------- Performance Monitoring ----------
/*
- Lighthouse audits
- React Profiler to find slow renders
- Optimize MongoDB queries and indexing for speed
*/
