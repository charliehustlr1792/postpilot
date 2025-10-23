import React from 'react'
import PricingCard from './ui/PricingCard'
const pricingplans=[
    {
        title:"Basic",
        price:"Free",
        features:[
            "Feature 1",
            "Feature 2",
            "Feature 3"
        ]
    },{
        title:"Pro",    
        price:"$29.99/mo",
        features:[
            "Feature 1",
            "Feature 2",
            "Feature 3",
            "Feature 4"
        ]
    },{
        title:"Enterprise",
        price:"$49.99/mo",
        features:[
            "Feature 1",
            "Feature 2",
            "Feature 3",
            "Feature 4",
            "Feature 5"
        ]
    }
]

const Pricing = () => {
  return (
    <div className='relative grid grid-cols-3 justify-between gap-10 mt-10 max-w-7xl mx-auto mb-16'>
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