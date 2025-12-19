import Stripe from 'stripe';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

console.log('🔑 Stripe Secret Key loaded:', process.env.STRIPE_SECRET_KEY ? 'Yes' : 'No');

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is not set in environment variables');
  console.error('Please check your .env file and ensure STRIPE_SECRET_KEY is properly set');
  throw new Error('STRIPE_SECRET_KEY is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default stripe;
