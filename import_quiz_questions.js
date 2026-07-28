const db = require('./src/db/neonClient');

const questions = [
  {
    id: 1,
    question_text: "When you face something new and difficult, your first instinct is to...",
    option_a: "Understand how it works before moving forward",
    option_b: "Make sure the people around you are okay",
    option_c: "Look for the proper and respectful way to handle it",
    option_d: "Aim to do it well from the beginning",
    option_e: "Try a fresh or unconventional approach immediately"
  },
  {
    id: 2,
    question_text: "In a team, you naturally become the person who...",
    option_a: "Asks questions and opens new perspectives",
    option_b: "Supports and encourages others consistently",
    option_c: "Maintains order, fairness, and good conduct",
    option_d: "Pushes the team toward strong execution",
    option_e: "Brings original ideas and bold experiments"
  },
  {
    id: 3,
    question_text: "When you make a mistake, you are most likely to...",
    option_a: "Reflect on what it teaches you",
    option_b: "Worry about how it affected others",
    option_c: "Take responsibility for it right away",
    option_d: "Fix it carefully and improve the result",
    option_e: "Adjust the method and try something new"
  },
  {
    id: 4,
    question_text: "What motivates you the most?",
    option_a: "Learning something meaningful",
    option_b: "Helping people grow well",
    option_c: "Doing what is right",
    option_d: "Delivering excellent results",
    option_e: "Creating something different and fresh"
  },
  {
    id: 5,
    question_text: "When you are given a task, you focus first on...",
    option_a: "Understanding the bigger picture",
    option_b: "Doing it with care and sincerity",
    option_c: "Doing it properly and respectfully",
    option_d: "Doing it to a high standard",
    option_e: "Doing it in a creative way"
  },
  {
    id: 6,
    question_text: "Under pressure, you tend to...",
    option_a: "Ask more questions to clarify things",
    option_b: "Stay present for the people involved",
    option_c: "Hold on to principles and discipline",
    option_d: "Become even more precise and focused",
    option_e: "Look for a breakthrough angle others miss"
  },
  {
    id: 7,
    question_text: "When you see a problem, your first response is to...",
    option_a: "Analyze why it happened",
    option_b: "Consider who is affected most",
    option_c: "Restore fairness and proper conduct",
    option_d: "Improve the process or standard",
    option_e: "Reimagine the whole approach"
  },
  {
    id: 8,
    question_text: "You feel most satisfied when...",
    option_a: "You discovered something new",
    option_b: "Someone felt genuinely supported by you",
    option_c: "You stayed true to what matters",
    option_d: "The result met a high standard",
    option_e: "You made something original happen"
  },
  {
    id: 9,
    question_text: "If your group is struggling, you are most likely to...",
    option_a: "Ask what the group has not understood yet",
    option_b: "Lift morale and strengthen the team spirit",
    option_c: "Re-establish boundaries and discipline",
    option_d: "Tighten the process and improve execution",
    option_e: "Change the strategy completely"
  },
  {
    id: 10,
    question_text: "Which strength feels most natural to you?",
    option_a: "Curiosity",
    option_b: "Empathy",
    option_c: "Integrity",
    option_d: "Precision",
    option_e: "Originality"
  },
  {
    id: 11,
    question_text: "When receiving feedback, you are most likely to...",
    option_a: "Be curious about what you can learn",
    option_b: "Appreciate the intention behind it",
    option_c: "Listen seriously and respond with maturity",
    option_d: "Use it to improve quality",
    option_e: "Turn it into a new idea"
  },
  {
    id: 12,
    question_text: "In a competition, what matters most to you?",
    option_a: "How much you learned",
    option_b: "How well people were treated",
    option_c: "Whether it stayed fair",
    option_d: "Whether you performed your best",
    option_e: "Whether you brought something new"
  },
  {
    id: 13,
    question_text: "When planning for the future, you usually think about...",
    option_a: "What you want to discover",
    option_b: "Who you want to grow with",
    option_c: "What values to keep",
    option_d: "What standards to reach",
    option_e: "What new possibilities to create"
  },
  {
    id: 14,
    question_text: "If someone in your group is left behind, your first concern is...",
    option_a: "Whether they understand",
    option_b: "How to support them",
    option_c: "How to restore fairness",
    option_d: "How to maintain performance",
    option_e: "How to redesign the task"
  },
  {
    id: 15,
    question_text: "What kind of challenge excites you most?",
    option_a: "Stretching your thinking",
    option_b: "Encouraging others",
    option_c: "Testing your character",
    option_d: "Demanding mastery",
    option_e: "Allowing experimentation"
  },
  {
    id: 16,
    question_text: "When leading others, you naturally try to...",
    option_a: "Inspire learning",
    option_b: "Create trust",
    option_c: "Set respect and accountability",
    option_d: "Ensure execution",
    option_e: "Spark imagination"
  },
  {
    id: 17,
    question_text: "When rules feel inconvenient, you usually...",
    option_a: "Ask why they exist",
    option_b: "Consider impact on people",
    option_c: "Follow unless morally wrong",
    option_d: "Keep if they protect quality",
    option_e: "Look for smarter alternatives"
  },
  {
    id: 18,
    question_text: "Your ideal environment is one where people...",
    option_a: "Explore freely",
    option_b: "Care for each other",
    option_c: "Act with respect",
    option_d: "Take pride in quality",
    option_e: "Think differently"
  },
  {
    id: 19,
    question_text: "When time is short, you tend to protect...",
    option_a: "The chance to learn",
    option_b: "People involved",
    option_c: "Principles",
    option_d: "Quality output",
    option_e: "Better solutions"
  },
  {
    id: 20,
    question_text: "Which statement feels most like you?",
    option_a: "There is always more to learn",
    option_b: "People matter deeply",
    option_c: "Character define the person",
    option_d: "Good work must be done right",
    option_e: "The future can be imagined"
  },
  {
    id: 21,
    question_text: "When you enter a new community, you look for...",
    option_a: "What you can discover",
    option_b: "Who you can connect with",
    option_c: "What values they share",
    option_d: "What you can achieve",
    option_e: "What gap you can fill in"
  },
  {
    id: 22,
    question_text: "If you could improve one thing, you would start with...",
    option_a: "Willingness to learn",
    option_b: "Care for others",
    option_c: "Values and principles",
    option_d: "Work standards",
    option_e: "Courage to innovate"
  },
  {
    id: 23,
    question_text: "When someone disagrees with you...",
    option_a: "Ask questions",
    option_b: "Keep it respectful",
    option_c: "Hold principles",
    option_d: "Focus on best result",
    option_e: "Find new perspective"
  },
  {
    id: 24,
    question_text: "When under real pressure, what do you protect first?",
    option_a: "Growth",
    option_b: "People",
    option_c: "Values",
    option_d: "Standards",
    option_e: "Innovation"
  },
  {
    id: 25,
    question_text: "Which of these resonates with you more?",
    option_a: "Only by asking questions you may find truth",
    option_b: "Caring is the foundation of human connection",
    option_c: "Trustworthiness is priceless",
    option_d: "Strive for excellence in every action",
    option_e: "Bravery to create boldly"
  }
];

