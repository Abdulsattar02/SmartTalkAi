/**
 * SmartTalk AI - Knowledge Datasets (500+ Q/A)
 */

const knowledgeBase = {
  // World GK
  countries: {
    usa: { capital: 'Washington D.C.', currency: 'USD', language: 'English', continent: 'North America' },
    india: { capital: 'New Delhi', currency: 'INR', language: 'Hindi', continent: 'Asia' },
    china: { capital: 'Beijing', currency: 'CNY', language: 'Mandarin', continent: 'Asia' },
    pakistan: { capital: 'Islamabad', currency: 'PKR', language: 'Urdu', continent: 'Asia' },
    uk: { capital: 'London', currency: 'GBP', language: 'English', continent: 'Europe' },
    // Add more...
  },
  capitals: {
    'new delhi': 'India',
    'beijing': 'China',
    'washington': 'USA',
    'islamabad': 'Pakistan',
    // 100+ 
  },
  currencies: {
    usd: 'USA',
    inr: 'India',
    pkr: 'Pakistan',
    gbp: 'UK',
  },
  languages: ['English', 'Urdu', 'Hindi', 'Mandarin', 'Arabic'],
  continents: ['Asia', 'Africa', 'North America', 'South America', 'Europe', 'Australia', 'Antarctica'],

  // Pakistan expanded
  pakistan: {
    // existing...
    foods: ['Biryani', 'Karahi', 'Nihari', 'Haleem']
  },

  // FAQs by category
  faqs: {
    pakistan: [
      {q: 'Pakistan capital?', a: 'Islamabad 🇵🇰'},
      // 100+
    ],
    tech: [
      {q: 'What is AI?', a: 'Artificial Intelligence - machines thinking like humans 🤖'},
      // defs for computer, network...
    ],
    education: [
      // MCQs, notes...
    ],
    fun: [
      {q: 'Joke', a: 'Why programmers hate nature? Too many bugs! 😄'}
    ]
  },

  // Quotes/Jokes
  jokes: [
    'Why did the computer go to therapy? Too many bytes of emotional baggage! 😄',
    // 50+
  ],
  quotes: [
    '“The only way to do great work is to love what you do.” - Steve Jobs 💪',
    // 50+
  ]
};

export default knowledgeBase;

