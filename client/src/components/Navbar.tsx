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
      <div className="flex flex-1 justify-start space-x-8 ml-8">
        {user && (
          <>
            <Link to="/profile">
              <Button className="text-xl font-bold text-gray-900 font-sans">Profile</Button>
            </Link>
            <Link to="/scan-schedule">
              <Button className="text-xl font-bold text-gray-900 font-sans">Scan Your Schedule</Button>
            </Link>
            <Link to="/courses">
              <Button className="text-xl font-bold text-gray-900 font-sans">Courses</Button>
            </Link>
          </>
        )}

      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-xl font-bold text-gray-900 font-sans">Welcome, {user.name}!</span>
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