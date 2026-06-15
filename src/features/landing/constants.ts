import type { Event } from '@/types'

export const FEATURED_EVENT_ID = 'evt-upcoming-1'

export const LIVE_LEADERBOARD_EVENT_ID = 'evt-active-1'

/**
 * Offline / API-failure fallback for the featured landing event.
 * Mirrors evt-upcoming-1 from the mock catalog without importing the mock DB bundle.
 */
export const FEATURED_EVENT_FALLBACK: Event = {
  id: FEATURED_EVENT_ID,
  title: 'BeetleX AI Forge 2026',
  tagline: 'Build the next generation of intelligent applications',
  description:
    'BeetleX AI Forge is a 48-hour global hackathon focused on pushing the boundaries of artificial intelligence and machine learning.',
  rules:
    "All code must be written during the hackathon window. Open-source libraries are permitted. Register individually or in teams of 1–4 members.",
  eligibility:
    'Open to students and professionals worldwide aged 16+. Valid government ID required.',
  status: 'upcoming',
  tracks: [
    {
      id: 'evt-upcoming-1-track-ai',
      name: 'Generative AI & LLMs',
      description: 'Build applications powered by large language models and generative AI.',
      problemStatement:
        'Design an AI assistant that helps developers write, debug, and document code in real time.',
      techStack: ['Python', 'LangChain', 'OpenAI API', 'FastAPI', 'React'],
    },
    {
      id: 'evt-upcoming-1-track-ml',
      name: 'Computer Vision & Edge ML',
      description: 'Deploy machine learning models on edge devices for real-time inference.',
      problemStatement:
        'Create a vision system that detects safety hazards on construction sites using edge hardware.',
      techStack: ['TensorFlow Lite', 'ONNX', 'OpenCV', 'C++', 'Rust'],
    },
    {
      id: 'evt-upcoming-1-track-devtools',
      name: 'MLOps & DevTools',
      description: 'Build developer tools that streamline the ML lifecycle from training to production.',
      problemStatement:
        'Build a platform that automates model versioning, A/B testing, and rollback for ML deployments.',
      techStack: ['Kubernetes', 'MLflow', 'Prometheus', 'Grafana', 'TypeScript'],
    },
    {
      id: 'evt-upcoming-1-track-web3',
      name: 'Decentralized AI',
      description: 'Combine blockchain and AI for trustless, verifiable machine learning.',
      problemStatement:
        'Design a decentralized inference network where model outputs are verifiable on-chain.',
      techStack: ['Solidity', 'IPFS', 'Chainlink', 'Python', 'ethers.js'],
    },
  ],
  prizes: [
    {
      trackId: 'evt-upcoming-1-track-ai',
      rank: 1,
      amount: 10000,
      currency: 'USD',
      perks: ['$5K cloud credits', 'Mentorship with OpenAI engineers'],
    },
    {
      trackId: 'evt-upcoming-1-track-ai',
      rank: 2,
      amount: 5000,
      currency: 'USD',
      perks: ['$2K cloud credits', 'Swag kit'],
    },
    {
      trackId: 'evt-upcoming-1-track-ml',
      rank: 1,
      amount: 8000,
      currency: 'USD',
      perks: ['NVIDIA Jetson kit', 'Edge AI workshop'],
    },
    {
      trackId: 'evt-upcoming-1-track-devtools',
      rank: 1,
      amount: 7500,
      currency: 'USD',
      perks: ['DevTools Inc. internship interview'],
    },
    {
      trackId: 'evt-upcoming-1-track-web3',
      rank: 1,
      amount: 6000,
      currency: 'USD',
      perks: ['ChainLabs grant application support'],
    },
  ],
  sponsors: [],
  timeline: [
    {
      date: '2026-07-01T00:00:00.000Z',
      label: 'Registration Opens',
      description: 'Team registration and track selection begin on the BeetleX platform.',
    },
    {
      date: '2026-08-15T23:59:59.000Z',
      label: 'Registration Closes',
      description: 'Final deadline to register teams and confirm track assignments.',
    },
    {
      date: '2026-08-22T09:00:00.000Z',
      label: 'Kickoff & Team Formation',
      description: 'Opening ceremony, keynote from AI industry leaders, and final team sync.',
    },
    {
      date: '2026-08-24T09:00:00.000Z',
      label: 'Submission Deadline',
      description: 'All project repos, demos, and pitch decks must be submitted.',
    },
    {
      date: '2026-08-25T10:00:00.000Z',
      label: 'Judging Round',
      description: 'Live demos and Q&A sessions with the judging panel.',
    },
    {
      date: '2026-08-26T18:00:00.000Z',
      label: 'Awards Ceremony',
      description: 'Winners announced across all tracks. Networking reception follows.',
    },
  ],
  registrationOpen: '2026-07-01T00:00:00.000Z',
  registrationClose: '2026-08-15T23:59:59.000Z',
  submissionDeadline: '2026-08-24T09:00:00.000Z',
  judgingDate: '2026-08-25T10:00:00.000Z',
  resultsDate: '2026-08-26T18:00:00.000Z',
  participantCount: 0,
  teamMinSize: 1,
  teamMaxSize: 4,
  faqs: [
    {
      question: 'Can I participate solo?',
      answer:
        'Yes. Choose individual registration during signup, or create a team and invite others later. Teams may have 1–4 members.',
    },
    {
      question: 'Do I need a GPU?',
      answer:
        'Not required. We provide cloud GPU credits to all registered teams via our NVIDIA and Replicate partnerships.',
    },
    {
      question: 'Which LLM APIs are allowed?',
      answer:
        'Any API is permitted including OpenAI, Anthropic, and open-source models. Document API usage in your README.',
    },
    {
      question: 'Is there an age limit?',
      answer:
        'Participants must be 16 or older. Minors require parental consent submitted during registration.',
    },
    {
      question: 'Can we switch tracks after registering?',
      answer: 'Track changes are allowed until registration closes on August 15, 2026.',
    },
    {
      question: 'What format should submissions take?',
      answer:
        'GitHub repo (public or private with judge access), 3-minute demo video, and a live deployable demo URL.',
    },
  ],
  createdAt: '2026-06-01T10:00:00.000Z',
}

export const EXTRA_FAQS = [
  {
    question: 'How do I form a team?',
    answer:
      'You can create a new team during registration and share your invite code, or join an existing team with a code from your team leader.',
  },
  {
    question: 'What happens after I register?',
    answer:
      'After registration you get access to the team dashboard where you can manage your team, submit your project, and track announcements.',
  },
] as const
