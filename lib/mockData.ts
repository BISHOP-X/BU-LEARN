// Mock data for testing content display screens
// Simulates AI-generated conversion outputs for comprehensive testing

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option (0-3)
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  title: string;
  content: string;
  readingTimeMinutes: number;
}

export interface ConversionResult {
  contentId: string;
  title: string;
  originalFileName: string;
  uploadDate: string;
  fileType: string;
  notes: {
    summary: string;
    keyPoints: string[];
    detailedNotes: string;
  };
  quiz: {
    totalQuestions: number;
    passingScore: number;
    questions: QuizQuestion[];
  };
  story: {
    totalChapters: number;
    estimatedReadingTime: number;
    chapters: StoryChapter[];
  };
  audio: {
    url: string;
    duration: number; // seconds
    transcript: string;
  };
}

// ============================================================
// PRIMARY MOCK DATA - CELL BIOLOGY EXAMPLE
// ============================================================

export const mockConversionResult: ConversionResult = {
  contentId: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Introduction to Cell Biology',
  originalFileName: 'cell_biology_chapter1.pdf',
  uploadDate: '2025-11-18T10:30:00Z',
  fileType: 'pdf',
  
  // NOTES FORMAT
  notes: {
    summary: 'This chapter covers the fundamental concepts of cell biology, including cell structure, organelles, and basic cellular processes. Key focus areas include the difference between prokaryotic and eukaryotic cells, the functions of major organelles, and an introduction to cellular metabolism.',
    
    keyPoints: [
      'Cells are the basic unit of life',
      'Prokaryotic cells lack a nucleus and membrane-bound organelles',
      'Eukaryotic cells have a nucleus and complex organelles',
      'The cell membrane controls what enters and exits the cell',
      'Mitochondria are the powerhouse of the cell',
      'The endoplasmic reticulum synthesizes proteins and lipids',
      'The Golgi apparatus packages and distributes proteins',
      'Lysosomes break down waste materials',
      'The nucleus contains genetic material (DNA)',
      'Ribosomes are responsible for protein synthesis',
      'Plant cells have cell walls, chloroplasts, and large vacuoles',
      'Cellular respiration produces energy in the form of ATP',
      'Photosynthesis converts light energy into chemical energy'
    ],
    
    detailedNotes: `# Cell Biology - Chapter 1: Introduction

## 1. What is a Cell?

A cell is the smallest unit of life that can function independently. All living organisms are composed of one or more cells, making them the fundamental building blocks of life.

### Types of Organisms
- **Unicellular**: Single-celled organisms (bacteria, amoeba, yeast)
- **Multicellular**: Organisms with many cells working together (plants, animals, fungi)

## 2. Prokaryotic vs Eukaryotic Cells

### Prokaryotic Cells
- No nucleus (genetic material floats freely in cytoplasm)
- No membrane-bound organelles
- Smaller in size (1-10 μm)
- Examples: Bacteria, Archaea
- Simpler structure and organization
- Reproduce through binary fission

### Eukaryotic Cells
- Has a nucleus (genetic material enclosed in membrane)
- Contains membrane-bound organelles
- Larger in size (10-100 μm)
- Examples: Animal cells, plant cells, fungi, protists
- More complex structure and specialization
- Reproduce through mitosis or meiosis

## 3. Major Cell Organelles and Their Functions

### Nucleus
- Control center of the cell
- Contains DNA (deoxyribonucleic acid - genetic information)
- Surrounded by nuclear envelope with nuclear pores
- Houses the nucleolus (produces ribosomes)
- Regulates gene expression and cell replication

### Mitochondria
- Powerhouse of the cell
- Produces ATP (adenosine triphosphate) through cellular respiration
- Has its own DNA (supports endosymbiotic theory)
- Double membrane structure (outer and inner membrane)
- Inner membrane has folds called cristae

### Endoplasmic Reticulum (ER)

**Rough ER:**
- Studded with ribosomes on its surface
- Synthesizes proteins destined for export
- Modifies and folds proteins into proper 3D shape
- Connected to nuclear envelope

**Smooth ER:**
- No ribosomes attached
- Synthesizes lipids and hormones
- Detoxifies harmful substances (especially in liver cells)
- Stores calcium ions for cell signaling

### Golgi Apparatus
- Modifies, packages, and sorts proteins from ER
- Adds molecular tags to proteins for destination routing
- Creates lysosomes
- Often called the "post office" or "shipping department" of the cell
- Consists of flattened membrane sacs called cisternae

### Lysosomes
- Contains powerful digestive enzymes
- Breaks down waste materials and cellular debris
- Digests old or damaged organelles (autophagy)
- Defends against invading bacteria
- Plays role in programmed cell death (apoptosis)
- Maintains acidic pH for enzyme activity

### Ribosomes
- Sites of protein synthesis
- Can be free-floating in cytoplasm or attached to rough ER
- Made of ribosomal RNA (rRNA) and proteins
- Read messenger RNA (mRNA) to build proteins
- Consist of large and small subunits

### Cell Membrane (Plasma Membrane)
- Phospholipid bilayer with embedded proteins
- Controls entry and exit of substances (selective permeability)
- Contains cholesterol for membrane stability
- Has proteins for transport, signaling, and recognition
- Separates internal environment from external surroundings

## 4. Additional Plant Cell Structures

### Cell Wall
- Rigid outer layer made primarily of cellulose
- Provides structural support and protection
- Prevents cell from bursting when water enters
- Allows communication through plasmodesmata
- Only present in plant cells, fungi, and some bacteria

### Chloroplasts
- Site of photosynthesis
- Contains chlorophyll (green pigment that absorbs light)
- Converts light energy to chemical energy (glucose)
- Has own DNA and double membrane
- Contains thylakoid stacks called grana
- Only present in plant cells and some protists

### Central Vacuole
- Large storage organelle (can occupy 90% of cell volume)
- Stores water, nutrients, pigments, and waste products
- Maintains turgor pressure to keep plant rigid
- Helps plants grow by expanding with water
- Mainly present in plant cells

## 5. Key Cellular Processes

### Cellular Respiration
- Breaks down glucose to produce energy (ATP)
- Occurs primarily in mitochondria
- Requires oxygen (aerobic respiration)
- Produces carbon dioxide and water as byproducts
- **Formula:** C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP

**Three stages:**
1. Glycolysis (cytoplasm)
2. Krebs Cycle (mitochondrial matrix)
3. Electron Transport Chain (inner mitochondrial membrane)

### Photosynthesis (Plants)
- Converts light energy to chemical energy
- Occurs in chloroplasts
- Requires carbon dioxide and water
- Produces glucose and oxygen
- **Formula:** 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

**Two stages:**
1. Light-dependent reactions (thylakoid membrane)
2. Light-independent reactions/Calvin Cycle (stroma)

### Protein Synthesis
- **Transcription:** DNA → mRNA (in nucleus)
- **Translation:** mRNA → Protein (at ribosomes)
- Central dogma of molecular biology: DNA → RNA → Protein
- Requires transfer RNA (tRNA) to bring amino acids
- Proteins fold into specific 3D shapes to function

## 6. Cell Size and Surface Area to Volume Ratio

Cells remain small because as they grow:
- Volume increases faster than surface area
- More difficult to transport materials in and out
- Waste builds up more quickly
- This is why organisms grow by adding cells, not making cells bigger

## 7. Cell Specialization

In multicellular organisms, cells specialize for specific functions:
- **Muscle cells:** Long, filled with protein fibers for contraction
- **Nerve cells:** Long extensions for signal transmission
- **Red blood cells:** No nucleus, concave shape for oxygen transport
- **Root hair cells:** Extensions for water absorption

## Study Tips
- Draw and label detailed cell diagrams
- Compare prokaryotic and eukaryotic cells side by side
- Create flashcards for organelle functions
- Use mnemonics to remember processes (e.g., "Please Call Me About Getting Off Phone" for glycolysis steps)
- Practice identifying organelles under microscope or in electron micrographs
- Connect structure to function for each organelle
- Review the equations for photosynthesis and cellular respiration`
  },
  
  // QUIZ FORMAT
  quiz: {
    totalQuestions: 10,
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        question: 'What is the main difference between prokaryotic and eukaryotic cells?',
        options: [
          'Eukaryotic cells have a nucleus, prokaryotic cells do not',
          'Prokaryotic cells are larger than eukaryotic cells',
          'Eukaryotic cells cannot perform photosynthesis',
          'Prokaryotic cells have more organelles'
        ],
        correctAnswer: 0,
        explanation: 'The defining feature of eukaryotic cells is the presence of a membrane-bound nucleus that contains genetic material. Prokaryotic cells lack this structure and have their DNA floating freely in the cytoplasm.',
        difficulty: 'easy'
      },
      {
        id: 'q2',
        question: 'Which organelle is known as the "powerhouse of the cell"?',
        options: [
          'Nucleus',
          'Mitochondria',
          'Golgi apparatus',
          'Endoplasmic reticulum'
        ],
        correctAnswer: 1,
        explanation: 'Mitochondria are called the powerhouse of the cell because they produce ATP (adenosine triphosphate) through cellular respiration, which provides energy for all cellular processes.',
        difficulty: 'easy'
      },
      {
        id: 'q3',
        question: 'What is the primary function of ribosomes?',
        options: [
          'DNA replication',
          'Energy production',
          'Protein synthesis',
          'Waste breakdown'
        ],
        correctAnswer: 2,
        explanation: 'Ribosomes are the sites of protein synthesis. They read messenger RNA (mRNA) and assemble amino acids into proteins according to the genetic code.',
        difficulty: 'easy'
      },
      {
        id: 'q4',
        question: 'Which structure is found ONLY in plant cells?',
        options: [
          'Mitochondria',
          'Cell membrane',
          'Cell wall',
          'Ribosomes'
        ],
        correctAnswer: 2,
        explanation: 'The cell wall is a rigid outer layer made of cellulose that provides structural support and protection. It is unique to plant cells (and some other organisms like fungi and bacteria), but not found in animal cells.',
        difficulty: 'medium'
      },
      {
        id: 'q5',
        question: 'What does the Golgi apparatus do?',
        options: [
          'Produces ATP for energy',
          'Synthesizes DNA',
          'Modifies, packages, and sorts proteins',
          'Breaks down old organelles'
        ],
        correctAnswer: 2,
        explanation: 'The Golgi apparatus acts like a post office for the cell. It receives proteins from the endoplasmic reticulum, modifies them, packages them into vesicles, and sends them to their destinations.',
        difficulty: 'medium'
      },
      {
        id: 'q6',
        question: 'Which organelle contains digestive enzymes that break down waste?',
        options: [
          'Mitochondria',
          'Lysosomes',
          'Peroxisomes',
          'Vacuoles'
        ],
        correctAnswer: 1,
        explanation: 'Lysosomes contain powerful digestive enzymes that break down waste materials, old organelles, and invading bacteria. They act as the recycling center and defense system of the cell.',
        difficulty: 'medium'
      },
      {
        id: 'q7',
        question: 'What is the function of chloroplasts?',
        options: [
          'Protein synthesis',
          'Cellular respiration',
          'Photosynthesis',
          'DNA storage'
        ],
        correctAnswer: 2,
        explanation: 'Chloroplasts are the sites of photosynthesis in plant cells. They contain chlorophyll, which captures light energy and converts it into chemical energy (glucose) using carbon dioxide and water.',
        difficulty: 'medium'
      },
      {
        id: 'q8',
        question: 'The cell membrane is primarily composed of which molecules?',
        options: [
          'Proteins and carbohydrates',
          'Phospholipids and proteins',
          'DNA and RNA',
          'Cellulose and lignin'
        ],
        correctAnswer: 1,
        explanation: 'The cell membrane consists of a phospholipid bilayer with embedded proteins. The phospholipids form the basic structure, while proteins perform various functions like transport, signaling, and cell recognition.',
        difficulty: 'hard'
      },
      {
        id: 'q9',
        question: 'Which type of endoplasmic reticulum is studded with ribosomes?',
        options: [
          'Smooth ER',
          'Rough ER',
          'Both types',
          'Neither type'
        ],
        correctAnswer: 1,
        explanation: 'The Rough Endoplasmic Reticulum (Rough ER) is studded with ribosomes on its surface, giving it a "rough" appearance. These ribosomes synthesize proteins that will be processed and transported by the ER.',
        difficulty: 'easy'
      },
      {
        id: 'q10',
        question: 'What is the equation for cellular respiration?',
        options: [
          'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP',
          '6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂',
          'C₆H₁₂O₆ → 2C₃H₆O₃ + ATP',
          'H₂O + CO₂ → H₂CO₃'
        ],
        correctAnswer: 0,
        explanation: 'Cellular respiration breaks down glucose (C₆H₁₂O₆) using oxygen (O₂) to produce carbon dioxide (CO₂), water (H₂O), and ATP energy. This process occurs in the mitochondria.',
        difficulty: 'hard'
      }
    ]
  },
  
  // STORY FORMAT
  story: {
    totalChapters: 5,
    estimatedReadingTime: 16,
    chapters: [
      {
        id: 'ch1',
        chapterNumber: 1,
        title: 'The Microscopic City',
        content: `Welcome to the microscopic world, where cities exist that are far too small for the naked eye to see. These cities are called cells, and they are the building blocks of all life on Earth.

Imagine standing at the gates of two very different cities. One is simple and ancient, with no walls dividing its districts. This is Prokaryville, home to the bacteria and archaea. The other city is grand and complex, with distinct districts separated by membranes. This is Eukaryopolis, where animal cells, plant cells, and fungi reside.

As you approach Prokaryville, you notice something unusual—there's no central government building. The genetic information, the DNA that controls everything, simply floats freely in the streets. The city is small, efficient, and has survived for billions of years with this simple design.

But Eukaryopolis is different. As you walk through its gates, you immediately see the central government building—the nucleus. This is where all the city's blueprints are kept safe, protected behind a double-walled fortress called the nuclear envelope.

"Why the difference?" you wonder. The answer lies in complexity. Eukaryopolis needs more organization because it handles more complicated tasks. It's like comparing a small village to a major metropolitan area.

Both cities are alive, both are thriving, but each has found its own way to survive in the microscopic world. Your journey is just beginning, and there's so much more to discover in these cellular cities.`,
        readingTimeMinutes: 3
      },
      {
        id: 'ch2',
        chapterNumber: 2,
        title: 'The Power District',
        content: `In the heart of Eukaryopolis lies the power district, where hundreds of small power plants work day and night to keep the city running. These power plants are called mitochondria, and they're absolutely essential for life.

Dr. Maria Chen, a cellular biologist, once described mitochondria as "the unsung heroes of life." She explained, "Every time you move, think, or breathe, you're using energy that mitochondria produced."

Each mitochondrion looks like a bean with a maze of folded membranes inside. These folds, called cristae, are where the magic happens. Through a process called cellular respiration, mitochondria take in glucose (a type of sugar) and oxygen, then convert them into ATP—the energy currency of the cell.

The equation is elegant in its simplicity: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP

Think of ATP as rechargeable batteries. Every cellular process—from muscle contraction to brain signals to digesting food—needs these batteries. A single cell might contain hundreds or even thousands of mitochondria, depending on how much energy it needs. Muscle cells, for example, are packed with mitochondria because muscles require tremendous amounts of energy.

But here's something fascinating: mitochondria have their own DNA, completely separate from the DNA in the nucleus. Scientists believe that billions of years ago, mitochondria were actually independent bacteria that got engulfed by larger cells. Instead of being destroyed, they formed a partnership—a symbiotic relationship that changed the course of evolution forever.

Without these power plants, Eukaryopolis would shut down in seconds. Every light, every machine, every system depends on the constant supply of ATP from the mitochondria. The city never sleeps because the power district never stops working.`,
        readingTimeMinutes: 4
      },
      {
        id: 'ch3',
        chapterNumber: 3,
        title: 'The Manufacturing Quarter',
        content: `If you want to understand how Eukaryopolis produces everything it needs, you must visit the manufacturing quarter—a district dominated by two massive structures: the Rough Endoplasmic Reticulum (Rough ER) and the Smooth Endoplasmic Reticulum (Smooth ER).

Picture a vast network of interconnected tunnels and chambers, like an enormous underground factory complex. This is the Endoplasmic Reticulum, often just called the ER.

The Rough ER gets its name from the thousands of ribosomes dotting its surface, like barnacles on a ship. These ribosomes are tiny molecular machines with one job: to read genetic instructions and build proteins. The Rough ER is where most of the city's proteins are manufactured, modified, and prepared for distribution.

"Think of ribosomes as 3D printers for proteins," explains Dr. James Liu, a molecular biologist. "They read the mRNA blueprint and assemble amino acids in the exact order specified by the genetic code. It's manufacturing with atomic precision."

The Smooth ER, in contrast, has no ribosomes. Its surface is smooth, and its job is completely different. This part of the factory produces lipids—the fats that make up cell membranes and hormones. The Smooth ER also detoxifies harmful chemicals and stores calcium ions that are used for cell signaling.

But manufacturing is only half the story. Once products are made, they need to be packaged and shipped. That's where the Golgi apparatus comes in—a structure that looks like a stack of pancakes.

The Golgi apparatus is the post office and packaging center of Eukaryopolis. Proteins from the ER arrive in small transport bubbles called vesicles. The Golgi receives them, modifies them further (adding sugar molecules or other chemical tags), sorts them based on their destination, and packages them into new vesicles for delivery.

Some proteins are sent to the cell membrane. Others are packaged into lysosomes. Some are even exported outside the cell entirely—like hormones or antibodies. The Golgi apparatus ensures that every protein reaches exactly where it needs to go.

This manufacturing and distribution system is so efficient that a single cell can produce thousands of different proteins simultaneously, each one perfectly crafted and delivered to its destination. It's industrial production on a microscopic scale, and it never stops.`,
        readingTimeMinutes: 4
      },
      {
        id: 'ch4',
        chapterNumber: 4,
        title: 'The Recycling Center',
        content: `Every city produces waste, and Eukaryopolis is no exception. But this city has evolved the ultimate recycling system—a fleet of waste disposal units called lysosomes.

Lysosomes are small, membrane-bound sacs filled with powerful digestive enzymes. If you could peer inside one, you'd find over 50 different types of enzymes, each specialized for breaking down specific materials—proteins, carbohydrates, lipids, nucleic acids, and more.

"Lysosomes are like the recycling centers and garbage disposals of the cell," says Dr. Sarah Patel, a cell biologist. "But they're also the cleanup crew and the defense force."

When an organelle becomes old and damaged, it's marked for destruction. Lysosomes engulf it and break it down into basic components—amino acids, sugars, nucleotides—that can be reused to build new structures. Nothing goes to waste in Eukaryopolis. This process is called autophagy, which literally means "self-eating."

But lysosomes do more than just recycle. When bacteria invade the cell, lysosomes spring into action. They merge with the bacteria-containing vesicles and unleash their enzymes, destroying the invaders before they can cause harm. It's like having an internal immune system at the cellular level.

There's a darker side to lysosomes, though. When a cell is severely damaged or no longer needed, it can trigger a self-destruct sequence called apoptosis—programmed cell death. Lysosomes play a crucial role in this controlled cellular suicide, breaking down the cell from the inside. This might sound grim, but it's actually essential for life. Removing damaged cells prevents diseases like cancer, and apoptosis is crucial during development (for example, the removal of webbing between fingers in human embryos).

The enzymes inside lysosomes are so powerful that if a lysosome ruptures, it can damage or destroy the cell from within. That's why these enzymes are carefully contained behind a protective membrane and kept at a low pH environment (acidic conditions) where they function best but can't harm the rest of the cell if they leak out.

Thanks to lysosomes, Eukaryopolis stays clean, defended, and efficient. It's a waste management system that would make any city planner envious.`,
        readingTimeMinutes: 4
      },
      {
        id: 'ch5',
        chapterNumber: 5,
        title: 'Plant City\'s Special Features',
        content: `If Eukaryopolis represents animal cells, then Plant City is its botanical cousin—similar in many ways, but with some extraordinary unique features that make it truly remarkable.

The first thing you notice when approaching Plant City is the massive wall surrounding it. This isn't just any wall—it's a rigid cell wall made of cellulose, a tough carbohydrate. While animal cells have only a flexible cell membrane, plant cells have both a cell membrane and this sturdy outer wall.

"The cell wall is like reinforced concrete around a building," explains botanist Dr. Elena Rodriguez. "It provides structural support that allows plants to stand upright without a skeleton. It prevents the cell from bursting when water enters through osmosis. And it protects against physical damage and pathogens."

The cell wall is why plants can grow tall and strong. It's why a tree can stand for hundreds of years. And it's why you can't squeeze a plant cell the way you might deform an animal cell.

But the most spectacular feature of Plant City is the solar panel district—an area filled with green structures called chloroplasts. These organelles are the reason plants can produce their own food through photosynthesis.

Inside each chloroplast are stacks of disc-shaped structures called thylakoids, arranged like coins in rolls. These structures contain chlorophyll molecules that capture sunlight. In the light-dependent reactions, this light energy is used to split water molecules, producing oxygen as a byproduct and storing energy in ATP and NADPH.

The light-independent reactions (also called the Calvin Cycle) happen in the surrounding fluid called the stroma. Here, carbon dioxide from the air is captured and converted into glucose using the energy from the light reactions. The equation mirrors cellular respiration but runs in reverse: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

This is the opposite of cellular respiration—photosynthesis builds glucose while respiration breaks it down. It's a perfect cycle that sustains most life on Earth. Animals eat plants (or eat animals that eat plants) to get the glucose that chloroplasts originally created from sunlight.

Finally, there's the central vacuole—a giant water-filled sac that can take up to 90% of a plant cell's volume. Think of it as a combination of storage warehouse, waste disposal site, and structural support system all in one.

The central vacuole stores water, nutrients, pigments, and waste products. When filled with water, it pushes against the cell wall, creating turgor pressure that keeps the plant rigid and upright. This is why plants wilt when they don't get enough water—the vacuole shrinks, turgor pressure drops, and the plant can no longer support itself.

The vacuole also stores the pigments that give flowers their colors, attracting pollinators. In autumn, when chlorophyll breaks down, the pigments stored in vacuoles become visible, creating the spectacular fall colors we see in leaves.

Plant City and Eukaryopolis share many features—nucleus, mitochondria, ER, Golgi apparatus, ribosomes—but these three unique structures (cell wall, chloroplasts, and central vacuole) make plant cells extraordinary. They're the reason plants can stand tall, produce their own food from sunlight, and ultimately, sustain almost all life on Earth.

Your journey through the cellular cities is complete. You've seen power plants that never sleep, manufacturing centers that produce with atomic precision, recycling facilities that turn waste into resources, and solar panels that capture the energy of the sun itself. You've witnessed defense systems, transportation networks, and government buildings—all working together in perfect harmony.

These microscopic cities are more complex and fascinating than any human city could ever be. And the most amazing part? Your body contains trillions of these cellular cities, each one working right now, in this very moment, to keep you alive.

The world of cells is the world of life itself. And now you know its secrets.`,
        readingTimeMinutes: 5
      }
    ]
  },
  
  // AUDIO FORMAT
  audio: {
    url: 'https://example.com/mock-audio-cell-biology.mp3', // Mock URL - will be replaced with real audio
    duration: 720, // 12 minutes in seconds
    transcript: `Welcome to the audio lesson on Introduction to Cell Biology. I'm your narrator for this journey into the microscopic world that makes up all living things.

Let's begin with a fundamental question: What is a cell?

A cell is the smallest unit of life that can function independently. Whether you're looking at a single-celled bacterium or a complex organism like a human being, cells are where life happens. They're the building blocks of everything living on Earth.

Now, there are two main types of cells that we need to understand: prokaryotic and eukaryotic cells.

Prokaryotic cells are the simpler, more ancient type. They don't have a nucleus or any membrane-bound organelles. Their genetic material—their DNA—just floats freely in the cytoplasm. Bacteria and archaea are examples of prokaryotic organisms. These cells are typically very small, ranging from one to ten micrometers in diameter. Despite their simplicity, prokaryotic cells have been incredibly successful, surviving for billions of years.

Eukaryotic cells, on the other hand, are more complex. They have a true nucleus where the genetic material is enclosed and protected by a membrane. They also contain various membrane-bound organelles, each with specialized functions. Animals, plants, fungi, and protists are all made of eukaryotic cells. These cells are much larger than prokaryotic cells, typically ten to one hundred micrometers in size.

Now, let's take a tour through a eukaryotic cell and explore its major organelles.

First, the nucleus—the control center of the cell. The nucleus contains DNA, which holds all the genetic instructions for making proteins and controlling cellular activities. Think of it as the library and headquarters of the cell. The nucleus is surrounded by a double membrane called the nuclear envelope, which has pores that allow materials to move in and out.

Next, we have the mitochondria, often called the powerhouse of the cell, and for good reason. Mitochondria produce ATP—that's adenosine triphosphate—the energy currency that powers almost all cellular processes. Every time you move a muscle, send a nerve signal, or digest food, you're using ATP that mitochondria produced. Interestingly, mitochondria have their own DNA, which supports the theory that they were once independent bacteria that formed a symbiotic relationship with early eukaryotic cells billions of years ago.

Moving on to the endoplasmic reticulum, or ER. This is a network of membranes involved in protein and lipid synthesis. There are two types: rough ER and smooth ER.

The rough ER is studded with ribosomes, giving it a bumpy or "rough" appearance under a microscope. This is where proteins destined for export or for use in the cell membrane are made. The smooth ER, which lacks ribosomes, synthesizes lipids and hormones, detoxifies harmful substances, and stores calcium ions.

Ribosomes themselves are fascinating structures. These tiny molecular machines read messenger RNA—mRNA—and assemble amino acids into proteins according to the genetic code. They're like 3D printers for proteins, working with atomic precision.

Now let's talk about the Golgi apparatus. Think of this organelle as the post office of the cell. It modifies, packages, and sorts proteins that come from the endoplasmic reticulum. The Golgi adds molecular tags to proteins that serve as addresses, ensuring each protein gets delivered to the right destination—whether that's the cell membrane, a lysosome, or outside the cell entirely.

Speaking of lysosomes, these are the recycling centers and waste disposal units of the cell. Lysosomes are filled with digestive enzymes that break down waste materials, old organelles, and invading pathogens. They keep the cell clean and defend it against infection. The process of breaking down old organelles is called autophagy, which literally means "self-eating."

The cell membrane, also called the plasma membrane, is what separates the cell from its environment. It's made of a phospholipid bilayer with embedded proteins. This membrane is selectively permeable, meaning it carefully controls what enters and exits the cell. Some substances can pass through freely, while others require special transport proteins.

Now, plant cells have some additional structures that animal cells don't have.

The cell wall is a rigid outer layer made primarily of cellulose. It provides structural support and protection, and it's why plants can stand upright without a skeleton. The cell wall prevents plant cells from bursting when they take in water through osmosis.

Chloroplasts are where photosynthesis occurs. These organelles contain chlorophyll, the green pigment that captures light energy. Chloroplasts convert light energy, carbon dioxide, and water into glucose and oxygen. The equation for photosynthesis is: six carbon dioxide plus six water plus light energy yields one glucose molecule plus six oxygen molecules.

And then there's the central vacuole—a large storage organelle that can occupy up to ninety percent of a plant cell's volume. It stores water, nutrients, pigments, and waste products. When full of water, it creates turgor pressure that helps keep the plant rigid and upright. When a plant doesn't get enough water, the vacuole shrinks, pressure drops, and the plant wilts.

Let's discuss two key cellular processes: cellular respiration and photosynthesis.

Cellular respiration is how cells break down glucose to produce energy. The process occurs primarily in mitochondria and requires oxygen. Glucose and oxygen are converted into carbon dioxide, water, and ATP. The equation is: one glucose molecule plus six oxygen molecules yields six carbon dioxide plus six water plus ATP.

Photosynthesis, which occurs in plant cells, is essentially the reverse process. It converts light energy into chemical energy stored in glucose. As I mentioned earlier, it combines carbon dioxide and water using light energy to produce glucose and oxygen.

These two processes are complementary. Plants use photosynthesis to produce glucose and oxygen, which animals then use for cellular respiration. Animals produce carbon dioxide and water, which plants use for photosynthesis. It's a beautiful cycle that sustains life on Earth.

Before we wrap up, let's talk about why cells stay small. As a cell grows, its volume increases faster than its surface area. This creates problems because the cell needs to transport materials in and out through its surface. If a cell gets too big, it can't efficiently move nutrients in or waste out. This is why organisms grow by adding more cells rather than making existing cells bigger.

Finally, in multicellular organisms, cells specialize for specific functions. Muscle cells are long and filled with protein fibers for contraction. Nerve cells have long extensions for transmitting signals across long distances. Red blood cells lack a nucleus and have a concave shape that maximizes their ability to carry oxygen. This specialization allows complex organisms to perform a wide variety of functions efficiently.

And that concludes our audio lesson on cell biology. You've learned about the difference between prokaryotic and eukaryotic cells, explored the major organelles and their functions, and understood key processes like cellular respiration and photosynthesis.

Remember, every living thing—from the smallest bacterium to the largest whale—is made of cells. Understanding cells means understanding life itself. Thank you for listening, and happy studying.`
  }
}

