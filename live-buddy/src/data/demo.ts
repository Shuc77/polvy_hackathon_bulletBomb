import type { LiveQuestion, LiveTerm } from '../types';

export const DEMO_SESSION_ID = 'demo-ai-growth-20261023';

export const demoTerms: LiveTerm[] = [
  {
    id: 'demo-term-1',
    sessionId: DEMO_SESSION_ID,
    term: '能力图谱',
    translation: 'Competency graph',
    explanation:
      '把岗位所需的知识、技能、项目经历和素养拆成结构化节点，并描述节点之间的关系。它是智能匹配和个性化培养的基础。',
    timestamp: 186,
    source: 'demo',
    capturedAt: 1761193311000,
  },
  {
    id: 'demo-term-2',
    sessionId: DEMO_SESSION_ID,
    term: 'AI 智能匹配',
    translation: 'AI-powered matching',
    explanation:
      '综合使用学生画像、岗位画像和匹配规则，计算人岗或课程适配度。结果不仅要排序，还应解释“为什么匹配”。',
    timestamp: 352,
    source: 'demo',
    capturedAt: 1761193477000,
  },
  {
    id: 'demo-term-3',
    sessionId: DEMO_SESSION_ID,
    term: '多模态画像',
    translation: 'Multimodal profile',
    explanation:
      '把文本简历、项目作品、证书、行为记录等不同形式的数据融合成统一画像，用于更全面地理解学生能力。',
    timestamp: 517,
    source: 'demo',
    capturedAt: 1761193642000,
  },
  {
    id: 'demo-term-4',
    sessionId: DEMO_SESSION_ID,
    term: '岗位胜任力',
    translation: 'Job competency',
    explanation:
      '完成某一岗位关键任务所需的可观察、可评价能力集合，既包括硬技能，也包括沟通、协作和问题解决等通用能力。',
    timestamp: 781,
    source: 'demo',
    capturedAt: 1761193906000,
  },
  {
    id: 'demo-term-5',
    sessionId: DEMO_SESSION_ID,
    term: '可解释性',
    translation: 'Explainability',
    explanation:
      '系统给出匹配或推荐结论时，能够说明使用了哪些证据、触发了哪些规则，以及主要差距在哪里，便于教师和学生复核。',
    timestamp: 1024,
    source: 'demo',
    capturedAt: 1761194149000,
  },
];

export const demoQuestions: LiveQuestion[] = [
  {
    id: 'demo-question-1',
    sessionId: DEMO_SESSION_ID,
    title: '建设能力图谱时，首先要解决的核心问题是什么？',
    options: [
      { key: 'A', text: '先采购一套最复杂的大模型' },
      { key: 'B', text: '统一岗位能力的颗粒度与描述标准' },
      { key: 'C', text: '先把所有学生都归为同一类型' },
      { key: 'D', text: '只统计证书数量，不看实际能力' },
    ],
    correctAnswers: ['B'],
    explanation:
      '如果不同岗位、不同教师对能力的命名和粒度不一致，后续画像、匹配和评价都会失去共同语言。',
    status: 'closed',
    answerVisible: true,
    submittedAnswers: ['B'],
    source: 'demo',
    askedAt: 1761193750000,
  },
  {
    id: 'demo-question-2',
    sessionId: DEMO_SESSION_ID,
    title: '怎样让 AI 人岗匹配结果更容易被教师和学生接受？',
    options: [
      { key: 'A', text: '只展示一个无法解释的总分' },
      { key: 'B', text: '忽略岗位差异，统一使用一套模板' },
      { key: 'C', text: '展示匹配证据、能力差距与推荐依据' },
      { key: 'D', text: '完全由模型决定，不允许人工复核' },
    ],
    correctAnswers: ['C'],
    explanation:
      '可解释结果能让使用者知道系统依据了哪些能力证据，也便于教师修正数据、学生明确提升方向。',
    status: 'closed',
    answerVisible: true,
    submittedAnswers: [],
    source: 'demo',
    askedAt: 1761194020000,
  },
];
