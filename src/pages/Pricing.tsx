import React from 'react'
import { stripeProducts } from '../stripe-config'
import { SubscriptionCard } from '../components/subscription/SubscriptionCard'

export const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Select the perfect subscription plan for your bug tracking needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {stripeProducts.map((product) => (
            <SubscriptionCard key={product.priceId} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}