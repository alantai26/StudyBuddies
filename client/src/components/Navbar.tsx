import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4 border-b border-gray-200 bg-[#FFFBF5]">
      <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
        <img
          src="/Study (2).png"
          className="w-16 h-16"
          alt="StudyBuddies Logo"
        />
      </Link>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="font-semibold text-gray-800">Welcome, {user.name}!</span>
            <Button onClick={logout} variant="outline">Logout</Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="outline" className="border-gray-300 text-gray-800 hover:bg-gray-100 bg-transparent">
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-northeasternRed text-white hover:bg-northeasternRed-darker">Sign up</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}