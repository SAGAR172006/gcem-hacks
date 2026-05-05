# AMI — Mock Data & Demo Implementation Guide

## Purpose
This file documents everything needed to set up the 4 demo topics (Photosynthesis, Black Holes,
The French Revolution, How Transformers Work) so they load instantly from Supabase — no Gemini
calls needed — and the judges see a fully working product.

---

## Step 1 — Run this SQL in Supabase SQL Editor

Go to your Supabase project → SQL Editor → New Query → paste and run.

### 1A: Create the demo_modules table (public, no auth needed for demo)

```sql
CREATE TABLE IF NOT EXISTS demo_modules (
  id text PRIMARY KEY,
  topic text NOT NULL,
  text_content jsonb NOT NULL,
  slides jsonb NOT NULL DEFAULT '[]',
  mindmap jsonb NOT NULL DEFAULT '[]',
  audio jsonb NOT NULL DEFAULT '{}',
  source jsonb NOT NULL DEFAULT '{}'
);
```

### 1B: Insert Photosynthesis demo module

```sql
INSERT INTO demo_modules (id, topic, text_content, slides, mindmap, source) VALUES (
  'demo-photosynthesis',
  'Photosynthesis',
  '{
    "title": "Photosynthesis & the Carbon Cycle",
    "subtitle": "How plants turn sunlight into life — and feed the planet doing it.",
    "toc": [
      {"id":"s1","title":"What is Photosynthesis?","done":false,"current":true},
      {"id":"s2","title":"The Two Stages: Light & Dark","done":false,"current":false},
      {"id":"s3","title":"The Calvin Cycle","done":false,"current":false},
      {"id":"s4","title":"Why It Matters","done":false,"current":false}
    ],
    "sections": [
      {"id":"obj","kind":"objectives","heading":"What you will learn","items":["Explain the two stages of photosynthesis","Describe how the Calvin cycle builds glucose from CO₂","Connect photosynthesis to the broader carbon cycle"]},
      {"id":"p1","kind":"prose","heading":"What is Photosynthesis?","body":"**Photosynthesis** is the process plants use to convert sunlight into food. Inside every green leaf, billions of tiny organelles called **chloroplasts** capture light and use it to turn carbon dioxide and water into glucose.\n\nThe overall equation is simple: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Plants get to eat, and we get oxygen to breathe. Not a bad deal."},
      {"id":"q1","kind":"inline-quiz","question":"Where does photosynthesis take place inside a plant cell?","hint":"Think about what makes leaves green.","choices":[{"id":"a","text":"Mitochondria","correct":false},{"id":"b","text":"Chloroplasts","correct":true},{"id":"c","text":"Nucleus","correct":false},{"id":"d","text":"Vacuole","correct":false}]},
      {"id":"p2","kind":"prose","heading":"The Two Stages: Light & Dark","body":"Photosynthesis happens in two stages. The **light-dependent reactions** occur in the thylakoid membranes. Light energy splits water molecules, releasing oxygen and creating energy carriers (ATP and NADPH).\n\nThe **light-independent reactions** (Calvin Cycle) happen in the stroma. They use those energy carriers to assemble glucose from CO₂ — no direct sunlight needed."},
      {"id":"q2","kind":"inline-quiz","question":"Which stage of photosynthesis releases oxygen as a byproduct?","hint":"Oxygen comes from splitting water molecules.","choices":[{"id":"a","text":"Calvin Cycle","correct":false},{"id":"b","text":"Light-dependent reactions","correct":true},{"id":"c","text":"Glycolysis","correct":false},{"id":"d","text":"Fermentation","correct":false}]},
      {"id":"p3","kind":"prose","heading":"The Calvin Cycle","body":"The Calvin Cycle (also called the **dark reactions**) runs in the stroma of the chloroplast. It has three phases: **fixation** (CO₂ is attached to a 5-carbon molecule called RuBP), **reduction** (ATP and NADPH convert the molecule into G3P sugar), and **regeneration** (RuBP is rebuilt to keep the cycle going).\n\nSix turns of the cycle produce one molecule of glucose — the fuel for nearly all life on Earth."},
      {"id":"q3","kind":"inline-quiz","question":"How many turns of the Calvin cycle are needed to produce one glucose molecule?","hint":"Glucose has 6 carbons, and each turn fixes one CO₂.","choices":[{"id":"a","text":"1","correct":false},{"id":"b","text":"3","correct":false},{"id":"c","text":"6","correct":true},{"id":"d","text":"12","correct":false}]},
      {"id":"p4","kind":"prose","heading":"Why It Matters","body":"Photosynthesis removes roughly **120 billion tonnes** of carbon from the atmosphere every year. Without it, CO₂ would accumulate, temperatures would spike, and almost no life as we know it could survive.\n\nEvery bite of food you eat traces back to photosynthesis — whether you eat a salad or a steak, the energy originated as sunlight captured by a plant."},
      {"id":"q4","kind":"inline-quiz","question":"What happens to CO₂ during the fixation stage of the Calvin Cycle?","hint":"Think about what fixation means — attaching something to something else.","choices":[{"id":"a","text":"It is released as a waste product","correct":false},{"id":"b","text":"It is attached to RuBP to start building sugar","correct":true},{"id":"c","text":"It is converted into oxygen","correct":false},{"id":"d","text":"It is stored in the vacuole","correct":false}]}
    ]
  }',
  '[
    {"id":"slide_1","kind":"cover","title":"Photosynthesis","subtitle":"How plants turn sunlight into food","narration":"Welcome to photosynthesis — the process that powers almost all life on Earth."},
    {"id":"slide_2","kind":"bullet","title":"The Big Picture","points":["Plants capture sunlight in chloroplasts","CO₂ + H₂O + Light → Glucose + O₂","Two main stages: light and dark reactions","Powers nearly all food chains on Earth"],"narration":"Let us start with the overall picture of what photosynthesis achieves.","imageUrl":"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800"},
    {"id":"slide_3","kind":"split","title":"Two Stages","cards":[{"label":"Stage 1","title":"Light Reactions","body":"Occur in thylakoid membranes. Capture light, split water, produce ATP and NADPH."},{"label":"Stage 2","title":"Calvin Cycle","body":"Occurs in the stroma. Uses ATP and NADPH to fix CO₂ into glucose."}],"narration":"Photosynthesis has two distinct stages that work together like a relay race.","imageUrl":"https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800"},
    {"id":"slide_4","kind":"equation","title":"The Photosynthesis Equation","left":"6CO₂ + 6H₂O + Light","operator":"→","right":"C₆H₁₂O₆ + 6O₂","narration":"This elegant equation summarises everything — inputs on the left, outputs on the right.","imageUrl":"https://images.unsplash.com/photo-1580196969807-cc6de06c05be?w=800"},
    {"id":"slide_5","kind":"bullet","title":"The Calvin Cycle","points":["Fixation: CO₂ joins RuBP","Reduction: ATP powers sugar building","Regeneration: RuBP is rebuilt","6 turns = 1 glucose molecule"],"narration":"The Calvin Cycle is where the actual food-making happens — a beautiful three-step loop.","imageUrl":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"},
    {"id":"slide_6","kind":"stat","title":"Global Impact","stat":"120 Gt","caption":"Carbon removed from the atmosphere by photosynthesis every single year","narration":"Photosynthesis is our planet biggest carbon capture system — and it is entirely free.","imageUrl":"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800"}
  ]',
  '[
    {"id":"root","label":"Photosynthesis","parent":null,"x":0,"y":0},
    {"id":"n1","label":"Light Reactions","parent":"root","x":-240,"y":-150},
    {"id":"n1a","label":"Thylakoid","parent":"n1","x":-370,"y":-90},
    {"id":"n1b","label":"ATP & NADPH","parent":"n1","x":-370,"y":-210},
    {"id":"n2","label":"Calvin Cycle","parent":"root","x":240,"y":-150},
    {"id":"n2a","label":"CO₂ Fixation","parent":"n2","x":370,"y":-90},
    {"id":"n2b","label":"Glucose","parent":"n2","x":370,"y":-210},
    {"id":"n3","label":"Chloroplast","parent":"root","x":-240,"y":150},
    {"id":"n3a","label":"Stroma","parent":"n3","x":-370,"y":90},
    {"id":"n3b","label":"Thylakoids","parent":"n3","x":-370,"y":210},
    {"id":"n4","label":"Carbon Cycle","parent":"root","x":240,"y":150},
    {"id":"n4a","label":"120 Gt/year","parent":"n4","x":370,"y":90},
    {"id":"n4b","label":"Oxygen release","parent":"n4","x":370,"y":210}
  ]',
  '{"topic":"Photosynthesis","sourceTitle":"OpenStax Biology 2e","sourceExcerpt":"Photosynthesis is essential to all life on earth. It is the only biological process that captures energy from outer space (sunlight) and converts it into chemical energy in the form of glucose. The general equation is: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. The process occurs in two stages inside chloroplasts.","sourceUrl":null}'
) ON CONFLICT (id) DO UPDATE SET text_content = EXCLUDED.text_content, slides = EXCLUDED.slides, mindmap = EXCLUDED.mindmap;
```

