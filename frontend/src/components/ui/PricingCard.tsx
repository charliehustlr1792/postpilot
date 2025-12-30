import { PricingPlan } from '@/types/pricing'
import React from 'react'
import Button from './Button'
import { Separator } from './separator'
import { Check } from 'lucide-react'

const PricingCard = ({ title, price, features }: PricingPlan) => {
    return (
        <div className='w-full max-w-[400px] mx-auto min-h-[500px] flex flex-col group rounded-[18px] 
        hover:-translate-y-6 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] 
        transition-all duration-300 ease-out hover:border-gray-300 hover:scale-[1.02] 
        p-3 sm:p-4 bg-[#FF9B4F] will-change-transform'
            style={{
                boxShadow: '0 1px 0 0 #FFA76A inset, 0 1px 3px -1px #A84D09, 0 0 0 1px #F46F0B'
            }}>
            <div className='bg-white rounded-[18px] p-4 sm:p-6 min-h-[140px] sm:min-h-40 flex flex-col justify-between'>
                <h2 className='text-gray-600 text-left text-xs sm:text-sm font-medium'>{title}</h2>
                <h1 className='text-black text-left text-3xl sm:text-4xl font-bold mt-2'>{price}</h1>
                <Button text='Choose Plan' className='mt-3 sm:mt-4 w-full h-10 sm:h-11 text-sm sm:text-base text-black font-medium' />
            </div>
            <Separator className='my-4 sm:my-6 bg-gray-200' />
            <div className='flex-1'>
                {features.map((feature, index) => (
                    <div key={index} className='flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6'>
                        <div className='flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white flex items-center justify-center'>
                            <Check className='w-3 h-3 sm:w-4 sm:h-4 text-[#FF9B4F] stroke-[3]' />
                        </div>
                        <p className='text-white text-xs sm:text-sm font-medium leading-relaxed'>{feature}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PricingCard