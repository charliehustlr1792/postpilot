import React from 'react'
import { cn } from '@/lib/utils'

interface Props{
    text:string,
    className?:string,
    onClick?:() => void
}

const Button = (props:Props) => {
  return (
    <button 
      className={cn(
        "flex px-5 py-[9px] justify-center items-center rounded-full cursor-pointer",
        "text-white text-sm font-[560] leading-[18px] whitespace-nowrap",
        "transition-all duration-200 active:scale-95",
        props.className
      )}
      style={{
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.16) 100%), #FF6E00',
        boxShadow: '0 1px 0 0 #FFA76A inset, 0 1px 3px -1px #A84D09, 0 0 0 1px #F46F0B',
        fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
        textShadow: '0 0.8px 0.7px #D96F1D'
      }}
      onClick={props.onClick}
    >
      {props.text}
    </button>
  )
}

export default Button

