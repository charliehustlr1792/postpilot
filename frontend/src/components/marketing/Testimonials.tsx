'use client'
import React from "react";
import { Star, StarHalf } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    quote: "PostPilot transformed how I manage my social media. I went from spending 3 hours a day to just 30 minutes a week. The scheduling feature is a game-changer!",
    name: "Sarah Martinez",
    title: "Content Creator",
    rating: 4,
    avatarUrl: "https://i.pravatar.cc/100?img=32",
    platform: "Instagram & Twitter"
  },
  {
    quote: "As a small business owner, PostPilot helped me maintain a consistent presence across all platforms without hiring a social media manager. It pays for itself!",
    name: "David Chen",
    title: "Small Business Owner",
    rating: 4.5,
    avatarUrl: "https://i.pravatar.cc/100?img=12",
    platform: "LinkedIn & Facebook"
  },
  {
    quote: "The AI suggestions are incredible! It's like having a creative assistant who knows exactly what my audience wants to see. My engagement has doubled in just two months.",
    name: "Emily Rodriguez",
    title: "Digital Marketer",
    rating: 4,
    avatarUrl: "https://i.pravatar.cc/100?img=47",
    platform: "All Platforms"
  },
  {
    quote: "PostPilot's team collaboration features made coordinating with my marketing team seamless. No more endless email chains or missed approvals. Highly recommend!",
    name: "Michael Thompson",
    title: "Marketing Director",
    rating: 4.5,
    avatarUrl: "https://i.pravatar.cc/100?img=7",
    platform: "Twitter & LinkedIn"
  },
  {
    quote: "I love the analytics dashboard! Seeing which posts perform best helps me create better content. PostPilot has become an essential tool for my freelance work.",
    name: "Jessica Lee",
    title: "Freelance Social Media Manager",
    rating: 4,
    avatarUrl: "https://i.pravatar.cc/100?img=44",
    platform: "Instagram & Pinterest"
  },
  {
    quote: "The calendar view is perfect for planning campaigns. I can visualize my entire content strategy at a glance. PostPilot makes social media management actually enjoyable!",
    name: "Alex Hendricks",
    title: "Startup Founder",
    rating: 5,
    avatarUrl: "https://i.pravatar.cc/100?img=15",
    platform: "Twitter & Reddit"
  },
  {
    quote: "PostPilot saved our agency countless hours. We manage 15+ client accounts and the bulk scheduling feature is absolutely phenomenal. Our productivity has skyrocketed!",
    name: "Rachel Foster",
    title: "Agency Owner",
    rating: 4,
    avatarUrl: "https://i.pravatar.cc/100?img=49",
    platform: "All Platforms"
  },
  {
    quote: "I was skeptical about scheduling tools, but PostPilot won me over. The interface is intuitive, the AI is smart, and my posts go out exactly when they should. Perfect!",
    name: "James Wilson",
    title: "Influencer",
    rating: 5,
    avatarUrl: "https://i.pravatar.cc/100?img=2",
    platform: "TikTok & Instagram"
  }
];

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  rating: number;
  avatarUrl: string;
  platform: string;
}

