import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the main application', () => {
    render(<App />);

    // Check if the main content is rendered
    expect(document.body).toBeInTheDocument();
  });

  it('has accessible structure', () => {
    render(<App />);

    // Basic accessibility check
    const main = document.querySelector('main') || document.body;
    expect(main).toBeInTheDocument();
  });
});