// ============================================================
// LEGACY MOCK DATA (Keep for backward compatibility)
// ============================================================

// Mock user data
export const mockUser = {
  id: '123',
  username: 'student_alex',
  email: 'alex@example.com',
  learning_style: 'visual',
  points: 250,
  level: 3,
  streak: 7,
  badges: ['first_quiz', '7_day_streak']
}

// Mock uploaded content for library screen
export const mockContent = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Introduction to Cell Biology',
    file_type: 'pdf',
    status: 'completed',
    created_at: '2025-11-18T10:30:00Z',
    thumbnail: '📚'
  },
  {
    id: '223e4567-e89b-12d3-a456-426614174001',
    title: 'Chemistry: Atomic Structure',
    file_type: 'pdf',
    status: 'completed',
    created_at: '2025-11-17T14:20:00Z',
    thumbnail: '⚗️'
  },
  {
    id: '323e4567-e89b-12d3-a456-426614174002',
    title: 'World History Notes',
    file_type: 'txt',
    status: 'completed',
    created_at: '2025-11-16T09:15:00Z',
    thumbnail: '🌍'
  },
  {
    id: '423e4567-e89b-12d3-a456-426614174003',
    title: 'Physics: Newton\'s Laws',
    file_type: 'docx',
    status: 'processing',
    created_at: '2025-11-15T16:45:00Z',
    thumbnail: '🔬'
  },
  {
    id: '523e4567-e89b-12d3-a456-426614174004',
    title: 'English Literature Analysis',
    file_type: 'pdf',
    status: 'completed',
    created_at: '2025-11-14T11:00:00Z',
    thumbnail: '📖'
  }
];

