import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Check } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$49',
      period: '/month',
      description: 'Ideal for growing startups managing up to 5 active job openings.',
      features: [
        'Up to 5 active job postings',
        'Unlimited candidate applications',
        'Basic ATS Kanban pipeline',
        'Resume storage (up to 10GB)',
        'Email notifications',
        'Community support',
      ],
      popular: false,
      cta: 'Start with Starter',
      role: 'RECRUITER',
    },
    {
      name: 'Growth',
      price: '$149',
      period: '/month',
      description: 'For scaling companies with active hiring teams and multiple departments.',
      features: [
        'Up to 25 active job openings',
        'Interactive ATS Kanban pipeline',
        'Interview scheduling & scorecards',
        'Conflict prevention calendar',
        'Real-time Socket.IO alerts',
        'Advanced recruitment analytics',
        'Priority email & chat support',
      ],
      popular: true,
      cta: 'Start Free Trial',
      role: 'RECRUITER',
    },
    {
      name: 'Enterprise',
      price: '$399',
      period: '/month',
      description: 'Custom solutions for global enterprises needing limitless scale.',
      features: [
        'Unlimited job openings',
        'Unlimited team members & interviewers',
        'Dedicated database isolation & SLA',
        'Custom candidate evaluation criteria',
        'Full REST API & webhook access',
        'Dedicated account manager',
        'Custom SSO & security reviews',
      ],
      popular: false,
      cta: 'Contact Sales',
      role: 'RECRUITER',
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-6xl space-y-16">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Transparent, Flexible Pricing</h1>
        <p className="text-base text-slate-600">
          Scale your recruiting without unexpected fees. Every plan includes our core applicant tracking system.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-3xl p-8 bg-white border flex flex-col justify-between transition-all duration-200 ${
              plan.popular
                ? 'border-primary-500 shadow-xl shadow-primary-500/10 ring-2 ring-primary-500/20 relative'
                : 'border-slate-200/80 shadow-xs hover:shadow-md'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary-600 text-white text-xs font-semibold uppercase tracking-wider shadow-sm">
                Most Popular
              </span>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                <span className="text-sm font-medium text-slate-500">{plan.period}</span>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Included features:</p>
                {plan.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-3 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <Link to={`/register?role=${plan.role}`}>
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  size="md"
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

