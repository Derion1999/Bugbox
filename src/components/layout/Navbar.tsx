import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { Button } from '../ui/Button'
import { Bug, LogOut, Settings } from 'lucide-react'

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Bug className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">BugBox</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/pricing">
                  <Button variant="ghost">Pricing</Button>
                </Link>
                <Link to="/settings">
                  <Button variant="ghost">
                    <Settings className="w-4 h-4 mr-1" />
                    Settings
                  </Button>
                </Link>
                <span className="text-sm text-gray-600">{user.email}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}