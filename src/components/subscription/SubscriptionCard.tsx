import React, { useState } from 'react'
import { StripeProduct } from '../../stripe-config'
import { createCheckoutSession } from '../../lib/stripe'
import { Button } from '../ui/Button'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card'
import { Alert } from '../ui/Alert'

interface SubscriptionCardProps {
  product: StripeProduct
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ product }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubscribe = async () => {
    setLoading(true)
    setError('')

    try {
      const { url } = await createCheckoutSession({
        price_id: product.priceId,
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/pricing`,
        mode: product.mode
      })

      window.location.href = url
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout')
      setLoading(false)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <h3 className="text-xl font-semibold">{product.name}</h3>
        <div className="text-3xl font-bold text-blue-600">
          ${product.price}
          <span className="text-sm font-normal text-gray-500">
            /{product.mode === 'subscription' ? 'month' : 'one-time'}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        <p className="text-gray-600">{product.description}</p>
      </CardContent>
      
      <CardFooter>
        {error && (
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
        )}
        <Button
          onClick={handleSubscribe}
          loading={loading}
          className="w-full"
        >
          {product.mode === 'subscription' ? 'Subscribe Now' : 'Buy Now'}
        </Button>
      </CardFooter>
    </Card>
  )
}