// ============================================================
// LEADERBOARD MOCK DATA
// ============================================================

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  points: number;
  level: number;
  avatar: string;
  streak?: number;
}

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: '1', username: 'StudyMaster99', points: 15420, level: 31, avatar: '👑', streak: 45 },
  { rank: 2, userId: '2', username: 'BrainiacKid', points: 14850, level: 30, avatar: '🧠', streak: 38 },
  { rank: 3, userId: '3', username: 'QuizWhiz', points: 13200, level: 27, avatar: '⚡', streak: 25 },
  { rank: 4, userId: '4', username: 'LearnFast', points: 12900, level: 26, avatar: '🚀', streak: 22 },
  { rank: 5, userId: '5', username: 'NoteNinja', points: 11500, level: 23, avatar: '🥷', streak: 30 },
  { rank: 6, userId: '6', username: 'SmartCookie', points: 10800, level: 22, avatar: '🍪', streak: 18 },
  { rank: 7, userId: '7', username: 'EduExplorer', points: 9650, level: 20, avatar: '🗺️', streak: 15 },
  { rank: 8, userId: '8', username: 'ThinkTank', points: 8900, level: 18, avatar: '💡', streak: 12 },
  { rank: 9, userId: '9', username: 'BookWorm', points: 8200, level: 17, avatar: '🐛', streak: 20 },
  { rank: 10, userId: '10', username: 'KnowledgeKing', points: 7850, level: 16, avatar: '👨‍🎓', streak: 14 }
];

