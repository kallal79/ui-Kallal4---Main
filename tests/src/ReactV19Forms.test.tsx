import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { useState, useRef, FormEvent } from 'react';

// Basic controlled form
function ControlledForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };
  
  return (
    <div>
      <h2>Controlled Form</h2>
      <form onSubmit={handleSubmit} data-testid="controlled-form">
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            data-testid="name-input"
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            data-testid="email-input"
          />
        </div>
        <button type="submit" data-testid="submit-button">Submit</button>
      </form>
      
      {submitted && (
        <div data-testid="submission-result">
          <h3>Form Submitted</h3>
          <p>Name: {formData.name}</p>
          <p>Email: {formData.email}</p>
        </div>
      )}
    </div>
  );
}

// Uncontrolled form using refs
function UncontrolledForm() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (nameRef.current && emailRef.current) {
      setFormData({
        name: nameRef.current.value,
        email: emailRef.current.value,
      });
      setSubmitted(true);
    }
  };
  
  return (
    <div>
      <h2>Uncontrolled Form</h2>
      <form onSubmit={handleSubmit} data-testid="uncontrolled-form">
        <div>
          <label htmlFor="uncontrolled-name">Name:</label>
          <input
            type="text"
            id="uncontrolled-name"
            name="name"
            ref={nameRef}
            defaultValue=""
            data-testid="uncontrolled-name-input"
          />
        </div>
        <div>
          <label htmlFor="uncontrolled-email">Email:</label>
          <input
            type="email"
            id="uncontrolled-email"
            name="email"
            ref={emailRef}
            defaultValue=""
            data-testid="uncontrolled-email-input"
          />
        </div>
        <button type="submit" data-testid="uncontrolled-submit-button">Submit</button>
      </form>
      
      {submitted && (
        <div data-testid="uncontrolled-submission-result">
          <h3>Form Submitted</h3>
          <p>Name: {formData.name}</p>
          <p>Email: {formData.email}</p>
        </div>
      )}
    </div>
  );
}

// Form with async submission
function AsyncForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Simulate validation
      if (formData.username.length < 3) {
        throw new Error('Username must be at least 3 characters');
      }
      
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError((err as Error).message);
    }
  };
  
  return (
    <div>
      <h2>Async Form</h2>
      <form onSubmit={handleSubmit} data-testid="async-form">
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            data-testid="username-input"
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            data-testid="password-input"
          />
        </div>
        <button 
          type="submit" 
          disabled={status === 'submitting'}
          data-testid="async-submit-button"
        >
          {status === 'submitting' ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      
      {status === 'success' && (
        <div data-testid="success-message">
          <h3>Form Submitted Successfully</h3>
        </div>
      )}
      
      {status === 'error' && (
        <div data-testid="error-message">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

describe('React v19 Forms Tests', () => {
  it('controlled form works correctly', () => {
    render(<ControlledForm />);
    
    // Fill out the form
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'John Doe' },
    });
    
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'john@example.com' },
    });
    
    // Submit the form
    fireEvent.submit(screen.getByTestId('controlled-form'));
    
    // Check that the form was submitted with the correct values
    expect(screen.getByTestId('submission-result')).toBeInTheDocument();
    expect(screen.getByText('Name: John Doe')).toBeInTheDocument();
    expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
  });
  
  it('uncontrolled form works correctly', () => {
    render(<UncontrolledForm />);
    
    // Fill out the form
    fireEvent.change(screen.getByTestId('uncontrolled-name-input'), {
      target: { value: 'Jane Doe' },
    });
    
    fireEvent.change(screen.getByTestId('uncontrolled-email-input'), {
      target: { value: 'jane@example.com' },
    });
    
    // Submit the form
    fireEvent.submit(screen.getByTestId('uncontrolled-form'));
    
    // Check that the form was submitted with the correct values
    expect(screen.getByTestId('uncontrolled-submission-result')).toBeInTheDocument();
    expect(screen.getByText('Name: Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Email: jane@example.com')).toBeInTheDocument();
  });
  
  it('async form handles successful submission', async () => {
    render(<AsyncForm />);
    
    // Fill out the form with valid data
    fireEvent.change(screen.getByTestId('username-input'), {
      target: { value: 'johndoe' },
    });
    
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'password123' },
    });
    
    // Submit the form
    fireEvent.submit(screen.getByTestId('async-form'));
    
    // Check that the button is disabled during submission
    expect(screen.getByTestId('async-submit-button')).toBeDisabled();
    
    // Wait for the submission to complete
    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toBeInTheDocument();
    });
  });
  
  it('async form handles validation errors', async () => {
    render(<AsyncForm />);
    
    // Fill out the form with invalid data
    fireEvent.change(screen.getByTestId('username-input'), {
      target: { value: 'jo' }, // Too short
    });
    
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'pass' }, // Too short
    });
    
    // Submit the form
    fireEvent.submit(screen.getByTestId('async-form'));
    
    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
  });
});