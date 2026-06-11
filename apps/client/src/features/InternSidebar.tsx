import { Calendar, FileClock, Home, LogOut, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import profilepic from "../assets/images/default_pic.png";
import type { UserProfile } from '../../../shared/types/profile.types';
import { logoutUserAPI } from '../api/auth.api';

const navItems = [
  {
    label: 'Home',
    path: '/intern/dashboard',
    icon: Home,
  },
  {
    label: 'Profile',
    path: '/intern/profile',
    icon: User,
  },
  {
    label: 'File a Leave',
    path: '/intern/leave',
    icon: Calendar,
  },
  {
    label: 'Logs',
    path: '/intern/logs',
    icon: FileClock,
  },
];

function getAuthUser(): UserProfile | null {
  const storedUser = localStorage.getItem('authUser');

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as UserProfile;
  } catch {
    return null;
  }
}

function getFullName(user: UserProfile | null) {
  if (!user) return 'Intern';

  const fullName = [
    user.first_name,
    user.last_name,
  ]
    .filter(Boolean)
    .join(' ');

  return fullName || 'Intern';
}

function getPosition(user: UserProfile | null) {
  if (!user) return 'No Position';

  const position = [
    user.position,
  ]

  return position;
}

function InternSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = getAuthUser();

  const fullName = getFullName(user);
  const position = getPosition(user);

  const handleLogout = async () => {
    try {
      await logoutUserAPI();

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authUser');

      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  const userAvatar = user?.avatar_url || profilepic;

  return (
    <aside className="w-full bg-[#002D6F] px-4 py-5 text-white lg:fixed lg:left-0 lg:top-0 lg:flex lg:h-screen lg:w-[270px] lg:flex-col lg:px-6 lg:py-8">
      <div className="flex items-center gap-4 lg:flex-col lg:gap-0">
        {userAvatar ? (
          <img
            src={userAvatar}
            alt={`${fullName} profile`}
            className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20 lg:h-28 lg:w-28"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-[#d9d9d9] sm:h-20 sm:w-20 lg:h-28 lg:w-28" />
        )}

        <div className="lg:text-center">
          <h2 className="mt-2 text-lg font-bold sm:text-xl">{fullName}</h2>
          <p className="text-xs sm:text-sm">{position}</p>
        </div>
      </div>

      <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:mt-10 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex shrink-0 items-center gap-3 rounded-full px-5 py-3 text-left text-white transition lg:w-full lg:px-6 ${
                isActive ? 'bg-[#FFBF10]' : 'hover:bg-white/10'
              }`}
            >
              <Icon size={18} fill={item.label === 'Home' || item.label === 'Profile' ? 'white' : 'none'} />
              <span className="text-sm sm:text-base">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-5 border-t border-white/40 pt-5 lg:mt-auto lg:border-white/70 lg:pt-7">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 text-white lg:w-full lg:justify-center"
        >
          <LogOut size={18} />
          <span className="text-sm sm:text-base">Log out</span>
        </button>
      </div>
    </aside>
  );
}

export default InternSidebar;