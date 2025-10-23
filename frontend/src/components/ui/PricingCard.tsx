import { PricingPlan } from '@/types/pricing'
import React from 'react'
import Button from './Button'
import { Separator } from './separator'
import { Check } from 'lucide-react'


const PricingCard = ({ title, price, features }: PricingPlan) => {
    return (
        <div className='min-w-[350px] min-h-[500px] flex flex-col group rounded-[18px] hover:-translate-y-6 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] 
        transition-all duration-300 ease-out hover:border-gray-300 hover:scale-[1.02] p-4 bg-[#FF9B4F] will-change-transform'
            style={{
                boxShadow: '0 1px 0 0 #FFA76A inset, 0 1px 3px -1px #A84D09, 0 0 0 1px #F46F0B'
            }}>
            <div className='bg-white rounded-[18px] p-4 min-h-40 flex flex-col justify-between'>
                <h2 className='text-gray-600 text-left text-sm'>{title}</h2>
                <h1 className='text-black text-left text-4xl font-bold'>{price}</h1>
                <Button text='Choose Plan' className='mt-4 w-full h-10 text-black' />
            </div>
            <Separator className='my-6 bg-gray-200' />
            {features.map((feature, index) => (
                <div key={index} className='flex items-center gap-6 mb-8'>
                    <Check className='w-4 h-4 bg-black' />
                    <p className='text-gray-700 text-sm whitespace-nowrap'>{feature}</p>
                </div>
            ))}
        </div>
    )
}

export default PricingCard