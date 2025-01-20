import React from 'react';
import { Link } from 'react-router-dom';

interface TutorialCard {
  title: string;
  description: string;
  path: string;
  icon: string;
}

const tutorials: TutorialCard[] = [
  {
    title: 'Data Pipeline',
    description: 'Build resilient data pipelines for real-time analytics using AWS MSK and Kafka',
    path: '/tutorials/data-pipeline',
    icon: '🔄'
  },
  {
    title: 'Monolith Migration',
    description: 'Step-by-step guide to breaking down monoliths into microservices',
    path: '/tutorials/monolith-migration',
    icon: '🏗️'
  },
  {
    title: 'Zero Trust Security',
    description: 'Implement zero-trust architecture in cloud-native applications',
    path: '/tutorials/zero-trust',
    icon: '🔒'
  }
];

const TutorialsSection: React.FC = () => {
  return (
    <div className="bg-dark/90 rounded-lg p-8 mb-8 max-w-7xl mx-auto border-2 border-gold shadow-gold">
      <h2 className="text-3xl font-display text-accent mb-4 text-shadow-accent">DevOps Tutorials</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tutorials.map((tutorial, index) => (
          <div key={index} className="p-4 rounded-lg border-2 border-accent shadow-accent bg-dark/50 hover:border-cream hover:shadow-cream transition-all duration-300 flex flex-col">
            <div className="text-4xl mb-2">{tutorial.icon}</div>
            <h3 className="text-xl font-display text-accent mb-2 text-shadow-accent">{tutorial.title}</h3>
            <p className="text-cream mb-4 flex-grow text-shadow-cream opacity-90">{tutorial.description}</p>
            <div className="flex justify-center">
              <Link 
                to={tutorial.path} 
                className="inline-block px-4 py-2 rounded-md border-2 border-gold text-gold hover:bg-gold hover:text-dark transition-all duration-300 hover:shadow-gold text-shadow-gold"
              >
                Read More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TutorialsSection;
