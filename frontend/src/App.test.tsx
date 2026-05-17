import React from 'react';
import { render, screen } from '@testing-library/react';
import { APP_COPY } from './config/appCopy';
import App from './App';

test('renders the application header', () => {
  render(<App />);
  const titleElement = screen.getByText(APP_COPY.app.title);
  expect(titleElement).toBeInTheDocument();
});
