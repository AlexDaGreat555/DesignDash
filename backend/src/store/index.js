// In-memory store — replace with Redis for multi-process deployments
const rooms = new Map()

class Room {
  constructor(code, spec, timeLimitSeconds) {
    this.code = code
    this.spec = spec
    this.timeLimitSeconds = timeLimitSeconds || 600
    this.startedAt = null
    this.sprintTimer = null
    this.phase = 'lobby' // lobby | sprint | processing | voting | results
    this.players = []
    this.submissions = []
    this.votes = [] // [{ voterId, submissionId, stars }]
    this.currentSlide = 0
    this.slideTimer = null
  }

  addPlayer(player) {
    if (!this.players.find((p) => p.id === player.id)) {
      this.players.push({ ...player, submissionId: null })
    }
  }

  removePlayer(id) {
    this.players = this.players.filter((p) => p.id !== id)
  }

  markUploaded(playerId, submissionId) {
    const player = this.players.find((p) => p.id === playerId)
    if (player) player.submissionId = submissionId
  }

  shuffleSubmissions() {
    // Build submissions list including "no submission" placeholders
    this.submissions = [...this.players].map((p) => ({
      id: p.submissionId,
      playerId: p.id,
      imageUrl: p.submissionId ? `/uploads/${p.submissionId}` : null,
    }))
    // Fisher-Yates shuffle
    for (let i = this.submissions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.submissions[i], this.submissions[j]] = [this.submissions[j], this.submissions[i]]
    }
  }

  recordVote(voterId, submissionId, stars) {
    this.votes.push({ voterId, submissionId, stars })
  }

  hasVoted(voterId, submissionId) {
    return this.votes.some((v) => v.voterId === voterId && v.submissionId === submissionId)
  }

  computeScores() {
    return this.players
      .map((p) => {
        const received = this.votes.filter((v) => v.submissionId === p.submissionId)
        const avg = received.length
          ? received.reduce((sum, v) => sum + v.stars, 0) / received.length
          : 0
        return { playerId: p.id, nickname: p.nickname, score: avg }
      })
      .sort((a, b) => b.score - a.score)
  }
}

function getOrCreateRoom(code, timeLimitSeconds) {
  if (!rooms.has(code)) {
    const spec = pickRandomSpec()
    rooms.set(code, new Room(code, spec, timeLimitSeconds))
  }
  return rooms.get(code)
}

function getRoom(code) {
  return rooms.get(code) || null
}

const SPEC_POOL = [
  {
    projectName: 'TechFest 2026',
    type: 'Event Poster',
    objective: 'Drive ticket sales for an annual student hackathon',
    background: 'Annual student hackathon expecting 500 attendees. Sponsors include major tech companies. Previous year had 350 attendees.',
    targetAudience: 'College students ages 18–24, tech-savvy, interested in startups and engineering',
    keyMessage: 'Build. Pitch. Win.',
    callToAction: 'Register at the event website before spots fill up',
    visualDirection: 'Bold, high-energy. Neon accents welcome. Think hackathon energy, not corporate.',
  },
  {
    projectName: 'Bloom Wellness App',
    type: 'Mobile UI',
    objective: 'Design an onboarding screen that communicates calm and builds trust',
    background: 'A mental wellness startup targeting burnout in remote workers. The app offers guided meditation and mood journaling.',
    targetAudience: 'Remote workers ages 25–40 experiencing stress or burnout',
    keyMessage: 'Your peace starts here.',
    callToAction: 'Start your free 7-day trial',
    visualDirection: 'Soft gradients, rounded shapes, muted greens and lavenders. Warm and inviting.',
  },
  {
    projectName: 'Arctic Roast Coffee',
    type: 'Branding',
    objective: 'Create a logo and label concept for a premium cold brew brand',
    background: 'New D2C cold brew brand positioning itself as "adventurous and crisp." Targets outdoor enthusiasts who drink coffee on the go.',
    targetAudience: 'Outdoor enthusiasts and athletes ages 22–35 who value bold flavors',
    keyMessage: 'Cold. Bold. Untamed.',
    callToAction: 'Find us at your local outdoor gear shop',
    visualDirection: 'Deep navy, ice-white, and glacier blue. Rugged yet clean.',
  },
  {
    projectName: 'Nova Music Festival',
    type: 'Social Media Kit',
    objective: 'Design an Instagram story and post template for a 3-day music festival',
    background: 'A boutique indie music festival in its second year. Last year sold out in 48 hours. Lineup features 20 emerging artists.',
    targetAudience: 'Music fans ages 18–30 who prefer indie and alternative genres',
    keyMessage: 'Three days. Twenty artists. One unforgettable weekend.',
    callToAction: 'Grab your early-bird pass now',
    visualDirection: 'Retro 70s vibes with a modern twist. Warm oranges, dusty pinks, grainy textures.',
  },
  {
    projectName: 'UrbanGrid E-Scooter',
    type: 'Web Design',
    objective: 'Design a hero section for a city e-scooter rental landing page',
    background: 'A new urban mobility startup launching in 5 cities. Competing with established players by emphasizing affordability and sustainability.',
    targetAudience: 'Urban commuters ages 20–35 who want eco-friendly last-mile transport',
    keyMessage: 'Skip the traffic. Ride smarter.',
    callToAction: 'Unlock your first ride free',
    visualDirection: 'Electric green and charcoal. Fast, modern, minimal. Motion-inspired.',
  },
  {
    projectName: 'Hearthstone Kids Book',
    type: 'Illustration',
    objective: 'Design a cover illustration for a children\'s bedtime story about a dragon who is afraid of the dark',
    background: 'A self-published picture book for ages 3–7. Warm, funny, and reassuring in tone. The dragon is named Pip.',
    targetAudience: 'Children ages 3–7 and their parents',
    keyMessage: 'Even dragons need a nightlight.',
    callToAction: 'Available at independent bookstores nationwide',
    visualDirection: 'Cozy, whimsical, soft glows. Deep purples, warm golds, and a small flickering flame.',
  },
  {
    projectName: 'Vault Password Manager',
    type: 'UI Design',
    objective: 'Design a dashboard screen showing stored credentials in a secure, clean interface',
    background: 'A B2C password manager targeting non-technical users who find existing tools intimidating. Launched 6 months ago with 10k users.',
    targetAudience: 'Non-technical adults ages 30–55 who manage 20+ passwords',
    keyMessage: 'Security made simple.',
    callToAction: 'Try Vault free for 30 days',
    visualDirection: 'Clean and trustworthy. Deep blues, white space, subtle lock iconography. No clutter.',
  },
  {
    projectName: 'Solstice Skincare',
    type: 'Packaging Design',
    objective: 'Design product label and box for a new SPF 50 sunscreen in a sustainable line',
    background: 'A clean beauty brand pivoting to sustainable packaging. This SPF product is their hero launch item for summer.',
    targetAudience: 'Eco-conscious women ages 25–40 who prioritize clean ingredients',
    keyMessage: 'Sun-proof. Earth-approved.',
    callToAction: 'Shop the full collection at our website',
    visualDirection: 'Natural, premium. Sandy beiges, sun-bleached whites, earthy terracotta accents.',
  },
]

function pickRandomSpec() {
  return SPEC_POOL[Math.floor(Math.random() * SPEC_POOL.length)]
}

module.exports = { getOrCreateRoom, getRoom }