### 1C: Insert Black Holes demo module

```sql
INSERT INTO demo_modules (id, topic, text_content, slides, mindmap, source) VALUES (
  'demo-black-holes',
  'Black Holes',
  '{
    "title": "Black Holes: The Universe Most Extreme Objects",
    "subtitle": "Where gravity wins over everything — including light.",
    "toc": [
      {"id":"s1","title":"What is a Black Hole?","done":false,"current":true},
      {"id":"s2","title":"How Black Holes Form","done":false,"current":false},
      {"id":"s3","title":"The Event Horizon","done":false,"current":false},
      {"id":"s4","title":"Black Holes & Time","done":false,"current":false}
    ],
    "sections": [
      {"id":"obj","kind":"objectives","heading":"What you will learn","items":["Define what a black hole is and why nothing can escape it","Explain how stellar black holes form","Describe the event horizon and its significance","Understand how black holes affect time and space"]},
      {"id":"p1","kind":"prose","heading":"What is a Black Hole?","body":"A **black hole** is a region of space where gravity is so extreme that nothing — not even light — can escape once it crosses the boundary. This boundary is called the **event horizon**.\n\nBlack holes are not empty — they contain an enormous amount of mass squeezed into an incredibly small space called the **singularity**. At the singularity, our current laws of physics break down completely."},
      {"id":"q1","kind":"inline-quiz","question":"Why can nothing escape a black hole once it crosses the event horizon?","hint":"Think about what the event horizon represents.","choices":[{"id":"a","text":"Because black holes are made of antimatter","correct":false},{"id":"b","text":"Because gravity exceeds the speed of light at that point","correct":true},{"id":"c","text":"Because black holes are invisible","correct":false},{"id":"d","text":"Because they are in deep space","correct":false}]},
      {"id":"p2","kind":"prose","heading":"How Black Holes Form","body":"Most black holes form when a **massive star** (at least 20× the mass of our Sun) runs out of nuclear fuel. Without the outward pressure of fusion to balance gravity, the star collapses inward catastrophically in a **supernova** explosion.\n\nThe core that remains becomes so dense it collapses into a singularity. The resulting black hole can range from a few kilometres across (for a stellar black hole) to billions of kilometres (for a supermassive black hole at the centre of a galaxy)."},
      {"id":"q2","kind":"inline-quiz","question":"What triggers the formation of a stellar black hole?","hint":"What was keeping the star from collapsing before?","choices":[{"id":"a","text":"A planet colliding with the star","correct":false},{"id":"b","text":"The star running out of nuclear fuel","correct":true},{"id":"c","text":"The star cooling down over millions of years","correct":false},{"id":"d","text":"Two neutron stars merging","correct":false}]},
      {"id":"p3","kind":"prose","heading":"The Event Horizon","body":"The **event horizon** is the point of no return. It is not a physical surface — if you fell through it, you would not feel anything special in that moment. But you could never send a signal back to the outside universe.\n\nThe radius of the event horizon is called the **Schwarzschild radius**. For an object of the Sun mass, this would be about 3 km. For Earth, it would be the size of a marble."},
      {"id":"q3","kind":"inline-quiz","question":"What is the Schwarzschild radius?","hint":"It defines the size of something specific.","choices":[{"id":"a","text":"The distance from a black hole where time stops","correct":false},{"id":"b","text":"The radius of the event horizon for a given mass","correct":true},{"id":"c","text":"The size of the singularity at the centre","correct":false},{"id":"d","text":"The distance light travels around a black hole","correct":false}]},
      {"id":"p4","kind":"prose","heading":"Black Holes & Time","body":"Near a black hole, **time dilation** becomes extreme. According to Einstein general relativity, time passes slower in stronger gravitational fields. Near the event horizon, time slows to a crawl relative to a distant observer.\n\nIf you watched a friend fall into a black hole, you would see them slow down and freeze at the event horizon — never quite crossing it. From their perspective, they cross it instantly and continue falling toward the singularity."},
      {"id":"q4","kind":"inline-quiz","question":"According to general relativity, what happens to time near a black hole?","hint":"Think about gravitational time dilation.","choices":[{"id":"a","text":"Time speeds up dramatically","correct":false},{"id":"b","text":"Time passes slower in stronger gravity","correct":true},{"id":"c","text":"Time reverses direction","correct":false},{"id":"d","text":"Time is unaffected by gravity","correct":false}]}
    ]
  }',
  '[
    {"id":"slide_1","kind":"cover","title":"Black Holes","subtitle":"Where gravity wins over everything — including light","narration":"Today we explore the most extreme objects in the known universe."},
    {"id":"slide_2","kind":"bullet","title":"What is a Black Hole?","points":["Region where gravity overwhelms everything","Nothing escapes — not even light","Contains a singularity at its centre","Bounded by the event horizon"],"narration":"A black hole is defined by its event horizon — the point of no return.","imageUrl":"https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800"},
    {"id":"slide_3","kind":"split","title":"Two Types of Black Holes","cards":[{"label":"Stellar","title":"Stellar Black Holes","body":"Formed from collapsed massive stars. Typically 5–100 solar masses. Scattered throughout galaxies."},{"label":"Supermassive","title":"Supermassive Black Holes","body":"Millions to billions of solar masses. Found at the centre of most galaxies including the Milky Way."}],"narration":"Black holes come in dramatically different sizes — from city-sized to solar-system-sized.","imageUrl":"https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800"},
    {"id":"slide_4","kind":"stat","title":"The Milky Way Black Hole","stat":"4M☉","caption":"Mass of Sagittarius A* — the supermassive black hole at our galaxy centre","narration":"Right at the heart of our galaxy sits a black hole four million times the mass of our Sun.","imageUrl":"https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800"},
    {"id":"slide_5","kind":"bullet","title":"Time Near a Black Hole","points":["Time slows in stronger gravity (time dilation)","Near event horizon: time nearly stops","Falling in feels normal from inside","External observers see you freeze at horizon"],"narration":"Black holes bend not just space but time itself — a prediction confirmed by GPS satellites daily.","imageUrl":"https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800"},
    {"id":"slide_6","kind":"stat","title":"Escape Velocity","stat":"c","caption":"Speed needed to escape a black hole event horizon — the speed of light itself","narration":"At the event horizon, you would need to travel at the speed of light just to stay still.","imageUrl":"https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800"}
  ]',
  '[
    {"id":"root","label":"Black Holes","parent":null,"x":0,"y":0},
    {"id":"n1","label":"Formation","parent":"root","x":-240,"y":-150},
    {"id":"n1a","label":"Supernova","parent":"n1","x":-370,"y":-90},
    {"id":"n1b","label":"Stellar Collapse","parent":"n1","x":-370,"y":-210},
    {"id":"n2","label":"Event Horizon","parent":"root","x":240,"y":-150},
    {"id":"n2a","label":"Point of No Return","parent":"n2","x":370,"y":-90},
    {"id":"n2b","label":"Schwarzschild Radius","parent":"n2","x":370,"y":-210},
    {"id":"n3","label":"Types","parent":"root","x":-240,"y":150},
    {"id":"n3a","label":"Stellar","parent":"n3","x":-370,"y":90},
    {"id":"n3b","label":"Supermassive","parent":"n3","x":-370,"y":210},
    {"id":"n4","label":"Space-Time","parent":"root","x":240,"y":150},
    {"id":"n4a","label":"Time Dilation","parent":"n4","x":370,"y":90},
    {"id":"n4b","label":"Singularity","parent":"n4","x":370,"y":210}
  ]',
  '{"topic":"Black Holes","sourceTitle":"NASA Science — Black Holes","sourceExcerpt":"A black hole is a place in space where gravity pulls so much that even light cannot escape. The gravity is so strong because matter has been squeezed into a tiny space. This can happen when a star is dying. Because no light can escape, black holes are invisible. Space telescopes with special tools can help find black holes.","sourceUrl":"https://science.nasa.gov/universe/black-holes/"}'
) ON CONFLICT (id) DO UPDATE SET text_content = EXCLUDED.text_content, slides = EXCLUDED.slides, mindmap = EXCLUDED.mindmap;
```

