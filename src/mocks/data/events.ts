import type { Event } from '@/types'
import { createBeetlexSponsors, pickShowcaseSponsors } from '@/mocks/data/sponsors'
import { extraMockEvents } from '@/mocks/data/extraEvents'
import { mockTeams } from '@/mocks/data/teams'
import { countParticipantsForEvent } from '@/mocks/data/scaleTeams'

const coreMockEvents: Event[] = [
  {
    id: 'evt-upcoming-1',
    title: 'BeetleX AI Forge 2026',
    tagline: 'Build the next generation of intelligent applications',
    description:
      'BeetleX AI Forge is a 48-hour global hackathon focused on pushing the boundaries of artificial intelligence and machine learning. Participants will tackle real-world challenges across computer vision, natural language processing, and autonomous systems. Whether you are fine-tuning LLMs, building RAG pipelines, or deploying edge AI models, this is your arena to innovate. Top teams receive mentorship from industry leaders, cloud credits, and fast-track interviews at partner companies.',
    rules:
      "All code must be written during the hackathon window. Open-source libraries are permitted. Register individually or in teams of 1–4 members. One submission per team. Plagiarism or use of pre-built projects results in disqualification. Judges' decisions are final.",
    eligibility:
      'Open to students and professionals worldwide aged 16+. Valid government ID required. Previous BeetleX winners may participate but are ineligible for repeat grand prizes.',
    status: 'upcoming',
    tracks: [
      {
        id: 'evt-upcoming-1-track-ai',
        name: 'Generative AI & LLMs',
        description: 'Build applications powered by large language models and generative AI.',
        problemStatement:
          'Design an AI assistant that helps developers write, debug, and document code in real time. Your solution must demonstrate context-aware completions and integrate with at least one IDE or CLI tool.',
        techStack: ['Python', 'LangChain', 'OpenAI API', 'FastAPI', 'React'],
      },
      {
        id: 'evt-upcoming-1-track-ml',
        name: 'Computer Vision & Edge ML',
        description: 'Deploy machine learning models on edge devices for real-time inference.',
        problemStatement:
          'Create a vision system that detects safety hazards on construction sites using only edge hardware (Raspberry Pi, Jetson, or mobile). Achieve sub-200ms inference latency.',
        techStack: ['TensorFlow Lite', 'ONNX', 'OpenCV', 'C++', 'Rust'],
      },
      {
        id: 'evt-upcoming-1-track-devtools',
        name: 'MLOps & DevTools',
        description:
          'Build developer tools that streamline the ML lifecycle from training to production.',
        problemStatement:
          'Build a platform that automates model versioning, A/B testing, and rollback for ML deployments. Include a dashboard showing drift detection metrics.',
        techStack: ['Kubernetes', 'MLflow', 'Prometheus', 'Grafana', 'TypeScript'],
      },
      {
        id: 'evt-upcoming-1-track-web3',
        name: 'Decentralized AI',
        description: 'Combine blockchain and AI for trustless, verifiable machine learning.',
        problemStatement:
          'Design a decentralized inference network where model outputs are verifiable on-chain. Participants must demonstrate a proof-of-inference mechanism.',
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
    sponsors: createBeetlexSponsors('sp-up1'),
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
  },
  {
    id: 'evt-upcoming-2',
    title: 'ChainCraft Web3 Summit',
    tagline: 'Hack the decentralized future on-chain',
    description:
      'ChainCraft Web3 Summit brings together blockchain developers, DeFi architects, and NFT creators for an intensive 36-hour hackathon. Build decentralized applications on Ethereum, Solana, or Polygon. Focus areas include DeFi protocols, DAO tooling, cross-chain bridges, and Web3 identity. Sponsors provide testnet tokens, audit credits, and deployment infrastructure. This event is ideal for teams passionate about ownership, transparency, and composability.',
    rules:
      'Smart contracts must be deployed on approved testnets. No mainnet deployments during the event. Teams of 2–5. All contracts must include basic test coverage. Security best practices are evaluated by judges.',
    eligibility:
      'Open to developers with basic Solidity or Rust experience. Students and professionals welcome. KYC not required for testnet-only projects.',
    status: 'upcoming',
    tracks: [
      {
        id: 'evt-upcoming-2-track-web3',
        name: 'DeFi & Protocol Design',
        description:
          'Build decentralized finance protocols with novel tokenomics or yield mechanisms.',
        problemStatement:
          'Design a lending protocol with dynamic interest rates based on on-chain utilization metrics. Include liquidation logic and a simple frontend.',
        techStack: ['Solidity', 'Hardhat', 'ethers.js', 'The Graph', 'React'],
      },
      {
        id: 'evt-upcoming-2-track-ai',
        name: 'AI-Powered Trading & Analytics',
        description: 'Combine machine learning with on-chain data for predictive analytics.',
        problemStatement:
          'Build an AI agent that analyzes wallet behavior and DEX liquidity patterns to surface actionable trading signals. All predictions must cite on-chain evidence.',
        techStack: ['Python', 'Dune Analytics', 'Chainlink', 'Next.js', 'TensorFlow'],
      },
      {
        id: 'evt-upcoming-2-track-devtools',
        name: 'Web3 Developer Tooling',
        description: 'Create tools that improve the Web3 developer experience.',
        problemStatement:
          'Build a VS Code extension or CLI that audits smart contracts for common vulnerabilities and suggests gas optimizations in real time.',
        techStack: ['TypeScript', 'Slither', 'VS Code API', 'Rust', 'Foundry'],
      },
    ],
    prizes: [
      {
        trackId: 'evt-upcoming-2-track-web3',
        rank: 1,
        amount: 12000,
        currency: 'USD',
        perks: ['CertiK audit voucher', 'ETHGlobal finalist slot'],
      },
      {
        trackId: 'evt-upcoming-2-track-web3',
        rank: 2,
        amount: 6000,
        currency: 'USD',
        perks: ['Alchemy Plus subscription'],
      },
      {
        trackId: 'evt-upcoming-2-track-ai',
        rank: 1,
        amount: 8000,
        currency: 'USD',
        perks: ['Chainlink grant referral'],
      },
      {
        trackId: 'evt-upcoming-2-track-devtools',
        rank: 1,
        amount: 7000,
        currency: 'USD',
        perks: ['Foundry team mentorship'],
      },
    ],
    sponsors: pickShowcaseSponsors(
      [
        { name: 'Polygon', tier: 'platinum' },
        { name: 'Cloudflare', tier: 'gold' },
        { name: 'Vercel', tier: 'gold' },
        { name: 'GitHub', tier: 'silver' },
        { name: 'Supabase', tier: 'silver' },
      ],
      'sp-up2',
    ),
    timeline: [
      {
        date: '2026-08-01T00:00:00.000Z',
        label: 'Registration Opens',
        description: 'Sign up and claim testnet faucet credits from sponsors.',
      },
      {
        date: '2026-09-10T23:59:59.000Z',
        label: 'Registration Closes',
        description: 'Last day to register teams and select tracks.',
      },
      {
        date: '2026-09-19T08:00:00.000Z',
        label: 'Hackathon Begins',
        description: 'Opening keynote on Web3 security and team hacking starts.',
      },
      {
        date: '2026-09-20T20:00:00.000Z',
        label: 'Submission Deadline',
        description: 'Submit repos, contract addresses, and demo videos.',
      },
      {
        date: '2026-09-21T09:00:00.000Z',
        label: 'Judging',
        description: 'Technical review and live contract demos.',
      },
      {
        date: '2026-09-21T17:00:00.000Z',
        label: 'Results',
        description: 'Winners announced and sponsor networking session.',
      },
    ],
    registrationOpen: '2026-08-01T00:00:00.000Z',
    registrationClose: '2026-09-10T23:59:59.000Z',
    submissionDeadline: '2026-09-20T20:00:00.000Z',
    judgingDate: '2026-09-21T09:00:00.000Z',
    resultsDate: '2026-09-21T17:00:00.000Z',
    participantCount: 0,
    teamMinSize: 2,
    teamMaxSize: 5,
    faqs: [
      {
        question: 'Which chains are supported?',
        answer: 'Ethereum Sepolia, Polygon Amoy, and Solana Devnet. Deploy on at least one.',
      },
      {
        question: 'Are audit tools provided?',
        answer: 'Yes. CertiK and Slither integrations are available in the starter kit.',
      },
      {
        question: 'Can we use existing smart contract templates?',
        answer: 'OpenZeppelin and Solmate libraries are allowed. Custom logic must be original.',
      },
      {
        question: 'Is KYC required?',
        answer: 'No KYC for participation. Prize disbursement may require identity verification.',
      },
      {
        question: 'How are gas costs covered?',
        answer: 'Each team receives testnet ETH/MATIC/SOL from sponsor faucets upon registration.',
      },
      {
        question: 'What if our contract has a bug?',
        answer: 'Testnet-only deployments are expected. Document known limitations in your README.',
      },
    ],
    createdAt: '2026-06-10T14:00:00.000Z',
  },
  {
    id: 'evt-active-1',
    title: 'DevTools Velocity Hack 2026',
    tagline: 'Ship faster. Debug smarter. Build better tools.',
    description:
      "DevTools Velocity is BeetleX's flagship active hackathon running right now. Over 400 developers are building the next generation of developer productivity tools — from IDE extensions and CI/CD plugins to observability dashboards and local dev environments. This 72-hour sprint emphasizes developer experience, performance, and open-source impact. Live office hours with maintainers from major open-source projects run throughout the event.",
    rules:
      'Projects must target developer workflows. Open-source license required (MIT, Apache 2.0, or GPL). Teams of 2–4. Extensions must be installable and demos must be reproducible. No vaporware — judges will clone and run your project.',
    eligibility:
      'Open worldwide. Professional developers and students encouraged. Teams may include one mentor in advisory role (non-submitting).',
    status: 'active',
    tracks: [
      {
        id: 'evt-active-1-track-devtools',
        name: 'IDE & Editor Extensions',
        description: 'Enhance coding environments with plugins, themes, and AI-assisted workflows.',
        problemStatement:
          'Build an IDE extension that reduces context-switching by surfacing relevant docs, issues, and deployment status inline while coding.',
        techStack: ['TypeScript', 'VS Code API', 'LSP', 'Rust', 'WebAssembly'],
      },
      {
        id: 'evt-active-1-track-ai',
        name: 'AI Code Assistants',
        description: 'Integrate AI into developer workflows for codegen, review, and refactoring.',
        problemStatement:
          'Create a code review bot that catches security anti-patterns and suggests fixes with one-click apply patches via GitHub/GitLab integration.',
        techStack: ['Python', 'LangChain', 'GitHub API', 'Docker', 'PostgreSQL'],
      },
      {
        id: 'evt-active-1-track-ml',
        name: 'Observability & Performance',
        description:
          'Build tools for monitoring, profiling, and optimizing application performance.',
        problemStatement:
          'Design a lightweight APM tool that traces requests across microservices and pinpoints latency bottlenecks with flame graph visualization.',
        techStack: ['Go', 'OpenTelemetry', 'Prometheus', 'React', 'eBPF'],
      },
      {
        id: 'evt-active-1-track-web3',
        name: 'Web3 Dev Infrastructure',
        description: 'Developer tools for smart contract development, testing, and deployment.',
        problemStatement:
          'Build a local blockchain dev environment with one-command fork, snapshot, and reset capabilities for Ethereum testing.',
        techStack: ['Foundry', 'Anvil', 'Solidity', 'Node.js', 'Docker'],
      },
    ],
    prizes: [
      {
        trackId: 'evt-active-1-track-devtools',
        rank: 1,
        amount: 15000,
        currency: 'USD',
        perks: ['GitHub Stars feature', 'DevTools Inc. acquisition talk'],
      },
      {
        trackId: 'evt-active-1-track-devtools',
        rank: 2,
        amount: 7500,
        currency: 'USD',
        perks: ['JetBrains license bundle'],
      },
      {
        trackId: 'evt-active-1-track-ai',
        rank: 1,
        amount: 12000,
        currency: 'USD',
        perks: ['YC office hours'],
      },
      {
        trackId: 'evt-active-1-track-ml',
        rank: 1,
        amount: 10000,
        currency: 'USD',
        perks: ['Datadog pro credits'],
      },
      {
        trackId: 'evt-active-1-track-web3',
        rank: 1,
        amount: 8000,
        currency: 'USD',
        perks: ['Foundry pro license'],
      },
    ],
    sponsors: pickShowcaseSponsors(
      [
        { name: 'GitHub', tier: 'platinum' },
        { name: 'Vercel', tier: 'platinum' },
        { name: 'Netlify', tier: 'gold' },
        { name: 'Cloudflare', tier: 'silver' },
        { name: 'Supabase', tier: 'bronze' },
      ],
      'sp-ac1',
    ),
    timeline: [
      {
        date: '2026-05-01T00:00:00.000Z',
        label: 'Registration Opens',
        description: 'Early bird registration with bonus office hour slots.',
      },
      {
        date: '2026-06-01T23:59:59.000Z',
        label: 'Registration Closes',
        description: 'Final team roster lock.',
      },
      {
        date: '2026-06-10T00:00:00.000Z',
        label: 'Hacking Begins',
        description: '72-hour countdown starts. Discord channels go live.',
      },
      {
        date: '2026-06-13T00:00:00.000Z',
        label: 'Submission Deadline',
        description: 'Repos, install guides, and demo videos due.',
      },
      {
        date: '2026-06-14T10:00:00.000Z',
        label: 'Judging',
        description: 'Judges clone repos and score live demos.',
      },
      {
        date: '2026-06-15T16:00:00.000Z',
        label: 'Results',
        description: 'Winners announced on live stream.',
      },
    ],
    registrationOpen: '2026-05-01T00:00:00.000Z',
    registrationClose: '2026-06-01T23:59:59.000Z',
    submissionDeadline: '2026-06-13T00:00:00.000Z',
    judgingDate: '2026-06-14T10:00:00.000Z',
    resultsDate: '2026-06-15T16:00:00.000Z',
    participantCount: countParticipantsForEvent(mockTeams, 'evt-active-1'),
    teamMinSize: 2,
    teamMaxSize: 4,
    faqs: [
      {
        question: 'Can we submit a CLI tool?',
        answer: 'Absolutely. CLI, IDE extensions, web dashboards, and libraries are all valid.',
      },
      {
        question: 'Is there a language restriction?',
        answer: 'No. Use any language. Provide clear install and run instructions.',
      },
      {
        question: 'How does live judging work?',
        answer:
          'Judges run your install steps on a clean VM. If it fails, you get one 15-minute fix window.',
      },
      {
        question: 'Are private repos allowed?',
        answer: 'Yes until submission. Make public or grant judge access before the deadline.',
      },
      {
        question: 'Can we continue after the hackathon?',
        answer: 'Yes. Winning projects are encouraged to open-source and maintain post-event.',
      },
      {
        question: 'What is the scoring criteria?',
        answer:
          'Innovation (25%), technical execution (30%), developer impact (25%), presentation (20%).',
      },
    ],
    createdAt: '2026-04-15T08:00:00.000Z',
  },
  {
    id: 'evt-active-2',
    title: 'Neural Nexus Challenge',
    tagline: 'Where AI meets real-world impact',
    description:
      'Neural Nexus is an active 48-hour hackathon challenging teams to apply machine learning to healthcare, education, and climate solutions. Participants work with curated datasets from partner NGOs and research labs. Emphasis is on ethical AI, explainability, and deployable prototypes. Mentors from Google DeepMind and academic institutions provide hourly office hours.',
    rules:
      'Training data must come from provided datasets or publicly licensed sources. Document data provenance. Teams of 3–5. Models must include explainability outputs. No facial recognition on non-consented data.',
    eligibility:
      'Graduate students and professionals preferred but undergraduates with ML coursework welcome. Teams must include at least one member with Python/ML experience.',
    status: 'active',
    tracks: [
      {
        id: 'evt-active-2-track-ai',
        name: 'Healthcare AI',
        description: 'ML solutions for diagnosis support, patient triage, and medical imaging.',
        problemStatement:
          'Build a model that assists radiologists in detecting early-stage lung nodules from chest X-rays. Include confidence scores and saliency maps for explainability.',
        techStack: ['PyTorch', 'MONAI', 'FastAPI', 'React', 'DICOM'],
      },
      {
        id: 'evt-active-2-track-ml',
        name: 'Climate & Sustainability ML',
        description:
          'Predictive models for climate risk, energy optimization, and carbon tracking.',
        problemStatement:
          'Create a system that forecasts solar farm output 24 hours ahead using weather and satellite data. Beat the baseline MAE provided in the dataset.',
        techStack: ['scikit-learn', 'XGBoost', 'Apache Spark', 'Streamlit', 'GCP'],
      },
      {
        id: 'evt-active-2-track-devtools',
        name: 'MLOps for Social Good',
        description: 'Infrastructure tools that help NGOs deploy and monitor ML models.',
        problemStatement:
          'Build a low-code platform that lets non-technical NGO staff deploy, monitor, and retrain models without writing code.',
        techStack: ['Python', 'BentoML', 'Gradio', 'Terraform', 'AWS'],
      },
    ],
    prizes: [
      {
        trackId: 'evt-active-2-track-ai',
        rank: 1,
        amount: 20000,
        currency: 'USD',
        perks: ['WHO innovation lab pilot', 'Publication support'],
      },
      {
        trackId: 'evt-active-2-track-ml',
        rank: 1,
        amount: 15000,
        currency: 'USD',
        perks: ['Climate tech accelerator intro'],
      },
      {
        trackId: 'evt-active-2-track-devtools',
        rank: 1,
        amount: 10000,
        currency: 'USD',
        perks: ['NGO deployment grant'],
      },
    ],
    sponsors: pickShowcaseSponsors(
      [
        { name: 'OpenAI', tier: 'platinum' },
        { name: 'NVIDIA', tier: 'platinum' },
        { name: 'Hugging Face', tier: 'gold' },
        { name: 'Weights & Biases', tier: 'silver' },
        { name: 'Pinecone', tier: 'bronze' },
      ],
      'sp-ac2',
    ),
    timeline: [
      {
        date: '2026-05-15T00:00:00.000Z',
        label: 'Registration Opens',
        description: 'Dataset access granted upon team confirmation.',
      },
      {
        date: '2026-06-05T23:59:59.000Z',
        label: 'Registration Closes',
        description: 'Team and track lock.',
      },
      {
        date: '2026-06-08T06:00:00.000Z',
        label: 'Hackathon Starts',
        description: 'Dataset release and ethics briefing.',
      },
      {
        date: '2026-06-10T06:00:00.000Z',
        label: 'Submissions Due',
        description: 'Model weights, notebooks, and impact report submitted.',
      },
      {
        date: '2026-06-11T08:00:00.000Z',
        label: 'Judging',
        description: 'Technical and ethics panel review.',
      },
      {
        date: '2026-06-12T14:00:00.000Z',
        label: 'Awards',
        description: 'Winners announced with NGO partner presentations.',
      },
    ],
    registrationOpen: '2026-05-15T00:00:00.000Z',
    registrationClose: '2026-06-05T23:59:59.000Z',
    submissionDeadline: '2026-06-10T06:00:00.000Z',
    judgingDate: '2026-06-11T08:00:00.000Z',
    resultsDate: '2026-06-12T14:00:00.000Z',
    participantCount: 287,
    teamMinSize: 3,
    teamMaxSize: 5,
    faqs: [
      {
        question: 'Are datasets HIPAA compliant?',
        answer: 'Healthcare datasets are de-identified and approved for research use only.',
      },
      {
        question: 'Must models be explainable?',
        answer: 'Yes. All healthcare track submissions require saliency maps or SHAP values.',
      },
      {
        question: 'Can we use pre-trained models?',
        answer:
          'Fine-tuning pre-trained models is allowed. Document the base model and training procedure.',
      },
      {
        question: 'Is GPU access provided?',
        answer: 'Kaggle kernels and GCP credits are available to all registered teams.',
      },
      {
        question: 'What is the impact report?',
        answer:
          'A 2-page document describing potential real-world deployment and ethical considerations.',
      },
      {
        question: 'Can NGOs adopt our project?',
        answer: 'Winning teams receive introductions to partner NGOs for pilot deployments.',
      },
    ],
    createdAt: '2026-05-01T12:00:00.000Z',
  },
  {
    id: 'evt-closed-1',
    title: 'Quantum Leap Innovation Fest 2025',
    tagline: 'Exploring the intersection of quantum and classical computing',
    description:
      'Quantum Leap brought together 320 participants to experiment with quantum algorithms, hybrid classical-quantum workflows, and quantum-inspired optimization. This closed event featured IBM Quantum and AWS Braket credits, workshops on Qiskit and Cirq, and challenges in cryptography, logistics, and drug discovery simulation. Winning teams presented at Q2B 2025.',
    rules:
      'Quantum circuits must run on provided simulators or partner hardware. Hybrid solutions encouraged. Teams of 2–4. All submissions required reproducible notebooks.',
    eligibility:
      'Open to researchers and students with linear algebra background. Introductory quantum workshops were provided pre-event.',
    status: 'closed',
    tracks: [
      {
        id: 'evt-closed-1-track-ai',
        name: 'Quantum Machine Learning',
        description: 'Hybrid quantum-classical ML models for classification and generative tasks.',
        problemStatement:
          'Implement a variational quantum classifier on a provided dataset and compare accuracy vs. classical baselines.',
        techStack: ['Qiskit', 'PennyLane', 'PyTorch', 'Python', 'Jupyter'],
      },
      {
        id: 'evt-closed-1-track-ml',
        name: 'Optimization & Simulation',
        description: 'Quantum-inspired algorithms for combinatorial optimization problems.',
        problemStatement:
          'Solve a vehicle routing problem using QAOA or quantum annealing. Benchmark against classical heuristics.',
        techStack: ['D-Wave Ocean', 'Qiskit Optimization', 'NumPy', 'NetworkX'],
      },
      {
        id: 'evt-closed-1-track-devtools',
        name: 'Quantum DevTools',
        description: 'Tools that simplify quantum circuit design, debugging, and visualization.',
        problemStatement:
          'Build a circuit debugger that visualizes qubit states step-by-step and highlights decoherence hotspots.',
        techStack: ['TypeScript', 'Qiskit.js', 'Three.js', 'React', 'WebGL'],
      },
      {
        id: 'evt-closed-1-track-web3',
        name: 'Quantum-Safe Cryptography',
        description: 'Post-quantum cryptographic schemes and blockchain integration.',
        problemStatement:
          'Implement a post-quantum signature scheme and demonstrate a simple blockchain block signed with lattice-based cryptography.',
        techStack: ['Rust', 'liboqs', 'Solidity', 'wasm-pack'],
      },
    ],
    prizes: [
      {
        trackId: 'evt-closed-1-track-ai',
        rank: 1,
        amount: 10000,
        currency: 'USD',
        perks: ['IBM Quantum researcher mentorship'],
      },
      {
        trackId: 'evt-closed-1-track-ml',
        rank: 1,
        amount: 8000,
        currency: 'USD',
        perks: ['AWS Braket credits'],
      },
      {
        trackId: 'evt-closed-1-track-devtools',
        rank: 1,
        amount: 6000,
        currency: 'USD',
        perks: ['Qiskit contributor badge'],
      },
      {
        trackId: 'evt-closed-1-track-web3',
        rank: 1,
        amount: 5000,
        currency: 'USD',
        perks: ['NIST PQC workshop invite'],
      },
    ],
    sponsors: pickShowcaseSponsors(
      [
        { name: 'NVIDIA', tier: 'platinum' },
        { name: 'Groq', tier: 'platinum' },
        { name: 'LangChain', tier: 'gold' },
        { name: 'Hugging Face', tier: 'silver' },
        { name: 'OpenAI', tier: 'bronze' },
      ],
      'sp-cl1',
    ),
    timeline: [
      {
        date: '2025-09-01T00:00:00.000Z',
        label: 'Registration Opens',
        description: 'Quantum fundamentals workshop series begins.',
      },
      {
        date: '2025-10-15T23:59:59.000Z',
        label: 'Registration Closes',
        description: 'Final team confirmation.',
      },
      {
        date: '2025-10-25T08:00:00.000Z',
        label: 'Hackathon Begins',
        description: 'IBM Quantum and Braket credits distributed.',
      },
      {
        date: '2025-10-27T08:00:00.000Z',
        label: 'Submissions Due',
        description: 'Notebooks and circuit diagrams submitted.',
      },
      {
        date: '2025-10-28T10:00:00.000Z',
        label: 'Judging',
        description: 'Expert panel reviews quantum advantage claims.',
      },
      {
        date: '2025-10-29T15:00:00.000Z',
        label: 'Awards',
        description: 'Winners presented at closing ceremony.',
      },
    ],
    registrationOpen: '2025-09-01T00:00:00.000Z',
    registrationClose: '2025-10-15T23:59:59.000Z',
    submissionDeadline: '2025-10-27T08:00:00.000Z',
    judgingDate: '2025-10-28T10:00:00.000Z',
    resultsDate: '2025-10-29T15:00:00.000Z',
    participantCount: 320,
    teamMinSize: 2,
    teamMaxSize: 4,
    faqs: [
      {
        question: 'Do I need quantum hardware access?',
        answer: 'Simulators were sufficient. Hardware access was optional via IBM and AWS credits.',
      },
      {
        question: 'What background is required?',
        answer:
          'Linear algebra and basic Python. Pre-event workshops covered quantum fundamentals.',
      },
      {
        question: 'Could teams use PennyLane?',
        answer: 'Yes. Qiskit, Cirq, PennyLane, and Braket SDKs were all supported.',
      },
      {
        question: 'How were results verified?',
        answer: 'Judges re-ran notebooks on provided infrastructure to verify claims.',
      },
      {
        question: 'Were there qubit limits?',
        answer: 'Simulator shots unlimited. Hardware jobs capped at 1000 shots per team.',
      },
      {
        question: 'Is this event recurring?',
        answer: 'Quantum Leap 2026 is planned for Q4 2026. Join the mailing list for updates.',
      },
    ],
    createdAt: '2025-08-01T09:00:00.000Z',
  },
  {
    id: 'evt-closed-2',
    title: 'GreenStack Sustainability Hack 2025',
    tagline: 'Code for a greener planet',
    description:
      'GreenStack convened 250 developers to build software solutions for environmental sustainability. Tracks covered carbon accounting, renewable energy optimization, circular economy platforms, and green Web3 incentives. Partners included the UN Environment Programme and major cleantech VCs. This closed hackathon produced 68 submissions, with 12 projects receiving seed funding follow-ups.',
    rules:
      'Projects must demonstrate measurable environmental impact metrics. Open-source encouraged. Teams of 2–5. Greenwashing or unsubstantiated claims led to disqualification.',
    eligibility:
      'Open to all developers passionate about climate tech. No prior sustainability experience required.',
    status: 'closed',
    tracks: [
      {
        id: 'evt-closed-2-track-ml',
        name: 'Carbon Intelligence',
        description:
          'ML models for emissions tracking, forecasting, and reduction recommendations.',
        problemStatement:
          'Build a tool that estimates Scope 3 emissions from supply chain data and recommends top 3 reduction strategies with projected impact.',
        techStack: ['Python', 'Pandas', 'scikit-learn', 'FastAPI', 'Mapbox'],
      },
      {
        id: 'evt-closed-2-track-web3',
        name: 'Green DeFi & Tokenized Credits',
        description: 'Blockchain-based carbon credit marketplaces and incentive mechanisms.',
        problemStatement:
          'Create a smart contract system for tokenizing verified carbon offsets with transparent provenance on-chain.',
        techStack: ['Solidity', 'Chainlink', 'IPFS', 'React', 'The Graph'],
      },
      {
        id: 'evt-closed-2-track-devtools',
        name: 'Sustainability DevTools',
        description: 'Developer tools for measuring and reducing software carbon footprint.',
        problemStatement:
          'Build a CI plugin that estimates the carbon cost of each deployment based on cloud region, instance type, and runtime.',
        techStack: ['TypeScript', 'GitHub Actions', 'Go', 'Green Software Foundation SDK'],
      },
      {
        id: 'evt-closed-2-track-ai',
        name: 'Climate NLP & Knowledge Graphs',
        description:
          'AI systems for parsing climate policy documents and surfacing actionable insights.',
        problemStatement:
          'Build an NLP pipeline that extracts climate commitments from corporate ESG reports and scores alignment with Paris Agreement targets.',
        techStack: ['spaCy', 'LangChain', 'Neo4j', 'Streamlit', 'Hugging Face'],
      },
    ],
    prizes: [
      {
        trackId: 'evt-closed-2-track-ml',
        rank: 1,
        amount: 12000,
        currency: 'USD',
        perks: ['Cleantech VC pitch day'],
      },
      {
        trackId: 'evt-closed-2-track-web3',
        rank: 1,
        amount: 10000,
        currency: 'USD',
        perks: ['Toucan Protocol integration support'],
      },
      {
        trackId: 'evt-closed-2-track-devtools',
        rank: 1,
        amount: 8000,
        currency: 'USD',
        perks: ['Green Software Foundation membership'],
      },
      {
        trackId: 'evt-closed-2-track-ai',
        rank: 1,
        amount: 8000,
        currency: 'USD',
        perks: ['UNEP pilot program intro'],
      },
    ],
    sponsors: pickShowcaseSponsors(
      [
        { name: 'Polygon', tier: 'platinum' },
        { name: 'Supabase', tier: 'platinum' },
        { name: 'LangChain', tier: 'gold' },
        { name: 'Netlify', tier: 'silver' },
        { name: 'Vercel', tier: 'bronze' },
      ],
      'sp-cl2',
    ),
    timeline: [
      {
        date: '2025-03-01T00:00:00.000Z',
        label: 'Registration Opens',
        description: 'Climate tech primer workshops available.',
      },
      {
        date: '2025-04-10T23:59:59.000Z',
        label: 'Registration Closes',
        description: 'Team lock and impact metric training.',
      },
      {
        date: '2025-04-18T07:00:00.000Z',
        label: 'Hackathon Starts',
        description: 'Mentor matching and dataset release.',
      },
      {
        date: '2025-04-20T07:00:00.000Z',
        label: 'Submissions Due',
        description: 'Projects with impact calculators submitted.',
      },
      {
        date: '2025-04-21T09:00:00.000Z',
        label: 'Judging',
        description: 'Impact and technical panels review submissions.',
      },
      {
        date: '2025-04-22T16:00:00.000Z',
        label: 'Awards & Fundraising',
        description: 'Winners announced. VC office hours for top 20 teams.',
      },
    ],
    registrationOpen: '2025-03-01T00:00:00.000Z',
    registrationClose: '2025-04-10T23:59:59.000Z',
    submissionDeadline: '2025-04-20T07:00:00.000Z',
    judgingDate: '2025-04-21T09:00:00.000Z',
    resultsDate: '2025-04-22T16:00:00.000Z',
    participantCount: 250,
    teamMinSize: 2,
    teamMaxSize: 5,
    faqs: [
      {
        question: 'How was environmental impact measured?',
        answer: 'Teams used our impact calculator template with kg CO2e, water, and waste metrics.',
      },
      {
        question: 'Were carbon offsets provided?',
        answer:
          'The event itself was carbon-neutral via Patch offsets. Projects did not need offsets.',
      },
      {
        question: 'Could we use proprietary company data?',
        answer: 'Only with written permission. Public datasets were recommended.',
      },
      {
        question: 'What happened to winning projects?',
        answer: '12 teams received seed funding intros. 8 projects continued as open-source.',
      },
      {
        question: 'Was Web3 required for the green DeFi track?',
        answer:
          'Smart contracts were required for that track only. Other tracks had no blockchain requirement.',
      },
      {
        question: 'Will GreenStack return?',
        answer:
          'GreenStack 2026 is scheduled for Earth Day week. Watch beetlex.io for announcements.',
      },
    ],
    createdAt: '2025-02-01T11:00:00.000Z',
  },
]

export const mockEvents: Event[] = [...coreMockEvents, ...extraMockEvents]

export const mockEventById = Object.fromEntries(
  mockEvents.map((event) => [event.id, event]),
) as Record<string, Event>
