export const PHOTO_CONTENT = {
  title: 'Photosynthesis & the Carbon Cycle',
  subtitle: 'How plants turn sunlight into life — and feed the planet doing it.',
  source: {
    title: 'OpenStax Biology 2e — Chapter 8',
    excerpt: `Photosynthesis is essential to all life on earth; both plants and animals depend on it. It is the only biological process that captures energy from outer space (sunlight) and converts it into chemical energy in the form of G3P (Glyceraldehyde 3-phosphate) which in turn can be made into sugars and other molecular compounds. Plants use these compounds in all of their metabolic processes; plants do not need to consume other organisms for food because they build all the molecules they need.

The general equation for photosynthesis is:

6 CO₂ + 6 H₂O + (light energy) → C₆H₁₂O₆ + 6 O₂

The process takes place in two stages. The light-dependent reactions, which capture light energy, occur in the thylakoid membranes of the chloroplasts. The light-independent reactions, also called the Calvin cycle, occur in the stroma of the chloroplast, and use the energy carriers from the first stage to assemble carbohydrate molecules from carbon dioxide.`,
  },
  toc: [
    { id: 's1', title: 'What is Photosynthesis?', done: true },
    { id: 's2', title: 'The Two Stages: Light & Dark', done: true },
    { id: 's3', title: 'The Calvin Cycle', done: false, current: true },
    { id: 's4', title: 'Why It Matters: The Carbon Cycle', done: false },
  ],
  sections: [
    {
      id: 's3', heading: 'Learning Objectives', kind: 'objectives',
      items: [
        'Explain the two stages of photosynthesis and where each occurs.',
        'Describe how the Calvin cycle builds glucose from CO₂.',
        'Connect photosynthesis to the broader carbon cycle.',
      ],
    },
    {
      id: 's3-h1', heading: 'How does a leaf turn sunlight into sugar?', kind: 'prose',
      body: `Inside every green leaf, billions of tiny factories called **chloroplasts** are running the same chemistry that powers your favorite song's recording studio — just with photons instead of microphones. Light hits a stack of disc-shaped membranes called **thylakoids**, and an electron gets knocked loose. That single electron, dancing through a chain of proteins, ends up storing the sun's energy as two chemical batteries: **ATP** and **NADPH**.

Think of it like a band's setlist. The light reactions are the loud opening number — fast, dramatic, depending entirely on the spotlight. The Calvin cycle is the long, intricate jam session that follows: it doesn't need light directly, but it absolutely needs the energy the opener generated.`,
      figure: 'leaf-cell',
    },
    {
      id: 's3-quiz1', kind: 'inline-quiz',
      question: 'Where do the **light-dependent reactions** of photosynthesis occur?',
      choices: [
        { id: 'a', text: 'In the stroma of the chloroplast' },
        { id: 'b', text: 'In the thylakoid membranes', correct: true },
        { id: 'c', text: "In the cell's mitochondria" },
        { id: 'd', text: 'In the cytoplasm of the leaf cell' },
      ],
      hint: 'Think about where the chlorophyll pigment lives — it has to be where the light hits.',
    },
    {
      id: 's3-h2', heading: 'The Calvin Cycle: Building Sugar from Air', kind: 'prose',
      body: `The Calvin cycle takes carbon dioxide — yes, the same gas you exhale and the same gas warming the planet — and stitches it into a sugar called **G3P**. From G3P, the plant builds glucose, starches, cellulose, and eventually you (if you ate a salad recently).

The cycle has three phases: **fixation** (CO₂ joins an existing 5-carbon molecule), **reduction** (ATP and NADPH from the light reactions power the chemistry), and **regeneration** (the starting molecule is rebuilt so the cycle can run again). It takes 6 turns of the cycle to make one glucose.`,
      figure: 'calvin-cycle',
    },
    {
      id: 's3-quiz2', kind: 'inline-quiz',
      question: 'How many turns of the Calvin cycle are needed to produce **one molecule of glucose**?',
      choices: [
        { id: 'a', text: '1' },
        { id: 'b', text: '3' },
        { id: 'c', text: '6', correct: true },
        { id: 'd', text: '12' },
      ],
      hint: 'Glucose has 6 carbons — and each turn of the cycle fixes one carbon atom from CO₂.',
    },
    {
      id: 's3-quiz-block', kind: 'quiz-block',
      title: 'Take a quiz to check your understanding',
      questions: [
        { q: 'Which gas do plants take in during photosynthesis?', choices: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], correct: 2 },
        { q: 'The energy carrier produced by the light reactions and used by the Calvin cycle is:', choices: ['Glucose', 'ATP and NADPH', 'CO₂', 'Cellulose'], correct: 1 },
        { q: 'What is the name of the molecule that fixes CO₂ in the Calvin cycle?', choices: ['Chlorophyll', 'RuBisCO', 'Glucose', 'Stomata'], correct: 1 },
        { q: 'Roughly how many gigatons of carbon do photosynthetic organisms remove from the atmosphere each year?', choices: ['~12 Gt', '~120 Gt', '~1,200 Gt', '~12,000 Gt'], correct: 1 },
      ],
    },
  ],
  slides: [
    { title: 'Photosynthesis', subtitle: 'Sunlight → Sugar', kind: 'cover' },
    { title: 'The Equation', body: '6 CO₂ + 6 H₂O + light → C₆H₁₂O₆ + 6 O₂', kind: 'equation' },
    { title: 'Two Stages', body: 'Light-dependent + Light-independent (Calvin cycle)', kind: 'split' },
    { title: 'Inside the Chloroplast', body: 'Thylakoids capture light; the stroma builds sugar.', kind: 'diagram' },
    { title: 'Why It Matters', body: 'Plants remove ~120 Gt of carbon from the atmosphere every year.', kind: 'stat' },
  ],
  audio: {
    title: 'Photosynthesis, in 14 minutes',
    host: 'Hosted by AMI',
    duration: 14 * 60 + 32,
    chapters: [
      { t: 0, label: 'Opening: a leaf is a factory' },
      { t: 95, label: 'The light reactions' },
      { t: 312, label: 'The Calvin cycle' },
      { t: 540, label: 'RuBisCO: the most abundant protein on earth' },
      { t: 720, label: 'Photosynthesis & climate' },
    ],
  },
  mindmap: {
    root: { id: 'root', label: 'Photosynthesis', x: 0, y: 0 },
    nodes: [
      { id: 'n1', parent: 'root', label: 'Light Reactions', x: -260, y: -180 },
      { id: 'n11', parent: 'n1', label: 'Thylakoid', x: -460, y: -240 },
      { id: 'n12', parent: 'n1', label: 'Photosystem II', x: -460, y: -160 },
      { id: 'n13', parent: 'n1', label: 'ATP + NADPH', x: -460, y: -80 },
      { id: 'n2', parent: 'root', label: 'Calvin Cycle', x: 260, y: -180 },
      { id: 'n21', parent: 'n2', label: 'Fixation', x: 460, y: -240 },
      { id: 'n22', parent: 'n2', label: 'Reduction', x: 460, y: -160 },
      { id: 'n23', parent: 'n2', label: 'Regeneration', x: 460, y: -80 },
      { id: 'n3', parent: 'root', label: 'Pigments', x: -260, y: 70 },
      { id: 'n31', parent: 'n3', label: 'Chlorophyll a', x: -460, y: 30 },
      { id: 'n32', parent: 'n3', label: 'Chlorophyll b', x: -460, y: 110 },
      { id: 'n4', parent: 'root', label: 'Carbon Cycle', x: 260, y: 70 },
      { id: 'n41', parent: 'n4', label: '~120 Gt C / yr', x: 460, y: 30 },
      { id: 'n42', parent: 'n4', label: 'Climate impact', x: 460, y: 110 },
      { id: 'n5', parent: 'root', label: 'Inputs / Outputs', x: 0, y: 220 },
      { id: 'n51', parent: 'n5', label: 'CO₂ + H₂O + light', x: -180, y: 290 },
      { id: 'n52', parent: 'n5', label: 'C₆H₁₂O₆ + O₂', x: 180, y: 290 },
    ],
  },
}

