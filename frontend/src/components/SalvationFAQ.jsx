import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

const faqs = [
  {
    question: "What does it mean to be saved?",
    answer: "To be saved means to be rescued from the penalty of sin and brought into a relationship with God through Jesus Christ."
  },
  {
    question: "Do I have to be perfect?",
    answer: "No. Salvation is a gift of grace, not a reward for perfection. We are saved by faith, not by our own works."
  },
  {
    question: "What if I mess up again?",
    answer: "God's grace is sufficient. When we stumble, we can confess our sins, and He is faithful to forgive us and cleanse us."
  },
  {
    question: "How do I grow in my faith?",
    answer: "Read the Bible, pray, join a community of believers, and serve others. These habits help deepen your relationship with God."
  }
];

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        className="w-full py-6 flex justify-between items-center text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-xl font-bold text-gray-900">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="w-6 h-6 text-[#FE5708]" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-700 text-lg">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SalvationFAQ() {
  return (
    <div className="py-20 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center uppercase tracking-tight">Common Questions</h2>
        <div className="bg-white rounded-lg shadow-sm px-8">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SalvationFAQ;