import React from 'react'
import { Check, X } from 'lucide-react'

interface ReasonCardProps {
    title: string
    reasons: string[]
    isHighlighted: boolean
    useCross?: boolean
}


const ReasonCard = ({ title, reasons, isHighlighted, useCross = false }: ReasonCardProps) => {
    const Icon = useCross ? X : Check
    const iconColor = useCross ? 'text-red-500' : 'text-green-500'

    return (
        <div className={`w-full max-w-[400px] mx-auto min-h-[400px] flex flex-col rounded-[18px] p-6 ${isHighlighted ? 'bg-[#FF9B4F] shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300' : 'bg-gray-200 shadow-sm'} `}
            style={isHighlighted ? {
                boxShadow: '0 10px 30px rgba(255, 155, 79, 0.3), 0 1px 0 0 #FFA76A inset'
            } : {}}>
            <h2 className={`text-xl font-semibold mb-6 ${isHighlighted ? 'text-white' : 'text-gray-800'}`}>{title}</h2>
            <div className='flex-1 space-y-4'>
                {reasons.map((reason, index) => (
                    <div key={index} className='flex items-start gap-3'>
                        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
                        <p className={`text-sm leading-relaxed ${isHighlighted ? 'text-white' : 'text-gray-600'}`}>{reason}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}


export default ReasonCard