### 1D: Insert French Revolution demo module

```sql
INSERT INTO demo_modules (id, topic, text_content, slides, mindmap, source) VALUES (
  'demo-french-revolution',
  'The French Revolution',
  '{
    "title": "The French Revolution: Liberty, Equality, Chaos",
    "subtitle": "How a bankrupt kingdom became the blueprint for modern democracy.",
    "toc": [
      {"id":"s1","title":"Causes of the Revolution","done":false,"current":true},
      {"id":"s2","title":"The Fall of the Monarchy","done":false,"current":false},
      {"id":"s3","title":"The Reign of Terror","done":false,"current":false},
      {"id":"s4","title":"Napoleon and the Legacy","done":false,"current":false}
    ],
    "sections": [
      {"id":"obj","kind":"objectives","heading":"What you will learn","items":["Identify the key causes of the French Revolution","Explain how the monarchy collapsed","Describe the Reign of Terror and Robespierre role","Assess the long-term legacy of the Revolution"]},
      {"id":"p1","kind":"prose","heading":"Causes of the Revolution","body":"By 1789, France was essentially **bankrupt**. Two decades of wars (including funding the American Revolution) had emptied the treasury. Meanwhile, the vast majority of French people — the **Third Estate** — paid nearly all the taxes while the nobility and clergy paid almost none.\n\nA series of terrible harvests made bread unaffordable for ordinary people. When King Louis XVI called the Estates-General to solve the financial crisis, the Third Estate seized the moment to demand political reform. The explosion had been building for decades."},
      {"id":"q1","kind":"inline-quiz","question":"Which group paid the majority of taxes in pre-revolutionary France?","hint":"Think about who had the least political power.","choices":[{"id":"a","text":"The nobility","correct":false},{"id":"b","text":"The clergy","correct":false},{"id":"c","text":"The Third Estate (commoners)","correct":true},{"id":"d","text":"The royal family","correct":false}]},
      {"id":"p2","kind":"prose","heading":"The Fall of the Monarchy","body":"On 14 July 1789, Parisian crowds stormed the **Bastille** prison — a symbol of royal tyranny — and the Revolution began in earnest. The National Assembly produced the **Declaration of the Rights of Man**, asserting liberty and equality for all citizens.\n\nBy 1792, France was at war with Austria and Prussia. Louis XVI was found to have been secretly negotiating with France enemies. He was put on trial for treason and **executed by guillotine** on 21 January 1793. The monarchy was over."},
      {"id":"q2","kind":"inline-quiz","question":"What did the storming of the Bastille on 14 July 1789 symbolise?","hint":"The Bastille was a prison that represented something about royal power.","choices":[{"id":"a","text":"The end of Napoleon rule","correct":false},{"id":"b","text":"The beginning of the Reign of Terror","correct":false},{"id":"c","text":"The start of the Revolution and rejection of royal tyranny","correct":true},{"id":"d","text":"France declaring war on Britain","correct":false}]},
      {"id":"p3","kind":"prose","heading":"The Reign of Terror","body":"With enemies inside and outside France, the Committee of Public Safety under **Maximilien Robespierre** launched the Reign of Terror (1793–1794). Over 17,000 people were officially executed — and many more died in prison or without trial.\n\nRobespierre justified it as necessary to protect the Revolution. But when the Terror threatened even his own allies, the National Convention turned on him. He was arrested and guillotined in July 1794 — a victim of the very machine he had built."},
      {"id":"q3","kind":"inline-quiz","question":"Who led the Committee of Public Safety during the Reign of Terror?","hint":"He was later executed by the same methods he used on others.","choices":[{"id":"a","text":"Napoleon Bonaparte","correct":false},{"id":"b","text":"Louis XVI","correct":false},{"id":"c","text":"Maximilien Robespierre","correct":true},{"id":"d","text":"Marie Antoinette","correct":false}]},
      {"id":"p4","kind":"prose","heading":"Napoleon and the Legacy","body":"Out of the chaos rose **Napoleon Bonaparte**, who seized power in 1799 and eventually crowned himself Emperor. He preserved many Revolutionary ideals — the Napoleonic Code enshrined legal equality — while dismantling others like democratic government.\n\nThe Revolution legacy was enormous: it spread the ideas of **liberty, equality, and popular sovereignty** across Europe and inspired revolutions for the next two centuries. The guillotine, ironically, had severed the old world from the new."},
      {"id":"q4","kind":"inline-quiz","question":"What legal achievement of Napoleon preserved key Revolutionary ideals?","hint":"It became a model for civil law in dozens of countries.","choices":[{"id":"a","text":"The Magna Carta","correct":false},{"id":"b","text":"The Napoleonic Code","correct":true},{"id":"c","text":"The Declaration of Independence","correct":false},{"id":"d","text":"The Treaty of Versailles","correct":false}]}
    ]
  }',
  '[
    {"id":"slide_1","kind":"cover","title":"The French Revolution","subtitle":"Liberty, Equality, and the birth of the modern world","narration":"The French Revolution reshaped politics, society, and ideas across the globe."},
    {"id":"slide_2","kind":"bullet","title":"Why It Happened","points":["France was bankrupt from wars","Third Estate paid all taxes, had no power","Bad harvests caused bread shortages","Estates-General meeting sparked the explosion"],"narration":"The Revolution did not come from nowhere — it was the result of decades of inequality and financial crisis.","imageUrl":"https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800"},
    {"id":"slide_3","kind":"split","title":"Two Turning Points","cards":[{"label":"1789","title":"Storming the Bastille","body":"July 14, 1789. The symbolic start. A Parisian crowd seized the royal prison, marking the end of absolute monarchy."},{"label":"1793","title":"Execution of Louis XVI","body":"The King was guillotined for treason after secret letters to foreign enemies were discovered. The republic had begun."}],"narration":"Two moments defined the Revolution — one tore down the old order, the other made the break permanent.","imageUrl":"https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800"},
    {"id":"slide_4","kind":"stat","title":"The Reign of Terror","stat":"17,000","caption":"People officially executed during the Reign of Terror between 1793 and 1794","narration":"The Revolution turned on itself — thousands were killed in the name of protecting revolutionary ideals.","imageUrl":"https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800"},
    {"id":"slide_5","kind":"bullet","title":"The Legacy","points":["Spread ideas of liberty and equality worldwide","Inspired revolutions across Europe and Latin America","Napoleonic Code became foundation of modern civil law","Proved popular sovereignty could topple monarchies"],"narration":"The Revolution echoes in every modern democracy — the idea that governments must answer to the people.","imageUrl":"https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"},
    {"id":"slide_6","kind":"stat","title":"Global Reach","stat":"70+","caption":"Countries whose legal systems are based on the Napoleonic Code introduced after the Revolution","narration":"The ideas born in Paris in 1789 now underpin the legal systems of over 70 nations.","imageUrl":"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800"}
  ]',
  '[
    {"id":"root","label":"French Revolution","parent":null,"x":0,"y":0},
    {"id":"n1","label":"Causes","parent":"root","x":-240,"y":-150},
    {"id":"n1a","label":"Bankruptcy","parent":"n1","x":-370,"y":-90},
    {"id":"n1b","label":"Tax Inequality","parent":"n1","x":-370,"y":-210},
    {"id":"n2","label":"Key Events","parent":"root","x":240,"y":-150},
    {"id":"n2a","label":"Bastille 1789","parent":"n2","x":370,"y":-90},
    {"id":"n2b","label":"Louis XVI Executed","parent":"n2","x":370,"y":-210},
    {"id":"n3","label":"Terror","parent":"root","x":-240,"y":150},
    {"id":"n3a","label":"Robespierre","parent":"n3","x":-370,"y":90},
    {"id":"n3b","label":"17,000 Killed","parent":"n3","x":-370,"y":210},
    {"id":"n4","label":"Legacy","parent":"root","x":240,"y":150},
    {"id":"n4a","label":"Napoleon","parent":"n4","x":370,"y":90},
    {"id":"n4b","label":"Napoleonic Code","parent":"n4","x":370,"y":210}
  ]',
  '{"topic":"The French Revolution","sourceTitle":"Encyclopaedia Britannica — French Revolution","sourceExcerpt":"The French Revolution was a period of radical political and societal change in France that began with the Estates General of 1789 and ended with the formation of the French Consulate in November 1799. Many of its ideas are considered fundamental principles of liberal democracy.","sourceUrl":null}'
) ON CONFLICT (id) DO UPDATE SET text_content = EXCLUDED.text_content, slides = EXCLUDED.slides, mindmap = EXCLUDED.mindmap;
```