interface MarqueeRowProps {
  items: Testimonial[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
}

const TestimonialCard = ({ item }: { item: Testimonial }) => (
  <div className="flex-shrink-0 w-[340px] group">
    <div className="h-full p-5 rounded-[16px] bg-white border border-[#EAE7E4] shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(255,155,79,0.15)] hover:border-[#FF9B4F] transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD4B2]/0 to-[#FF9B4F]/0 group-hover:from-[#FFD4B2]/5 group-hover:to-[#FF9B4F]/5 transition-all duration-500 pointer-events-none rounded-[16px]" aria-hidden="true" />

      <div className="relative z-10">
        <div className="flex gap-1 mb-3" aria-label={`${item.rating} out of 5 stars`}>
          {[...Array(Math.floor(item.rating))].map((_, i) => (
            <Star key={`full-${i}`} className="w-4 h-4 fill-[#FF9B4F] text-[#FF9B4F] transition-all duration-300 group-hover:scale-110" aria-hidden="true" />
          ))}
          {item.rating % 1 >= 0.5 && (
            <StarHalf className="w-4 h-4 fill-[#FF9B4F] text-[#FF9B4F] transition-all duration-300 group-hover:scale-110" aria-hidden="true" />
          )}
        </div>

        <p className="text-[#4D4946] text-sm leading-relaxed mb-4 line-clamp-3 group-hover:text-[#181817] transition-colors duration-300">
          &ldquo;{item.quote}&rdquo;
        </p>

        <div className="w-10 h-0.5 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] rounded-full mb-4 group-hover:w-16 transition-all duration-500" aria-hidden="true" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF9B4F] to-[#FF6E00] p-0.5 shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
            <Image
              src={item.avatarUrl}
              alt={`${item.name} headshot`}
              width={40}
              height={40}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[#181817] font-semibold text-sm group-hover:text-[#FF6E00] transition-colors duration-300 truncate">
              {item.name}
            </h4>
            <p className="text-[#4D4946]/70 text-xs truncate">{item.title}</p>
            <p className="text-[#FF9B4F] text-[10px] font-medium mt-0.5">{item.platform}</p>
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#FF9B4F]/10 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
    </div>
  </div>
)

const MarqueeRow: React.FC<MarqueeRowProps> = ({ items, direction = "left", speed = "normal" }) => {
  const duration = speed === "fast" ? "20s" : speed === "slow" ? "50s" : "35s"
  const animationName = direction === "left" ? "marquee-left" : "marquee-right"

  return (
    <>
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
      `}</style>
      <div className="relative w-full overflow-hidden">
        <div
          className="flex gap-4 py-4 w-max"
          style={{
            animation: `${animationName} ${duration} linear infinite`,
            willChange: 'transform',
          }}
          aria-hidden="true"
        >
          {[...items, ...items, ...items].map((item, idx) => (
            <TestimonialCard key={idx} item={item} />
          ))}
        </div>
      </div>
    </>
  )
}

const PostPilotTestimonials = () => {
  return (
    <section className="w-full py-20 md:py-28 bg-[#F3EFEC] relative overflow-hidden" aria-label="Customer testimonials">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 left-10 w-2 h-2 rounded-full bg-[#FF9B4F] animate-pulse" />
        <div className="absolute top-40 right-20 w-3 h-3 rounded-full bg-[#FFB67D] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-1/4 w-2 h-2 rounded-full bg-[#FF6E00] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-1/3 w-3 h-3 rounded-full bg-[#FFD4B2] animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="container mx-auto px-6 md:px-8 lg:px-10 relative z-10 mb-12">
        <div className="text-center">
          <div className="inline-flex h-[34px] px-[14px] py-2 justify-center items-center gap-1 rounded-[100px] border border-[#EAE7E4] bg-white mb-6">
            <span className="text-[#4D4946] text-base font-[420] leading-[19px]">
              Loved by Creators
            </span>
            <svg width="24" height="24" viewBox="0 0 25 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5001 17L20.5 12L15.5 7" stroke="#FF9B4F" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4.5 12H20.5" stroke="#FF9B4F" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-[#181817] text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            What Our Users Say
          </h2>
          <p className="text-[#4D4946] text-lg md:text-xl max-w-2xl mx-auto">
            Join thousands of creators and businesses who transformed their social media game with PostPilot
          </p>
        </div>
      </div>

      {/* Accessible static list for screen readers */}
      <ul className="sr-only">
        {testimonials.map((t) => (
          <li key={t.name}>
            <blockquote>
              <p>{t.quote}</p>
              <footer>{t.name}, {t.title}</footer>
            </blockquote>
          </li>
        ))}
      </ul>

      <div className="mb-4">
        <MarqueeRow items={testimonials.slice(0, 4)} direction="left" speed="normal" />
      </div>
      <div>
        <MarqueeRow items={testimonials.slice(4, 8)} direction="right" speed="normal" />
      </div>

      <div className="container mx-auto px-6 md:px-8 lg:px-10 mt-16">
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          <div className="text-center">
            <div className="text-[#FF6E00] text-3xl md:text-4xl font-bold mb-2">10K+</div>
            <div className="text-[#4D4946] text-sm md:text-base">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-[#FF6E00] text-3xl md:text-4xl font-bold mb-2">1M+</div>
            <div className="text-[#4D4946] text-sm md:text-base">Posts Scheduled</div>
          </div>
          <div className="text-center">
            <div className="text-[#FF6E00] text-3xl md:text-4xl font-bold mb-2">4.9/5</div>
            <div className="text-[#4D4946] text-sm md:text-base">User Rating</div>
          </div>
          <div className="text-center">
            <div className="text-[#FF6E00] text-3xl md:text-4xl font-bold mb-2">50+</div>
            <div className="text-[#4D4946] text-sm md:text-base">Hours Saved Weekly</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PostPilotTestimonials;
