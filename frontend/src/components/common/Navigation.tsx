import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  User,
  Heart,
  BookOpen,
  Star,
  Search,
  Home,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">MovieRec</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/">
              <Button
                variant={isActive('/') ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link to="/movies">
              <Button
                variant={isActive('/movies') ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Discover
              </Button>
            </Link>

            {isAuthenticated && (
              <>
                <Link to="/favorites">
                  <Button
                    variant={isActive('/favorites') ? 'default' : 'ghost'}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Heart className="h-4 w-4" />
                    Favorites
                    {user?.stats?.totalFavorites && user.stats.totalFavorites > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {user.stats.totalFavorites}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link to="/watchlists">
                  <Button
                    variant={isActive('/watchlists') ? 'default' : 'ghost'}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    Watchlists
                    {user?.stats?.totalWatchlists && user.stats.totalWatchlists > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {user.stats.totalWatchlists}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link to="/ratings">
                  <Button
                    variant={isActive('/ratings') ? 'default' : 'ghost'}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Star className="h-4 w-4" />
                    Reviews
                    {user?.stats?.totalMoviesRated && user.stats.totalMoviesRated > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {user.stats.totalMoviesRated}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <span className="hidden md:block">{user?.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* Mobile Navigation Links */}
                  <div className="md:hidden">
                    <DropdownMenuItem asChild>
                      <Link to="/favorites" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Favorites
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/watchlists" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Watchlists
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/ratings" className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Reviews
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </div>
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation for Non-Authenticated Users */}
        {!isAuthenticated && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <div className="flex items-center space-x-1">
              <Link to="/movies" className="flex-1">
                <Button
                  variant={isActive('/movies') ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full flex items-center gap-2 justify-center"
                >
                  <Search className="h-4 w-4" />
                  Discover
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};