### 1E: Insert How Transformers Work demo module

```sql
INSERT INTO demo_modules (id, topic, text_content, slides, mindmap, source) VALUES (
  'demo-transformers',
  'How Transformers Work',
  '{
    "title": "How Transformers Work: The Architecture Behind AI",
    "subtitle": "The attention mechanism that changed everything — from BERT to ChatGPT.",
    "toc": [
      {"id":"s1","title":"What is a Transformer?","done":false,"current":true},
      {"id":"s2","title":"Attention Mechanism","done":false,"current":false},
      {"id":"s3","title":"Encoder and Decoder","done":false,"current":false},
      {"id":"s4","title":"Why Transformers Won","done":false,"current":false}
    ],
    "sections": [
      {"id":"obj","kind":"objectives","heading":"What you will learn","items":["Explain what a Transformer model is and why it was revolutionary","Describe how the self-attention mechanism works","Distinguish between encoder and decoder architectures","Understand why Transformers replaced earlier RNN models"]},
      {"id":"p1","kind":"prose","heading":"What is a Transformer?","body":"A **Transformer** is a type of neural network architecture introduced in the 2017 paper *Attention Is All You Need* by researchers at Google. It was originally designed for language translation but became the foundation for almost every major AI system you use today — ChatGPT, Gemini, Copilot, and DALL-E.\n\nThe key insight was replacing recurrent processing (reading words one at a time) with **self-attention** — a mechanism that lets the model look at all words simultaneously and figure out which ones are relevant to each other."},
      {"id":"q1","kind":"inline-quiz","question":"What was the original task Transformers were designed to solve?","hint":"Think about translating between languages.","choices":[{"id":"a","text":"Image recognition","correct":false},{"id":"b","text":"Language translation","correct":true},{"id":"c","text":"Playing chess","correct":false},{"id":"d","text":"Speech recognition","correct":false}]},
      {"id":"p2","kind":"prose","heading":"The Attention Mechanism","body":"**Self-attention** allows every word in a sentence to look at every other word and compute a score for how relevant they are to each other. For the sentence *The cat sat on the mat because it was tired*, the model learns that *it* refers to *cat* — not *mat* — by computing attention scores.\n\nEach word is represented as three vectors: **Query** (what am I looking for?), **Key** (what do I contain?), and **Value** (what should I pass forward?). The dot product of Query and Key determines the attention weight; the model attends more to relevant words and less to irrelevant ones."},
      {"id":"q2","kind":"inline-quiz","question":"In the attention mechanism, what does the Query vector represent?","hint":"Think of it as a search query in a database.","choices":[{"id":"a","text":"The final output of the model","correct":false},{"id":"b","text":"What the current word is looking for in other words","correct":true},{"id":"c","text":"The memory of previous sentences","correct":false},{"id":"d","text":"The position of the word in the sentence","correct":false}]},
      {"id":"p3","kind":"prose","heading":"Encoder and Decoder","body":"The original Transformer has two halves. The **encoder** reads the input (e.g. a French sentence) and builds a rich contextual representation of it. The **decoder** generates the output (e.g. the English translation) one token at a time, attending to both the encoder output and its own previous outputs.\n\nModels like **BERT** use only the encoder (great for understanding text). Models like **GPT** use only the decoder (great for generating text). Models like the original translation Transformer use both."},
      {"id":"q3","kind":"inline-quiz","question":"Which part of the Transformer architecture does GPT primarily use?","hint":"GPT generates text — it produces output one token at a time.","choices":[{"id":"a","text":"Only the encoder","correct":false},{"id":"b","text":"Both encoder and decoder equally","correct":false},{"id":"c","text":"Only the decoder","correct":true},{"id":"d","text":"Neither — GPT uses a recurrent network","correct":false}]},
      {"id":"p4","kind":"prose","heading":"Why Transformers Won","body":"Before Transformers, the dominant approach was **Recurrent Neural Networks (RNNs)**, which processed text sequentially — word by word. This made them slow to train and bad at capturing long-range dependencies (e.g. connecting a pronoun to its referent 50 words earlier).\n\nTransformers process all words in **parallel**, making them massively faster to train on GPUs. Their ability to scale with more data and compute led directly to the large language model revolution. GPT-4, Gemini, Claude — all are Transformers."},
      {"id":"q4","kind":"inline-quiz","question":"What was the main advantage of Transformers over RNNs?","hint":"Think about how they process input differently.","choices":[{"id":"a","text":"They use less memory","correct":false},{"id":"b","text":"They process all tokens in parallel instead of sequentially","correct":true},{"id":"c","text":"They require no training data","correct":false},{"id":"d","text":"They only work on short sentences","correct":false}]}
    ]
  }',
  '[
    {"id":"slide_1","kind":"cover","title":"How Transformers Work","subtitle":"The architecture powering ChatGPT, Gemini, and every modern AI","narration":"Transformers are the engine behind the AI revolution — let us understand how they actually work."},
    {"id":"slide_2","kind":"bullet","title":"What Makes Transformers Special?","points":["Introduced in Attention Is All You Need (2017)","Process all words simultaneously — not one at a time","Self-attention lets words relate to all other words","Foundation for GPT, BERT, Gemini, Claude"],"narration":"The 2017 paper that introduced Transformers is one of the most influential in AI history.","imageUrl":"https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800"},
    {"id":"slide_3","kind":"split","title":"Query, Key, Value","cards":[{"label":"Query + Key","title":"Attention Scores","body":"Each word asks: how relevant are you to me? The dot product of Query and Key gives an attention score."},{"label":"Value","title":"Output Weighting","body":"High-scoring words contribute more to the output. The model learns to focus on what matters."}],"narration":"The QKV mechanism is the mathematical heart of self-attention — elegant and powerful.","imageUrl":"https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800"},
    {"id":"slide_4","kind":"split","title":"Encoder vs Decoder","cards":[{"label":"Encoder (BERT)","title":"Understanding Text","body":"Reads entire input at once. Builds rich contextual representation. Used for classification, Q&A, search."},{"label":"Decoder (GPT)","title":"Generating Text","body":"Generates output one token at a time. Each token attends to all previous ones. Used for chatbots, code, writing."}],"narration":"The encoder understands; the decoder creates. Most modern AI uses one or both halves.","imageUrl":"https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800"},
    {"id":"slide_5","kind":"bullet","title":"Why Transformers Beat RNNs","points":["RNNs processed words one-by-one: slow","Transformers process all words in parallel: fast","Better at long-range dependencies (pronoun → referent)","Scale with compute — bigger = smarter"],"narration":"Parallelism is the killer feature — it is why Transformers can be trained on billions of documents.","imageUrl":"https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"},
    {"id":"slide_6","kind":"stat","title":"The Scaling Law","stat":"1T+","caption":"Parameters in the largest Transformer models — and performance keeps improving with scale","narration":"The most remarkable thing about Transformers is that they just keep getting better as you make them bigger.","imageUrl":"https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=800"}
  ]',
  '[
    {"id":"root","label":"Transformers","parent":null,"x":0,"y":0},
    {"id":"n1","label":"Self-Attention","parent":"root","x":-240,"y":-150},
    {"id":"n1a","label":"Query / Key / Value","parent":"n1","x":-370,"y":-90},
    {"id":"n1b","label":"Attention Scores","parent":"n1","x":-370,"y":-210},
    {"id":"n2","label":"Architecture","parent":"root","x":240,"y":-150},
    {"id":"n2a","label":"Encoder (BERT)","parent":"n2","x":370,"y":-90},
    {"id":"n2b","label":"Decoder (GPT)","parent":"n2","x":370,"y":-210},
    {"id":"n3","label":"vs RNNs","parent":"root","x":-240,"y":150},
    {"id":"n3a","label":"Sequential → Parallel","parent":"n3","x":-370,"y":90},
    {"id":"n3b","label":"Long-range context","parent":"n3","x":-370,"y":210},
    {"id":"n4","label":"Applications","parent":"root","x":240,"y":150},
    {"id":"n4a","label":"ChatGPT / Gemini","parent":"n4","x":370,"y":90},
    {"id":"n4b","label":"Vision & Code AI","parent":"n4","x":370,"y":210}
  ]',
  '{"topic":"How Transformers Work","sourceTitle":"Attention Is All You Need — Vaswani et al. (2017)","sourceExcerpt":"We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. The model achieves superior quality while being more parallelizable and requiring significantly less time to train.","sourceUrl":"https://arxiv.org/abs/1706.03762"}'
) ON CONFLICT (id) DO UPDATE SET text_content = EXCLUDED.text_content, slides = EXCLUDED.slides, mindmap = EXCLUDED.mindmap;
```