async function updateQuestions() {
  console.log('🔄 Updating 25 real House Allegiance Quiz questions...');

  // Clear existing questions
  await db.query('DELETE FROM questions;');
  console.log('✅ Old questions cleared.');

  for (const q of questions) {
    await db.query(`
      INSERT INTO questions (id, question_text, option_a, option_b, option_c, option_d, option_e)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.option_e]);
  }

  console.log(`✅ Successfully inserted ${questions.length} real quiz questions!`);

  // Verify
  const verify = await db.query('SELECT id, question_text FROM questions ORDER BY id ASC;');
  for (const row of verify.rows) {
    console.log(`Q${row.id}: ${row.question_text.slice(0, 60)}...`);
  }

  // Confirm House Mapping
  console.log('\n📋 House Answer Mapping:');
  console.log('  Option A → House of Thenova   (Curiosity & Innovation)');
  console.log('  Option B → House of Havaria   (Empathy & People)');
  console.log('  Option C → House of Reverion  (Integrity & Character)');
  console.log('  Option D → House of Quorion   (Precision & Excellence)');
  console.log('  Option E → House of Creanova  (Originality & Creativity)');

  process.exit(0);
}

updateQuestions().catch(err => {
  console.error('Error updating questions:', err);
  process.exit(1);
});
