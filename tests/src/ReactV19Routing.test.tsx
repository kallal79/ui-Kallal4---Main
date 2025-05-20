import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { 
  RouterProvider, 
  createMemoryRouter, 
  Link, 
  Outlet, 
  useParams, 
  useNavigate,
  useLocation
} from 'react-router-dom';

// Layout component
function Layout() {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/" data-testid="home-link">Home</Link>
          </li>
          <li>
            <Link to="/about" data-testid="about-link">About</Link>
          </li>
          <li>
            <Link to="/users" data-testid="users-link">Users</Link>
          </li>
        </ul>
      </nav>
      <hr />
      <Outlet />
    </div>
  );
}

// Home component
function Home() {
  return <div data-testid="home-page">Home Page</div>;
}

// About component
function About() {
  return <div data-testid="about-page">About Page</div>;
}

// Users component
function Users() {
  return (
    <div data-testid="users-page">
      <h2>Users</h2>
      <ul>
        <li>
          <Link to="/users/1" data-testid="user-1-link">User 1</Link>
        </li>
        <li>
          <Link to="/users/2" data-testid="user-2-link">User 2</Link>
        </li>
      </ul>
      <Outlet />
    </div>
  );
}

// User component
function User() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <div data-testid={`user-${userId}-page`}>
      <h3>User {userId}</h3>
      <p>Current path: {location.pathname}</p>
      <button 
        onClick={() => navigate('/users')}
        data-testid="back-to-users-button"
      >
        Back to Users
      </button>
    </div>
  );
}

// Not Found component
function NotFound() {
  return <div data-testid="not-found-page">Page Not Found</div>;
}

// Create routes
const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'users',
        element: <Users />,
        children: [
          {
            path: ':userId',
            element: <User />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];

describe('React v19 Routing Tests', () => {
  it('renders the home page by default', () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/'],
    });
    
    render(<RouterProvider router={router} />);
    
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
  
  it('navigates to the about page when clicking the about link', () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/'],
    });
    
    render(<RouterProvider router={router} />);
    
    fireEvent.click(screen.getByTestId('about-link'));
    
    expect(screen.getByTestId('about-page')).toBeInTheDocument();
  });
  
  it('navigates to the users page when clicking the users link', () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/'],
    });
    
    render(<RouterProvider router={router} />);
    
    fireEvent.click(screen.getByTestId('users-link'));
    
    expect(screen.getByTestId('users-page')).toBeInTheDocument();
  });
  
  it('navigates to a user page when clicking a user link', () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/users'],
    });
    
    render(<RouterProvider router={router} />);
    
    fireEvent.click(screen.getByTestId('user-1-link'));
    
    expect(screen.getByTestId('user-1-page')).toBeInTheDocument();
  });
  
  it('navigates back to users when clicking the back button', () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/users/1'],
    });
    
    render(<RouterProvider router={router} />);
    
    fireEvent.click(screen.getByTestId('back-to-users-button'));
    
    expect(screen.getByTestId('users-page')).toBeInTheDocument();
    expect(screen.queryByTestId('user-1-page')).not.toBeInTheDocument();
  });
  
  it('renders the not found page for unknown routes', () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/unknown'],
    });
    
    render(<RouterProvider router={router} />);
    
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  });
});