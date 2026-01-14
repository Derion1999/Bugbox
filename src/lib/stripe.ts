import { supabase } from './supabase'

export interface CheckoutSessionRequest {
  price_id: string
  success_url: string
  cancel_url: string
  mode: 'payment' | 'subscription'
}

export interface CheckoutSessionResponse {
  sessionId: string
  url: string
}

export const createCheckoutSession = async (request: CheckoutSessionRequest): Promise<CheckoutSessionResponse> => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.access_token) {
    throw new Error('No authentication token found')
  }

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to create checkout session')
  }

  return response.json()
}

export interface UserSubscription {
  customer_id: string
  subscription_id: string | null
  subscription_status: string
  price_id: string | null
  current_period_start: number | null
  current_period_end: number | null
  cancel_at_period_end: boolean
  payment_method_brand: string | null
  payment_method_last4: string | null
}

export const getUserSubscription = async (): Promise<UserSubscription | null> => {
  const { data, error } = await supabase
    .from('stripe_user_subscriptions')
    .select('*')
    .maybeSingle()

  if (error) {
    console.error('Error fetching subscription:', error)
    throw error
  }

  return data
}