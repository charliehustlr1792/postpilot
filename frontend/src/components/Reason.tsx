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
    <div className='grid grid-cols-3 gap-6 max-w-7xl mx-auto mb-16 mt-10'>
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