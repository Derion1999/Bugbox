import React, { useEffect, useState } from 'react'
import { getUserSubscription, UserSubscription } from '../../lib/stripe'
import { stripeProducts } from '../../stripe-config'
import { Alert } from '../ui/Alert'
import { Card, CardContent, CardHeader } from '../ui/Card'

export const SubscriptionStatus: React.FC = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await getUserSubscription()
        setSubscription(data)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch subscription')
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert type="error">
        {error}
      </Alert>
    )
  }

  if (!subscription || subscription.subscription_status === 'not_started') {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Subscription Status</h3>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No active subscription found.</p>
        </CardContent>
      </Card>
    )
  }

  const product = stripeProducts.find(p => p.priceId === subscription.price_id)
  const isActive = ['active', 'trialing'].includes(subscription.subscription_status)

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Subscription Status</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Plan:</span>
            <span className="font-medium">{product?.name || 'Unknown Plan'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`font-medium ${isActive ? 'text-green-600' : 'text-red-600'}`}>
              {subscription.subscription_status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          {subscription.current_period_end && (
            <div className="flex justify-between">
              <span className="text-gray-600">
                {subscription.cancel_at_period_end ? 'Expires:' : 'Renews:'}
              </span>
              <span className="font-medium">
                {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
              </span>
            </div>
          )}
          {subscription.payment_method_brand && subscription.payment_method_last4 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium">
                {subscription.payment_method_brand.toUpperCase()} ****{subscription.payment_method_last4}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}