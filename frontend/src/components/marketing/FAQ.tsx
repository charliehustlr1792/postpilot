'use client'
import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Button from '../ui/Button'

const faqItems = [
  {
    question: "What is PostPilot and how does it work?",
    answer:
      "PostPilot is an AI-powered social media management platform. You create your posts once in our editor, set a schedule, and PostPilot automatically publishes them across all your connected platforms - Twitter/X, Instagram, LinkedIn, Facebook, TikTok, Pinterest, and Reddit - each formatted to that platform's requirements. No juggling multiple apps or missing posting windows.",
  },
  {
    question: "Which social media platforms does PostPilot support?",
    answer:
      "PostPilot supports Twitter/X (up to 280 chars), Instagram, LinkedIn, Facebook, TikTok, Pinterest, and Reddit. Each platform is handled individually so your content respects character limits, hashtag conventions, and media specifications automatically. We're continuously adding new integrations.",
  },
  {
    question: "Can I schedule posts in advance and see them in a calendar?",
    answer:
      "Yes - you can schedule posts days, weeks, or months in advance. Our visual calendar lets you drag, drop, and reschedule at any time. You can also let PostPilot suggest optimal posting times based on your audience's engagement patterns for each platform.",
  },
  {
    question: "How does the AI-powered content feature work?",
    answer:
      "PostPilot's AI helps you write and adapt content for each platform's format and tone, suggests optimal posting times based on historical engagement data, and recommends which posts to repurpose. It learns from your analytics over time to continuously improve its suggestions.",
  },
  {
    question: "Can my team collaborate on PostPilot?",
    answer:
      "Yes. PostPilot supports team workspaces with role-based permissions, a content approval workflow, and a live activity feed. Content creators, reviewers, and managers each have their own access level - no more email chains to approve a single post.",
  },
  {
    question: "Is there a free plan, and how does pricing work?",
    answer:
      "Yes - our free plan lets you manage 1 social account and schedule up to 5 posts at a time with basic analytics. Pro ($29/mo) gives you unlimited posts, 5 accounts, advanced analytics, AI suggestions, and team collaboration. Enterprise ($99/mo) is for agencies with unlimited accounts, custom branding, and API access.",
  },
]

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
}

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="relative w-full py-20 md:py-28 bg-[#F3EFEC] overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div aria-hidden="true" className="absolute -left-[400px] top-[120px] w-[542px] h-[758px] hidden lg:flex flex-col items-center rounded-[18px] border border-[#FFD4B2] bg-[#F3EFEC] overflow-hidden" style={{ transform: 'rotate(34.44deg)', padding: '0 0 459.005px 197.471px' }}>
        <div className="absolute left-[360px] -top-[200px] w-[277px] h-[469px] rounded-[18px]" style={{ background: 'radial-gradient(71.91% 70.92% at 57.34% 25.91%, #FFB67D 0%, #F3EFEC 100%)', filter: 'blur(50px)' }} />
      </div>
      <div aria-hidden="true" className="absolute -right-[400px] top-[120px] w-[542px] h-[758px] hidden lg:flex flex-col items-center rounded-[18px] border border-[#FFD4B2] bg-[#F3EFEC] overflow-hidden" style={{ transform: 'rotate(-34.44deg)', padding: '0 197.733px 457.972px 0' }}>
        <div className="absolute -left-[100px] -top-[150px] w-[177px] h-[469px] rounded-[18px]" style={{ background: 'radial-gradient(71.91% 70.92% at 57.34% 25.91%, #FFB57C 0%, #F3EFEC 100%)', filter: 'blur(50px)' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex h-[34px] px-4 items-center rounded-full border border-[#EAE7E4] bg-white mb-6">
            <span className="text-[#4D4946] text-sm font-medium">Got Questions?</span>
          </div>
          <h2 className="text-[#181817] text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-[#4D4946] text-base md:text-lg max-w-2xl mx-auto">
            Everything you need to know about PostPilot
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index
            const panelId = `faq-panel-${index}`
            const buttonId = `faq-btn-${index}`
            return (
              <div
                key={index}
                className="border border-[#EAE7E4] rounded-[18px] bg-white overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_20px_rgba(255,155,79,0.12)]"
              >
                <button
                  id={buttonId}
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={isOpen ? "true" : "false"}
                  aria-controls={panelId}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-[#F3EFEC]/30 transition"
                >
                  <span className="text-[#181817] text-base md:text-lg font-semibold pr-8">
                    {item.question}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`w-5 h-5 text-[#FF9B4F] transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-6 pb-6 pt-2">
                    <p className="text-[#4D4946] text-sm md:text-base leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12 md:mt-16">
          <p className="text-[#4D4946] text-base md:text-lg mb-4">Still have questions?</p>
          <Button href="/contact" variant="default" text="Contact Us" size="lg" />
        </div>
      </div>
    </section>
  )
}

export default FAQSection
