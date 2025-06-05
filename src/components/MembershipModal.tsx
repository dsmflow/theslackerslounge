import React from 'react';

interface MembershipTier {
  name: string;
  description: string;
  benefits: string[];
  price: string;
}

const membershipTiers: MembershipTier[] = [
  {
    name: "Free",
    description: "Basic access to The Slackers Lounge",
    benefits: [
      "Limited access to Speakeasy AI assistant",
      "View public images in The Conservatory",
      "Access to public tutorials"
    ],
    price: "$0/mo."
  },
  {
    name: "Member",
    description: "Enhanced experience for regular visitors",
    benefits: [
      "Full access to Speakeasy AI assistant",
      "Create and share images in The Conservatory",
      "Access to premium tutorials",
      "Priority support"
    ],
    price: "$20/mo."
  },
  {
    name: "VIP",
    description: "Premium features for power users",
    benefits: [
      "Exclusive AI models in Speakeasy",
      "Unlimited image generation in The Conservatory",
      "Private tutorial sessions",
      "24/7 concierge support"
    ],
    price: "$200/mo."
  },
  {
    name: "Champagne",
    description: "The ultimate Slackers Lounge experience",
    benefits: [
      "Early access to new features",
      "Personal AI assistant",
      "Custom AI model training",
      "Exclusive events and workshops",
      "Lifetime membership benefits"
    ],
    price: "$1500/mo."
  }
];

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MembershipModal: React.FC<MembershipModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark/90 border-2 border-accent shadow-accent rounded-lg p-8 max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-display text-accent mb-6 text-shadow-accent">Membership Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {membershipTiers.map((tier, index) => (
            <div 
              key={index} 
              className="border-2 border-gold shadow-gold rounded-lg p-4 relative bg-dark/50 hover:border-cream hover:shadow-cream transition-all duration-300"
            >
              <h3 className="text-xl font-display text-gold mb-2 text-shadow-gold">{tier.name}</h3>
              <p className="text-cream mb-4 text-shadow-cream opacity-90">{tier.description}</p>
              <ul className="list-disc list-inside space-y-2">
                {tier.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="text-cream text-shadow-cream opacity-90">{benefit}</li>
                ))}
              </ul>
              <div className="absolute top-4 right-4 text-gold font-display text-shadow-gold">
                {tier.price}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-md border-2 border-accent text-accent hover:border-cream hover:text-cream transition-all duration-300 text-shadow-accent hover:text-shadow-cream font-display hover:shadow-cream shadow-accent"
          >
            Close
          </button>
          <p className="text-cream text-shadow-cream opacity-90 text-sm max-w-lg text-center md:text-right mt-4 md:mt-0">
            *Pricing is for access only. Any material created is subject to applicable licenses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MembershipModal;
