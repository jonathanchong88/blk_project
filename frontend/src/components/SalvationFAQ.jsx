import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

const faqs = [
  {
    question: "WHAT DOES IT MEAN TO BE SAVED?",
    answer: "To be saved means to be rescued from the penalty of sin and brought into a relationship with God through Jesus Christ."
  },
  {
    question: "DO I HAVE TO BE PERFECT?",
    answer: "No. Salvation is a gift of grace, not a reward for perfection. We are saved by faith, not by our own works."
  },
  {
    question: "WHAT IF I MESS UP AGAIN?",
    answer: "God's grace is sufficient. When we stumble, we can confess our sins, and He is faithful to forgive us and cleanse us."
  },
  {
    question: "HOW DO I GROW IN MY FAITH?",
    answer: "Read the Bible, pray, join a community of believers, and serve others. These habits help deepen your relationship with God."
  }
];

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      layout
      className="border-2 border-black/5 rounded-2xl mb-4 bg-white overflow-hidden shadow-sm hover:border-[#B87D00]/30 transition-colors duration-300"
    >
      <button
        className="w-full py-6 px-8 flex justify-between items-center text-left focus:outline-none group/btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm md:text-base font-bold text-gray-900 uppercase tracking-widest">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`p-2 rounded-full transition-colors duration-300 ${isOpen ? 'bg-gray-100' : 'group-hover/btn:bg-gray-50'}`}
        >
          <Plus className={`w-5 h-5 ${isOpen ? 'text-gray-400' : 'text-[#B87D00]'}`} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="pb-8 px-8 pt-0 text-gray-500 text-base leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SalvationFAQ() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="py-24 px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-black tracking-tighter uppercase">Common Questions</h2>
            <div className="w-12 h-1 bg-[#B87D00] mx-auto rounded-full"></div>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {faqs.map((faq, index) => (
            <motion.div key={index} variants={item}>
              <FAQItem question={faq.question} answer={faq.answer} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default SalvationFAQ;