---

## Step 2 — Backend: New demo endpoint (no auth required)

Add to `ami/backend/src/routers/demo.ts`:

```typescript
import { Router } from 'express';
import { supabase } from '../services/supabase';

export const demoRouter = Router();

// Public endpoint — no auth required
demoRouter.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('demo_modules')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error || !data) return res.status(404).json({ error: 'Demo module not found' });
    res.json({
      id: data.id,
      topic: data.topic,
      textContent: data.text_content,
      slides: data.slides,
      mindmap: data.mindmap,
      audio: data.audio || { title: '', script: '', chapters: [] },
      source: data.source,
      status: 'complete',
      progress: 0,
      fromUpload: false,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
```

In `ami/backend/src/index.ts`, add:
```typescript
import { demoRouter } from './routers/demo';
app.use('/api/demo', demoRouter);
```

---

## Step 3 — Frontend: api.js — add getDemoModule

In `ami/frontend/src/services/api.js`, add to the `api` object:
```js
getDemoModule: (id) => req('GET', `/demo/${id}`),
```

---

## Step 4 — Frontend: DashboardPage.jsx — wire up suggested topics

The 4 suggested topic buttons already exist. Change them to call a new `onDemoLoad` prop
instead of triggering the full generation pipeline:

```jsx
// Map topic label → demo module ID
const DEMO_IDS = {
  'Photosynthesis': 'demo-photosynthesis',
  'Black Holes': 'demo-black-holes',
  'The French Revolution': 'demo-french-revolution',
  'How Transformers Work': 'demo-transformers',
}

// In the button onClick:
onClick={() => {
  const demoId = DEMO_IDS[s]
  if (demoId) onDemoLoad(demoId)
  else { setQuery(s); onSearch(s) }
}}
```

