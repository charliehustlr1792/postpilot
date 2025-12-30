import React from 'react'
import ReasonCard from './ui/ReasonCard'

const content=[
    {
        title:"Social Rails",
        reasons:[
            "Seamless integration with major social platforms",
            "Automated posting and scheduling",
            "Real-time analytics and engagement tracking"
        ],
        isHighlighted: true,
        useCross: false
    },{
        title:"Tools like Looly",
        reasons:[
            "Manual scheduling required",
            "Limited platform support",
            "Basic analytics only"
        ],
        isHighlighted: false,
        useCross: false
    },{
        title:"Your Current Workflow",
        reasons:[
            "Time-consuming manual processes",
            "Inconsistent posting schedules",
            "Lack of performance insights"
        ],
        isHighlighted: false,
        useCross: true
    }
]

const Reason = () => {
  return (
    <div className='relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
    gap-6 sm:gap-8 lg:gap-10 
    mt-8 sm:mt-10 
    w-full max-w-7xl mx-auto 
    mb-12 sm:mb-16 
    px-4 sm:px-6 lg:px-8'>
        {content.map((item, index) => (
            <ReasonCard
                key={index}
                title={item.title}
                reasons={item.reasons}
                isHighlighted={item.isHighlighted}
                useCross={item.useCross}
            />
        ))}
    </div>
  )
}

export default Reason