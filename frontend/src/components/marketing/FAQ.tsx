'use client'
import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const content = [
  {
    question: "What is PostPilot and how does it work?",
    answer:
      "PostPilot is your AI-powered social media copilot that helps you create, schedule, and publish content across all your platforms. Simply create your posts, schedule them, and let PostPilot handle the rest — no juggling multiple apps or missing deadlines!",
  },
  {
    question: "Which social media platforms does PostPilot support?",
    answer:
      "PostPilot supports all major platforms including Twitter, Instagram, LinkedIn, Facebook, TikTok, Pinterest, and Reddit.",
  },
  {
    question: "Do I need any technical skills to use PostPilot?",
    answer:
      "Not at all! PostPilot is designed for everyone — from solo creators to marketing teams.",
  },
  {
    question: "Can I schedule posts in advance?",
    answer:
      "Absolutely! Schedule your posts days, weeks, or even months in advance.",
  },
  {
    question: "How does the AI-powered feature work?",
    answer:
      "Our AI helps generate post ideas, suggests optimal posting times, and refines content.",
  },
  {
    question: "Can my team collaborate on PostPilot?",
    answer:
      "Yes! PostPilot supports team collaboration with approvals and permissions.",
  },
  {
    question: "How does PostPilot track post performance?",
    answer:
      "PostPilot provides analytics like impressions, likes, shares, and engagement rates.",
  },
  {
    question: "Is there a free plan available?",
    answer:
      "Yes! We offer a free plan with optional upgrades.",
  },
  {
    question: "What makes PostPilot different?",
    answer:
      "AI insights, multi-platform publishing, and analytics — all in one place.",
  },
]

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="relative w-full py-20 md:py-28 bg-[#F3EFEC] overflow-hidden">
      {/* ================= Decorative Elements (Hidden on Mobile) ================= */}
      <div
        className="absolute -left-[400px] top-[120px] w-[542px] h-[758px] hidden lg:flex flex-col items-center rounded-[18px] border border-[#FFD4B2] bg-[#F3EFEC] overflow-hidden"
        style={{
          transform: 'rotate(34.44deg)',
          padding: '0 0 459.005px 197.471px',
        }}
      >
        <div
          className="absolute left-[360px] -top-[200px] w-[277px] h-[469px] rounded-[18px]"
          style={{
            background:
              'radial-gradient(71.91% 70.92% at 57.34% 25.91%, #FFB67D 0%, #F3EFEC 100%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      <div
        className="absolute -right-[400px] top-[120px] w-[542px] h-[758px] hidden lg:flex flex-col items-center rounded-[18px] border border-[#FFD4B2] bg-[#F3EFEC] overflow-hidden"
        style={{
          transform: 'rotate(-34.44deg)',
          padding: '0 197.733px 457.972px 0',
        }}
      >
        <div
          className="absolute -left-[100px] -top-[150px] w-[177px] h-[469px] rounded-[18px]"
          style={{
            background:
              'radial-gradient(71.91% 70.92% at 57.34% 25.91%, #FFB57C 0%, #F3EFEC 100%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* ================= Content ================= */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex h-[34px] px-4 items-center rounded-full border border-[#EAE7E4] bg-white mb-6">
            <span className="text-[#4D4946] text-sm font-medium">
              Got Questions?
            </span>
          </div>

          <h2 className="text-[#181817] text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h2>

          <p className="text-[#4D4946] text-base md:text-lg max-w-2xl mx-auto">
            Everything you need to know about PostPilot
          </p>
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {content.map((item, index) => (
            <div
              key={index}
              className="border border-[#EAE7E4] rounded-[18px] bg-white overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_20px_rgba(255,155,79,0.12)]"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-[#F3EFEC]/30 transition"
              >
                <span className="text-[#181817] text-base md:text-lg font-semibold pr-8">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#FF9B4F] transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0'
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

        {/* CTA */}
        <div className="text-center mt-12 md:mt-16">
          <p className="text-[#4D4946] text-base md:text-lg mb-4">
            Still have questions?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center h-[52px] px-8 rounded-full bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white font-semibold shadow-[0_4px_16px_rgba(255,155,79,0.3)] hover:shadow-[0_6px_24px_rgba(255,155,79,0.4)] transition-all duration-300 hover:-translate-y-0.5"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  )
}

export default FAQSection