In `App.jsx`, add `onDemoLoad` handler:
```jsx
const onDemoLoad = async (demoId) => {
  try {
    const mod = await api.getDemoModule(demoId)
    setCurrentModule(mod)
    setRoute('hub')
  } catch (err) {
    alert(err.message)
  }
}
```
Pass it as prop: `<DashboardPage onDemoLoad={onDemoLoad} .../>`

---

## Step 5 — Slides Agent: simpler prompt (your approach)

Replace `ami/backend/src/agents/slidesAgent.ts` with:

```typescript
import { SourceContent, TextContent, Persona, Slide } from '../types';
import { callGeminiJSON } from '../services/gemini';
import { imageAgent } from './imageAgent';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function generateSlides(
  source: SourceContent,
  textContent: TextContent,
  persona: Persona
): Promise<Slide[]> {
  const prompt = [
    'You are a presentation agent for an educational app called AMI.',
    'Summarize the following topic into exactly 6 slides.',
    'Topic: ' + source.topic,
    'Student level: ' + persona.grade,
    '',
    'Content to base slides on:',
    textContent.toc.map((t, i) => (i + 1) + '. ' + t.title).join('\n'),
    '',
    'Output STRICTLY as a raw JSON array — no markdown, no code blocks, no explanation.',
    'Each slide object must have:',
    '  "slideNumber": 1-6 (integer)',
    '  "kind": one of "cover" | "bullet" | "stat" | "split"',
    '  "title": string',
    '  "narration": string (1-2 sentence spoken narration)',
    '  "imageSearchKeyword": one specific concrete word for Unsplash (e.g. "photosynthesis" "galaxy" "revolution")',
    '',
    'Additional fields by kind:',
    '  cover: "subtitle": string',
    '  bullet: "points": array of exactly 4 short strings',
    '  stat: "stat": striking number/percentage string, "caption": string',
    '  split: "cards": [{label, title, body}, {label, title, body}]',
    '',
    'Rules: slide 1 must be "cover". No two consecutive slides the same kind. Return raw JSON array only.',
  ].join('\n');

  const rawSlides = await callGeminiJSON<any[]>(prompt);

  // Add 1s delay before fetching images to avoid rate limits
  await sleep(1000);

  // Fetch Unsplash images one at a time with small delays (avoids burst)
  const slides: Slide[] = [];
  for (const slide of rawSlides) {
    const keyword = slide.imageSearchKeyword || source.topic;
    const imageUrl = slide.slideNumber === 1 ? null : await imageAgent(keyword);
    if (slide.slideNumber !== 1) await sleep(300); // small gap between image fetches
    slides.push({
      id: 'slide_' + slide.slideNumber,
      kind: slide.kind || 'bullet',
      title: slide.title,
      subtitle: slide.subtitle,
      points: slide.points,
      stat: slide.stat,
      caption: slide.caption,
      cards: slide.cards,
      narration: slide.narration,
      imageUrl,
    } as Slide);
  }

  return slides;
}
```

