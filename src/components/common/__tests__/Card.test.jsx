import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from '../Card';

describe('Card Component', () => {
  test('renders basic card with children', () => {
    render(
      <Card>
        <p>Test content</p>
      </Card>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('renders card with header', () => {
    render(
      <Card header="Test Header">
        <p>Test content</p>
      </Card>
    );
    
    expect(screen.getByText('Test Header')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('renders card with footer', () => {
    render(
      <Card footer={<button>Footer Button</button>}>
        <p>Test content</p>
      </Card>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByText('Footer Button')).toBeInTheDocument();
  });

  test('handles click events when interactive', () => {
    const handleClick = jest.fn();
    
    render(
      <Card onClick={handleClick}>
        <p>Clickable content</p>
      </Card>
    );
    
    fireEvent.click(screen.getByText('Clickable content'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('shows loading state', () => {
    render(
      <Card loading={true}>
        <p>Content</p>
      </Card>
    );
    
    // Should show loading skeleton instead of content
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  test('applies correct variant classes', () => {
    const { container } = render(
      <Card variant="elevated">
        <p>Test content</p>
      </Card>
    );
    
    expect(container.firstChild).toHaveClass('shadow-lg');
  });

  test('applies custom className', () => {
    const { container } = render(
      <Card className="custom-class">
        <p>Test content</p>
      </Card>
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
