"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface SupportTier {
  id: string;
  name: string;
  price: number;
  description: string;
  rewards: string[];
}

const supportTiers: SupportTier[] = [
  {
    id: 'bambi',
    name: 'Bambi Photo',
    price: 2,
    description: 'Get a personalized Bambi photo',
    rewards: ['One exclusive personalized Bambi photo']
  },
  {
    id: 'basic',
    name: 'Snack Time',
    price: 5,
    description: 'Buy a small treat for my pets',
    rewards: ['Exclusive photo of pet enjoying the treat', 'Personal thank you message']
  },
  {
    id: 'premium',
    name: 'Meal Time',
    price: 10,
    description: 'Buy a full meal for my pets',
    rewards: [
      'Exclusive video of pet enjoying the meal',
      'Personalized thank you card with pet paw print',
      'Access to private pet photo collection'
    ]
  },
  {
    id: 'deluxe',
    name: 'Gourmet Feast',
    price: 15,
    description: 'Treat my pets to a gourmet meal',
    rewards: [
      'Custom pet photoshoot',
      'Personalized video message',
      'Custom profile picture or banner featuring the pets',
      'Monthly pet updates for 3 months'
    ]
  }
];

export default function PetSupport() {
  const router = useRouter();

  const handleSupport = async (tier: SupportTier) => {
    router.push(`/pets/payment?tier=${encodeURIComponent(tier.name)}&price=${encodeURIComponent(tier.price)}`);
  };

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">Support My Pets</h2>
      <p className="text-gray-300 text-center mb-8 max-w-2xl mx-auto">
        Help support my pets by buying them food and treats! Each support tier comes with exclusive rewards as a thank you for your generosity.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {supportTiers.map((tier) => (
          <motion.div
            key={tier.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{tier.name}</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                ${tier.price}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{tier.description}</p>
              <div className="space-y-2 mb-6">
                {tier.rewards.map((reward, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600 dark:text-gray-400">{reward}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleSupport(tier)}
                className="w-full bg-[#7d8fb0] hover:bg-[#6b7a96] text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
              >
                Support Now
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 