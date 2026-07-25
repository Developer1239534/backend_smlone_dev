const { pool } = require('./neonClient');

const houses = [
  { id: 'Thenova', name: 'Thenova', description: 'The Seekers. Curiosity is the engine of all progress.', core_value: 'Curiosity' },
  { id: 'Havaria', name: 'Havaria', description: 'The Caretakers. Caring is the foundation of human connection.', core_value: 'Empathy' },
  { id: 'Reverion', name: 'Reverion', description: 'The Guardians. Trustworthiness is priceless.', core_value: 'Integrity' },
  { id: 'Quorion', name: 'Quorion', description: 'The Masters. Strive for excellence in every action.', core_value: 'Precision' },
  { id: 'Creanova', name: 'Creanova', description: 'The Visionaries. Bravery to create boldly.', core_value: 'Originality' }
];

const questions = [
  { q: "When you face something new and difficult, your first instinct is to...", a: "Understand how it works before moving forward", b: "Make sure the people around you are okay", c: "Look for the proper and respectful way to handle it", d: "Aim to do it well from the beginning", e: "Try a fresh or unconventional approach immediately" },
  { q: "In a team, you naturally become the person who...", a: "Asks questions and opens new perspectives", b: "Supports and encourages others consistently", c: "Maintains order, fairness, and good conduct", d: "Pushes the team toward strong execution", e: "Brings original ideas and bold experiments" },
  { q: "When you make a mistake, you are most likely to...", a: "Reflect on what it teaches you", b: "Worry about how it affected others", c: "Take responsibility for it right away", d: "Fix it carefully and improve the result", e: "Adjust the method and try something new" },
  { q: "What motivates you the most?", a: "Learning something meaningful", b: "Helping people grow well", c: "Doing what is right", d: "Delivering excellent results", e: "Creating something different and fresh" },
  { q: "When you are given a task, you focus first on...", a: "Understanding the bigger picture", b: "Doing it with care and sincerity", c: "Doing it properly and respectfully", d: "Doing it to a high standard", e: "Doing it in a creative way" },
  { q: "Under pressure, you tend to...", a: "Ask more questions to clarify things", b: "Stay present for the people involved", c: "Hold on to principles and discipline", d: "Become even more precise and focused", e: "Look for a breakthrough angle others miss" },
  { q: "When you see a problem, your first response is to...", a: "Analyze why it happened", b: "Consider who is affected most", c: "Restore fairness and proper conduct", d: "Improve the process or standard", e: "Reimagine the whole approach" },
  { q: "You feel most satisfied when...", a: "You discovered something new", b: "Someone felt genuinely supported by you", c: "You stayed true to what matters", d: "The result met a high standard", e: "You made something original happen" },
  { q: "If your group is struggling, you are most likely to...", a: "Ask what the group has not understood yet", b: "Lift morale and strengthen the team spirit", c: "Re-establish boundaries and discipline", d: "Tighten the process and improve execution", e: "Change the strategy completely" },
  { q: "Which strength feels most natural to you?", a: "Curiosity", b: "Empathy", c: "Integrity", d: "Precision", e: "Originality" },
  { q: "When receiving feedback, you are most likely to...", a: "Be curious about what you can learn", b: "Appreciate the intention behind it", c: "Listen seriously and respond with maturity", d: "Use it to improve quality", e: "Turn it into a new idea" },
  { q: "In a competition, what matters most to you?", a: "How much you learned", b: "How well people were treated", c: "Whether it stayed fair", d: "Whether you performed your best", e: "Whether you brought something new" },
  { q: "When planning for the future, you usually think about...", a: "What you want to discover", b: "Who you want to grow with", c: "What values to keep", d: "What standards to reach", e: "What new possibilities to create" },
  { q: "If someone in your group is left behind, your first concern is...", a: "Whether they understand", b: "How to support them", c: "How to restore fairness", d: "How to maintain performance", e: "How to redesign the task" },
  { q: "What kind of challenge excites you most?", a: "Stretching your thinking", b: "Encouraging others", c: "Testing your character", d: "Demanding mastery", e: "Allowing experimentation" },
  { q: "When leading others, you naturally try to...", a: "Inspire learning", b: "Create trust", c: "Set respect and accountability", d: "Ensure execution", e: "Spark imagination" },
  { q: "When rules feel inconvenient, you usually...", a: "Ask why they exist", b: "Consider impact on people", c: "Follow unless morally wrong", d: "Keep if they protect quality", e: "Look for smarter alternatives" },
  { q: "Your ideal environment is one where people...", a: "Explore freely", b: "Care for each other", c: "Act with respect", d: "Take pride in quality", e: "Think differently" },
  { q: "When time is short, you tend to protect...", a: "The chance to learn", b: "People involved", c: "Principles", d: "Quality output", e: "Better solutions" },
  { q: "Which statement feels most like you?", a: "There is always more to learn", b: "People matter deeply", c: "Character define the person", d: "Good work must be done right", e: "The future can be imagined" },
  { q: "When you enter a new community, you look for...", a: "What you can discover", b: "Who you can connect with", c: "What values they share", d: "What you can achieve", e: "What gap you can fill in" },
  { q: "If you could improve one thing, you would start with...", a: "Willingness to learn", b: "Care for others", c: "Values and principles", d: "Work standards", e: "Courage to innovate" },
  { q: "When someone disagrees with you...", a: "Ask questions", b: "Keep it respectful", c: "Hold principles", d: "Focus on best result", e: "Find new perspective" },
  { q: "When under real pressure, what do you protect first?", a: "Growth", b: "People", c: "Values", d: "Standards", e: "Innovation" },
  { q: "Which of these resonates with you more?", a: "Only by asking questions you may find truth", b: "Caring is the foundation of human connection", c: "Trustworthiness is priceless", d: "Strive for excellence in every action.", e: "Bravery to create boldly" }
];

const fs = require('fs');
const path = require('path');

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Run Schema Creation
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('✅ Tables created successfully!');

    // Seed Houses
    for (const h of houses) {
      await pool.query(
        `INSERT INTO houses (id, name, description, core_value) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET 
         name = EXCLUDED.name, description = EXCLUDED.description, core_value = EXCLUDED.core_value`,
        [h.id, h.name, h.description, h.core_value]
      );
    }
    console.log('✅ Houses seeded!');

    // Clear and Seed Questions
    await pool.query('TRUNCATE TABLE questions RESTART IDENTITY CASCADE');
    for (const q of questions) {
      await pool.query(
        `INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, option_e)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [q.q, q.a, q.b, q.c, q.d, q.e]
      );
    }
    console.log('✅ 25 Questions seeded!');

    console.log('🎉 Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