// ============================================================
// BADGE SYSTEM MOCK DATA
// ============================================================

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number; // 0-100 percentage
  requirement: string;
  category: 'upload' | 'quiz' | 'streak' | 'achievement' | 'social';
}

export const mockBadges: Badge[] = [
  {
    id: 'first-upload',
    name: 'First Steps',
    description: 'Upload your first study material',
    icon: '🎯',
    earned: true,
    earnedDate: '2025-11-18T10:30:00Z',
    requirement: 'Upload 1 file',
    category: 'upload'
  },
  {
    id: 'first-quiz',
    name: 'Quiz Rookie',
    description: 'Complete your first quiz',
    icon: '📝',
    earned: true,
    earnedDate: '2025-11-18T11:15:00Z',
    requirement: 'Complete 1 quiz',
    category: 'quiz'
  },
  {
    id: 'perfect-score',
    name: 'Perfect Scholar',
    description: 'Score 100% on a quiz',
    icon: '💯',
    earned: true,
    earnedDate: '2025-11-18T14:22:00Z',
    requirement: 'Get 100% on any quiz',
    category: 'quiz'
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    earned: false,
    progress: 57,
    requirement: '7-day streak',
    category: 'streak'
  },
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    description: 'Upload 10 study materials',
    icon: '📚',
    earned: false,
    progress: 30,
    requirement: 'Upload 10 files',
    category: 'upload'
  },
  {
    id: 'quiz-master',
    name: 'Quiz Master',
    description: 'Score 100% on 5 quizzes',
    icon: '🏆',
    earned: false,
    progress: 20,
    requirement: '5 perfect quizzes',
    category: 'quiz'
  },
  {
    id: 'top-ten',
    name: 'Top 10',
    description: 'Reach the top 10 on the leaderboard',
    icon: '👑',
    earned: false,
    progress: 0,
    requirement: 'Reach top 10',
    category: 'achievement'
  },
  {
    id: 'speed-reader',
    name: 'Speed Reader',
    description: 'Complete 20 story chapters',
    icon: '⚡',
    earned: false,
    progress: 35,
    requirement: 'Read 20 chapters',
    category: 'achievement'
  },
  {
    id: 'audio-enthusiast',
    name: 'Audio Enthusiast',
    description: 'Listen to 5 hours of audio lessons',
    icon: '🎧',
    earned: false,
    progress: 64,
    requirement: '5 hours of audio',
    category: 'achievement'
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Study before 6 AM',
    icon: '🌅',
    earned: false,
    progress: 0,
    requirement: 'Study before 6 AM once',
    category: 'achievement'
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Study after midnight',
    icon: '🦉',
    earned: false,
    progress: 0,
    requirement: 'Study after midnight once',
    category: 'achievement'
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Share content with 3 friends',
    icon: '🦋',
    earned: false,
    progress: 0,
    requirement: 'Share with 3 friends',
    category: 'social'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get conversion result by content ID
 * In production, this would fetch from database
 */
export function getConversionById(contentId: string): ConversionResult | null {
  if (contentId === mockConversionResult.contentId) {
    return mockConversionResult;
  }
  return null;
}

/**
 * Get library content by ID
 */
export function getContentById(contentId: string) {
  return mockContent.find(c => c.id === contentId);
}

/**
 * Get user leaderboard position
 */
export function getUserRank(userId: string): LeaderboardEntry | null {
  return mockLeaderboard.find(entry => entry.userId === userId) || null;
}

/**
 * Get earned badges count
 */
export function getEarnedBadgesCount(): number {
  return mockBadges.filter(badge => badge.earned).length;
}

/**
 * Get total badges count
 */
export function getTotalBadgesCount(): number {
  return mockBadges.length;
}

/**
 * Calculate overall badge progress percentage
 */
export function getBadgeProgressPercentage(): number {
  const earned = getEarnedBadgesCount();
  const total = getTotalBadgesCount();
  return Math.round((earned / total) * 100);
}
