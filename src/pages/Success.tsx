import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'

export const Success: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Thank you for your purchase. Your subscription has been activated and you now have access to all premium features.
            </p>
            <div className="space-y-2">
              <Link to="/">
                <Button className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" className="w-full">
                  View Plans
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}