---

## Step 6 — Audio Pillar: Web Speech API (frontend only)

Replace the mock audio player in `LearningHub.jsx` `AudioPillar` component.
The component receives `liveModule` and uses `window.speechSynthesis` to read the script.

Key implementation:
```jsx
function AudioPillar({ audioContent }) {
  const [playing, setPlaying] = useState(false)
  const uttRef = useRef(null)

  const script = audioContent?.script || ''
  const chapters = audioContent?.chapters || []

  const speak = () => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    // Strip [CHAPTER:...] markers for clean speech
    const cleanText = script.replace(/\[CHAPTER:[^\]]+\]/g, '').trim()
    const utt = new SpeechSynthesisUtterance(cleanText)
    utt.rate = 0.95
    utt.pitch = 1.0
    utt.onend = () => setPlaying(false)
    uttRef.current = utt
    window.speechSynthesis.speak(utt)
    setPlaying(true)
  }

  const pause = () => {
    window.speechSynthesis.pause()
    setPlaying(false)
  }

  const resume = () => {
    window.speechSynthesis.resume()
    setPlaying(true)
  }

  const stop = () => {
    window.speechSynthesis.cancel()
    setPlaying(false)
  }

  useEffect(() => {
    return () => window.speechSynthesis?.cancel() // cleanup on unmount
  }, [])

  // ... render player UI using playing state
}
```

---

## Summary of Gemini Call Reduction

| Before | After |
|--------|-------|
| Phase 1: 7 calls (TOC + obj + 4 sections + title) | Phase 1: 7 calls (unchanged) |
| Phase 2: 3 calls (slides + mindmap + audio) | Phase 2: 1 call (slides only) |
| **Total: 10 calls** | **Total: 8 calls** |
| Demo topics: 10 calls each | **Demo topics: 0 calls (Supabase)** |

The demo topics alone save 40 Gemini calls that would have been wasted on repeated generation.

---

## Supabase RLS Note
The `demo_modules` table should have **no RLS** (public read access), since guests should be
able to click demo topics without logging in. Alternatively, set:
```sql
ALTER TABLE demo_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON demo_modules FOR SELECT USING (true);
```
