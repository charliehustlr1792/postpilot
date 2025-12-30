'use client'
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const content = [
  {
    question: "What is PostPilot and how does it work?",
    answer: "PostPilot is your AI-powered social media copilot that helps you create, schedule, and publish content across all your platforms. Simply create your posts, schedule them, and let PostPilot handle the rest — no juggling multiple apps or missing deadlines!"
  },
  {
    question: "Which social media platforms does PostPilot support?",
    answer: "PostPilot supports all major platforms including Twitter, Instagram, LinkedIn, Facebook, TikTok, Pinterest, and Reddit. Post to one or all of them with a single click!"
  },
  {
    question: "Do I need any technical skills to use PostPilot?",
    answer: "Not at all! PostPilot is designed for everyone — from solo creators to marketing teams. Our intuitive interface makes scheduling and publishing content as easy as writing a text message."
  },
  {
    question: "Can I schedule posts in advance?",
    answer: "Absolutely! Schedule your posts days, weeks, or even months in advance. Our smart calendar interface shows you exactly what's publishing and when, so you can plan your content strategy with confidence."
  },
  {
    question: "How does the AI-powered feature work?",
    answer: "Our AI helps you generate engaging post ideas, suggests optimal posting times based on your audience engagement, and even helps refine your content for maximum impact. It's like having a social media expert on your team 24/7!"
  },
  {
    question: "Can my team collaborate on PostPilot?",
    answer: "Yes! PostPilot supports team collaboration with features like content approval workflows, role-based permissions, and real-time activity feeds. Perfect for agencies, marketing teams, and growing businesses."
  },
  {
    question: "How does PostPilot track my post performance?",
    answer: "PostPilot provides comprehensive analytics including impressions, likes, shares, comments, and engagement rates. Track your top-performing posts and get insights to optimize your content strategy across all platforms."
  },
  {
    question: "Is there a free plan available?",
    answer: "Yes! We offer a free plan to get you started with basic scheduling and publishing features. As your needs grow, you can upgrade to unlock advanced features like AI-powered suggestions, team collaboration, and detailed analytics."
  },
  {
    question: "What makes PostPilot different from other scheduling tools?",
    answer: "PostPilot combines powerful scheduling with AI-driven insights, seamless multi-platform publishing, and beautiful analytics — all in one place. No more switching between tools or paying for multiple subscriptions. It's social media management made simple."
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full py-20 md:py-28 bg-[#F3EFEC] relative overflow-hidden">
      {/* Decorative Elements */}
      <div
        className="absolute -left-[400px] top-[100px] w-[542px] h-[758px] inline-flex flex-col items-center rounded-[18px] border border-[#FFD4B2] bg-[#F3EFEC] overflow-hidden"
        style={{
          transform: 'rotate(34.44deg)',
          padding: '0 0 459.005px 197.471px'
        }}
      >
        <div
          className="absolute left-[360px] -top-[200px] w-[277px] h-[469px] rounded-[18px]"
          style={{
            background: 'radial-gradient(71.91% 70.92% at 57.34% 25.91%, #FFB67D 0%, #F3EFEC 100%)',
            filter: 'blur(50px)'
          }}
        ></div>
      </div>

      <div
        className="absolute -right-[400px] top-[100px] w-[542px] h-[758px] inline-flex flex-col items-center rounded-[18px] border border-[#FFD4B2] bg-[#F3EFEC] overflow-hidden"
        style={{
          transform: 'rotate(-34.44deg)',
          padding: '0 197.733px 457.972px 0'
        }}
      >
        <div
          className="absolute -left-[100px] -top-[150px] w-[177px] h-[469px] rounded-[18px]"
          style={{
            background: 'radial-gradient(71.91% 70.92% at 57.34% 25.91%, #FFB57C 0%, #F3EFEC 100%)',
            filter: 'blur(50px)'
          }}
        ></div>
      </div>

      <div className="container mx-auto px-6 md:px-8 lg:px-10 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex h-[34px] px-[14px] py-2 justify-center items-center gap-1 rounded-[100px] border border-[#EAE7E4] bg-white mb-6">
            <span className="text-[#4D4946] text-base font-[420] leading-[19px]" style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}>
              Got Questions?
            </span>
          </div>
          <h2 className="text-[#181817] text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-[#4D4946] text-lg md:text-xl max-w-2xl mx-auto">
            Everything you need to know about PostPilot
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {content.map((item, index) => (
              <div
                key={index}
                className="border border-[#EAE7E4] rounded-[18px] overflow-hidden bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_20px_rgba(255,155,79,0.12)]"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full text-left p-6 flex items-center justify-between transition-all duration-300 hover:bg-[#F3EFEC]/30 group"
                >
                  <span className="text-[#181817] text-base md:text-lg font-semibold pr-8 group-hover:text-[#FF6E00] transition-colors duration-300">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#FF9B4F] transition-transform duration-300 flex-shrink-0 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6 pt-2">
                    <p className="text-[#4D4946] text-sm md:text-base leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 md:mt-16">
          <p className="text-[#4D4946] text-base md:text-lg mb-4">
            Still have questions?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center h-[52px] px-8 rounded-[100px] bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white font-semibold text-base shadow-[0_4px_16px_rgba(255,155,79,0.3)] hover:shadow-[0_6px_24px_rgba(255,155,79,0.4)] transition-all duration-300 hover:-translate-y-0.5"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;