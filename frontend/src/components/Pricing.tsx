import React from 'react'
import PricingCard from './ui/PricingCard'

const pricingplans = [
    {
        title: "Basic",
        price: "Free",
        features: [
            "Up to 5 scheduled posts",
            "1 social account",
            "Basic analytics",
            "Email support"
        ]
    }, {
        title: "Pro",
        price: "$29/mo",
        features: [
            "Unlimited scheduled posts",
            "5 social accounts",
            "Advanced analytics",
            "AI-powered suggestions",
            "Priority support",
            "Team collaboration"
        ]
    }, {
        title: "Enterprise",
        price: "$99/mo",
        features: [
            "Everything in Pro",
            "Unlimited social accounts",
            "Custom branding",
            "API access",
            "Dedicated account manager",
            "Advanced security",
            "Custom integrations"
        ]
    }
]

const Pricing = () => {
    return (
        <div className='relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mt-8 sm:mt-10 w-full max-w-7xl mx-auto mb-12 sm:mb-16 px-4 sm:px-6 lg:px-8'>
            {pricingplans.map((plan, index) => (
                <PricingCard
                    key={index}
                    title={plan.title}
                    price={plan.price}
                    features={plan.features}
                />
            ))}
        </div>
    )
}

export default Pricing