export const HISTORY_ITEMS = [
  { id: 'h1', subject: 'Biology', title: 'Photosynthesis & the Carbon Cycle', progress: 0.65, scene: 'leaf' },
  { id: 'h2', subject: 'Economics', title: 'An Overview of Economic Systems', progress: 0.42, scene: 'globe' },
  { id: 'h3', subject: 'History', title: 'Early Human Evolution and Migration', progress: 1.0, scene: 'fire' },
  { id: 'h4', subject: 'Sociology', title: 'What is Sociology?', progress: 0.18, scene: 'city' },
  { id: 'h5', subject: 'Astronomy', title: 'Earth, Sky and the Cosmos', progress: 0.08, scene: 'space' },
  { id: 'h6', subject: 'Chemistry', title: 'Atoms and Molecules', progress: 0.52, scene: 'molecule' },
  { id: 'h7', subject: 'Philosophy', title: 'What is Knowledge? Epistemology 101', progress: 0.0, scene: 'mind' },
  { id: 'h8', subject: 'Physics', title: "Newton's Laws of Motion", progress: 0.74, scene: 'orbit' },
]

export const SUBJECTS = {
  Economics: { color: '#5B8FB9', icon: 'Globe' },
  History: { color: '#C97064', icon: 'Book' },
  Sociology: { color: '#9B7CB6', icon: 'Users' },
  Biology: { color: '#7AAB7E', icon: 'Leaf' },
  Chemistry: { color: '#A45A52', icon: 'Beaker' },
  Astronomy: { color: '#4A6A9C', icon: 'Telescope' },
  Health: { color: '#D17B7B', icon: 'Heart' },
  Philosophy: { color: '#7A6BA8', icon: 'Brain' },
  Physics: { color: '#D88A57', icon: 'Atom' },
  'Computer Science': { color: '#6B7B95', icon: 'Atom' },
}
