import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Check, Star, Zap, Shield, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const Pricing = () => {
  const { user, updateProfile } = useApp();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPlan = user?.plan || 'free';

  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: 0,
      description: 'Perfect for getting started',
      features: [
        'Limited job applications (5/day)',
        'Basic profile visibility',
        'Standard support',
      ],
      icon: Shield,
      color: 'gray',
    },
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 199,
      description: 'Ideal for growing freelancers',
      features: [
        'Unlimited job applications',
        'Highlighted profile',
        'Priority job listing',
        'Email support',
      ],
      icon: Zap,
      color: 'brand',
      recommended: true,
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: 499,
      description: 'For top-tier professionals',
      features: [
        'Top profile visibility',
        'Instant chat access',
        'Featured freelancer badge',
        'Notifications priority',
        '24/7 Priority support',
      ],
      icon: Crown,
      color: 'amber',
    },
  ];

  const handleSubscribe = (plan) => {
    if (!user) {
      toast.error('Please log in to subscribe to a plan.');
      navigate('/login');
      return;
    }
    if (plan.id === 'free') {
      return;
    }
    if (plan.id === currentPlan) {
      toast.success('You are already on this plan.');
      return;
    }
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const processPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(async () => {
      await updateProfile({ plan: selectedPlan.id });
      setIsProcessing(false);
      setShowPayment(false);
      toast.success('Payment Successful! Plan upgraded to ' + selectedPlan.name);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="primary" className="mb-4">Upgrade Your Experience</Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Choose the perfect plan for your goals</h1>
        <p className="text-xl text-gray-500">Whether you're just starting out or scaling your freelance business, we have a plan for you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const Icon = plan.icon;
          
          return (
            <motion.div 
              key={plan.id}
              whileHover={{ y: -8 }}
              className={`relative flex flex-col ${plan.recommended ? 'z-10' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                  <span className="bg-brand-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-lg">
                    Recommended
                  </span>
                </div>
              )}
              
              <Card className={`flex-1 p-8 border-2 ${
                plan.recommended ? 'border-brand-500 shadow-2xl shadow-brand-500/20' : 
                isCurrent ? 'border-emerald-500 bg-emerald-50/10' : 'border-gray-100'
              }`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-2xl ${
                    plan.color === 'brand' ? 'bg-brand-100 text-brand-600' :
                    plan.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <span className="text-4xl font-extrabold text-gray-900">₹{plan.price}</span>
                  <span className="text-gray-500 font-medium">/month</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-gray-600 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => handleSubscribe(plan)}
                  variant={plan.recommended && !isCurrent ? 'primary' : isCurrent ? 'outline' : 'secondary'}
                  className={`w-full py-4 text-lg ${isCurrent ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : ''}`}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Current Plan' : (plan.price === 0 ? 'Get Started' : 'Subscribe Now')}
                </Button>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && selectedPlan && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => !isProcessing && setShowPayment(false)} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
                {!isProcessing && (
                  <button onClick={() => setShowPayment(false)} className="text-gray-400 hover:text-gray-600">
                    <Check className="hidden" /> {/* Placeholder for X icon if needed, let's just text */}
                    ✕
                  </button>
                )}
              </div>
              
              <div className="p-8">
                <div className="flex justify-between items-center mb-6 p-4 bg-brand-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Selected Plan</p>
                    <p className="text-lg font-bold text-gray-900">{selectedPlan.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500">Total</p>
                    <p className="text-2xl font-extrabold text-brand-600">₹{selectedPlan.price}</p>
                  </div>
                </div>

                <form onSubmit={processPayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input type="text" placeholder="4242 4242 4242 4242" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-500" required disabled={isProcessing} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-500" required disabled={isProcessing} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                      <input type="text" placeholder="123" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-500" required disabled={isProcessing} />
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button type="submit" className="w-full py-4 text-lg flex items-center justify-center gap-2" disabled={isProcessing}>
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        `Pay ₹${selectedPlan.price}`
                      )}
                    </Button>
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-4">
                    This is a secure mock payment gateway for demonstration purposes.
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
