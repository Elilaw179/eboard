import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, isConfigured } from '@/lib/firebase/config';
import { Note, NoteFormData, NoteStatus } from '@/types/note';
import { ClassGrade, CLASSES } from '@/types/class';
import { extractPlainText } from '@/lib/utils/format';

const NOTES_COLLECTION = 'notes';

// Initial educational mock notes matching the prompt requirements
const INITIAL_SEED_NOTES: Note[] = [
  {
    id: 'seed-c-programming',
    title: 'Introduction to C Programming',
    subject: 'Computer Science',
    className: 'Year 10',
    classSlug: 'year-10',
    content: `
      <h2>1. Introduction to C</h2>
      <p>C is a powerful, general-purpose procedural programming language developed in 1972 by Dennis Ritchie at Bell Laboratories. It was designed to build operating systems (including Unix) and remains the bedrock of modern computing, embedded hardware, and high-performance engines.</p>
      
      <h3>Key Characteristics of C:</h3>
      <ul>
        <li><strong>Low-level memory access:</strong> Direct control via pointers and memory allocation.</li>
        <li><strong>Portability:</strong> Compiles across virtually all modern hardware platforms.</li>
        <li><strong>Speed:</strong> Near-assembly execution efficiency.</li>
      </ul>

      <h2>2. Basic Program Structure</h2>
      <p>Every C program begins execution in the <code>main()</code> function. Below is the standard structure of a C source file:</p>

      <pre><code>#include &lt;stdio.h&gt;

int main() {
    // Print a welcoming greeting to the standard output
    printf("Hello World! Welcome to Year 10 Computer Science.\\n");
    return 0;
}</code></pre>

      <h2>3. Fundamental Data Types</h2>
      <p>Variables in C must be explicitly declared with their data type before usage:</p>

      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Keyword</th>
            <th>Size</th>
            <th>Range / Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Integer</td>
            <td><code>int</code></td>
            <td>4 bytes</td>
            <td>Whole numbers from -2,147,483,648 to 2,147,483,647</td>
          </tr>
          <tr>
            <td>Floating Point</td>
            <td><code>float</code></td>
            <td>4 bytes</td>
            <td>Single-precision decimal values (up to 7 decimal digits)</td>
          </tr>
          <tr>
            <td>Double</td>
            <td><code>double</code></td>
            <td>8 bytes</td>
            <td>Double-precision decimals (up to 15 decimal digits)</td>
          </tr>
          <tr>
            <td>Character</td>
            <td><code>char</code></td>
            <td>1 byte</td>
            <td>Single ASCII character or byte value</td>
          </tr>
        </tbody>
      </table>

      <h2>4. Class Exercises</h2>
      <ol>
        <li>Write a program that takes your birth year as input and computes your age.</li>
        <li>Declare three variables of type <code>float</code>, compute their average, and print the result formatted to two decimal places using <code>%.2f</code>.</li>
      </ol>
    `,
    plainTextPreview: 'Learn the basic structure of a C program, variables, data types and basic syntax. Understand Dennis Ritchie\'s foundational procedural language.',
    status: 'published',
    createdAt: new Date('2026-09-21T09:30:00Z'),
    updatedAt: new Date('2026-09-21T09:30:00Z'),
    authorName: 'Mr. Henderson',
    tags: ['Programming', 'C', 'Syntax'],
  },
  {
    id: 'seed-robotics-sensors',
    title: 'Introduction to Sensors & Microcontrollers',
    subject: 'Robotics',
    className: 'Year 9',
    classSlug: 'year-9',
    content: `
      <h2>1. What is a Sensor in Robotics?</h2>
      <p>A sensor is an electrical transducer that converts physical phenomena (light, sound, distance, temperature) into readable electrical signals (analog voltage or digital data packets).</p>
      
      <h2>2. Common Sensors in our Lab Kit</h2>
      <ul>
        <li><strong>HC-SR04 Ultrasonic Distance Sensor:</strong> Uses sound waves (40kHz) to measure distance by timing the acoustic echo pulse duration (Speed of Sound = 343 m/s).</li>
        <li><strong>LDR (Light Dependent Resistor):</strong> Resistance drops as ambient illuminance increases. Ideal for line-following robots.</li>
        <li><strong>PIR Motion Sensor:</strong> Detects passive infrared emissions from humans or warm bodies.</li>
      </ul>

      <h2>3. Pinout & Wiring Diagram</h2>
      <p>When connecting the HC-SR04 to an Arduino or ESP32 microcontroller:</p>
      <pre><code>VCC  -> 5V Rail
GND  -> Common Ground (0V)
TRIG -> Digital Pin 9 (Output pulse, 10 microseconds)
ECHO -> Digital Pin 10 (Input pulse measurement)</code></pre>

      <h2>4. Laboratory Challenge</h2>
      <p>Program your mobile rover to stop exactly 15 centimeters before colliding with an obstacle.</p>
    `,
    plainTextPreview: 'Explore how robots perceive the physical world using ultrasonic transceivers, light-dependent resistors, and infrared motion detectors.',
    status: 'published',
    createdAt: new Date('2026-09-20T14:15:00Z'),
    updatedAt: new Date('2026-09-20T14:15:00Z'),
    authorName: 'Dr. Vance',
    tags: ['Robotics', 'Sensors', 'Arduino'],
  },
  {
    id: 'seed-physics-newton',
    title: "Newton's Laws of Motion & Momentum",
    subject: 'Physics',
    className: 'Year 11',
    classSlug: 'year-11',
    content: `
      <h2>1. The Three Laws of Classical Mechanics</h2>
      <p>Sir Isaac Newton formulated three physical laws that established the foundation for classical mechanics:</p>

      <h3>First Law (Law of Inertia)</h3>
      <p>An object remains at rest, or in a state of uniform motion at constant velocity, unless acted upon by a non-zero resultant external force.</p>

      <h3>Second Law (Force and Acceleration)</h3>
      <p>The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass:</p>
      <pre><code>F = m * a
Force (Newtons, N) = mass (kg) * acceleration (m/s²)</code></pre>

      <h3>Third Law (Action & Reaction)</h3>
      <p>When body A exerts a force on body B, body B simultaneously exerts a force equal in magnitude and opposite in direction on body A.</p>

      <h2>2. Conservation of Linear Momentum</h2>
      <p>In any isolated system with no external forces, total momentum before collision equals total momentum after collision:</p>
      <pre><code>m1*u1 + m2*u2 = m1*v1 + m2*v2</code></pre>
    `,
    plainTextPreview: 'Detailed exploration of Newton’s three laws, mathematical formulation F=ma, free-body diagrams, and elastic vs inelastic collisions.',
    status: 'published',
    createdAt: new Date('2026-09-19T11:00:00Z'),
    updatedAt: new Date('2026-09-19T11:00:00Z'),
    authorName: 'Mrs. Sterling',
    tags: ['Physics', 'Mechanics', 'Forces'],
  },
  {
    id: 'seed-math-calculus',
    title: 'Differential Calculus & Rates of Change',
    subject: 'Mathematics',
    className: 'Year 12',
    classSlug: 'year-12',
    content: `
      <h2>1. The Concept of a Derivative</h2>
      <p>The derivative measures the instantaneous rate at which a quantity changes with respect to another. Geometrically, it is the exact gradient of the tangent line to the curve at any given coordinate.</p>

      <h3>Definition from First Principles:</h3>
      <pre><code>f'(x) = lim_{h -> 0} [ f(x + h) - f(x) ] / h</code></pre>

      <h2>2. Essential Differentiation Rules</h2>
      <ul>
        <li><strong>Power Rule:</strong> d/dx [ x^n ] = n * x^(n - 1)</li>
        <li><strong>Product Rule:</strong> d/dx [ u * v ] = u' * v + u * v'</li>
        <li><strong>Quotient Rule:</strong> d/dx [ u / v ] = (u' * v - u * v') / (v^2)</li>
        <li><strong>Chain Rule:</strong> dy/dx = (dy/du) * (du/dx)</li>
      </ul>

      <h2>3. Optimization Problem Example</h2>
      <p>A farmer has 120 metres of fencing to enclose a rectangular pasture against a straight river. Find the dimensions that maximize the enclosed pasture area.</p>
    `,
    plainTextPreview: 'Master limits from first principles, the power rule, chain rule, and real-world optimization problems with gradient curves.',
    status: 'published',
    createdAt: new Date('2026-09-18T10:20:00Z'),
    updatedAt: new Date('2026-09-18T10:20:00Z'),
    authorName: 'Mr. Alvarez',
    tags: ['Math', 'Calculus', 'Derivatives'],
  },
  {
    id: 'seed-science-matter',
    title: 'States of Matter & Particle Kinetic Theory',
    subject: 'Science',
    className: 'Year 7',
    classSlug: 'year-7',
    content: `
      <h2>1. The Particle Model of Matter</h2>
      <p>All matter is composed of tiny, discrete particles (atoms or molecules) in continuous random motion. The temperature of a substance is a direct measure of the average kinetic energy of its particles.</p>

      <h3>The Three Classical States:</h3>
      <ul>
        <li><strong>Solids:</strong> Particles are tightly packed in regular lattice structures. They vibrate in fixed positions, giving solids definite shape and volume.</li>
        <li><strong>Liquids:</strong> Particles are in close contact but free to slide past one another. Liquids take the shape of their container while retaining fixed volume.</li>
        <li><strong>Gases:</strong> Particles are separated by large distances and travel at high velocities in random straight lines, filling whatever container they occupy.</li>
      </ul>

      <h2>2. Phase Changes</h2>
      <p>Melting (solid to liquid), evaporating/boiling (liquid to gas), condensing (gas to liquid), and freezing (liquid to solid). Sublimation occurs when a solid transforms directly to gas (e.g. Dry Ice / CO2).</p>
    `,
    plainTextPreview: 'Understand the particle model of matter, kinetic theory, phase transitions, and temperature heating curves in foundational science.',
    status: 'published',
    createdAt: new Date('2026-09-17T08:45:00Z'),
    updatedAt: new Date('2026-09-17T08:45:00Z'),
    authorName: 'Ms. Jenkins',
    tags: ['Science', 'Chemistry', 'Matter'],
  },
  {
    id: 'seed-english-rhetoric',
    title: 'Rhetoric & Persuasive Techniques',
    subject: 'English Literature',
    className: 'Year 8',
    classSlug: 'year-8',
    content: `
      <h2>1. The Classical Rhetorical Triangle</h2>
      <p>Aristotle identified three primary modes of persuasion used by great orators and authors to convince audiences:</p>

      <ul>
        <li><strong>Ethos (Credibility & Character):</strong> Convincing the audience of the speaker’s moral authority, expertise, and trustworthiness.</li>
        <li><strong>Pathos (Emotional Appeal):</strong> Engaging empathy, inspiring hope, invoking righteous indignation, or connecting on a human emotional level.</li>
        <li><strong>Logos (Logic & Evidence):</strong> Using coherent reasoning, empirical data, syllogisms, statistics, and verifiable facts.</li>
      </ul>

      <h2>2. Rhetorical Devices to Practice in Your Essay</h2>
      <ol>
        <li><strong>Anaphora:</strong> Deliberate repetition of a word or phrase at the beginning of successive sentences (e.g., "We shall fight on the beaches, we shall fight...").</li>
        <li><strong>Hypophora:</strong> Raising a question and then immediately answering it.</li>
        <li><strong>Tricolon:</strong> The rule of three words or phrases grouped together for rhythmic impact.</li>
      </ol>
    `,
    plainTextPreview: 'Discover Aristotle’s rhetorical triangle (Ethos, Pathos, Logos) and rhetorical devices like anaphora and tricolons for persuasive writing.',
    status: 'published',
    createdAt: new Date('2026-09-16T13:00:00Z'),
    updatedAt: new Date('2026-09-16T13:00:00Z'),
    authorName: 'Mr. Clarke',
    tags: ['English', 'Rhetoric', 'Writing'],
  },
  {
    id: 'seed-draft-robotics-advanced',
    title: 'Kinematics of 4-DoF Robotic Arms (DRAFT)',
    subject: 'Robotics',
    className: 'Year 12',
    classSlug: 'year-12',
    content: `
      <h2>Forward Kinematics & Denavit-Hartenberg Parameters</h2>
      <p>This note is currently in preparation for next week's laboratory session. It covers coordinate frame assignments for 4 degrees of freedom articulation.</p>
    `,
    plainTextPreview: 'Draft lesson on Denavit-Hartenberg frame parameters for multi-axis robotic articulators.',
    status: 'draft',
    createdAt: new Date('2026-09-21T18:00:00Z'),
    updatedAt: new Date('2026-09-21T18:00:00Z'),
    authorName: 'Dr. Vance',
    tags: ['Robotics', 'Kinematics'],
  },
];

// Local storage key for persisting notes created during demo/local testing
export const LOCAL_STORAGE_KEY = 'eboard_stored_notes_v1';

export function getLocalNotes(): Note[] {
  if (typeof window === 'undefined') return INITIAL_SEED_NOTES;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SEED_NOTES));
      return INITIAL_SEED_NOTES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SEED_NOTES;
  } catch {
    return INITIAL_SEED_NOTES;
  }
}

export function saveLocalNotes(notes: Note[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed to save to local cache', err);
  }
}

/**
 * Fetch published notes for students, optionally filtered by class and subject
 */
export async function getPublishedNotes(options?: {
  className?: string;
  classSlug?: string;
  subject?: string;
}): Promise<Note[]> {
  // If Firestore is connected, query Firestore
  if (isConfigured && db) {
    try {
      // IMPORTANT: Do NOT combine where() + orderBy() — that requires a composite
      // index in Firebase Console. We use simple where() filters and sort client-side.
      let q = query(
        collection(db, NOTES_COLLECTION),
        where('status', '==', 'published')
      );

      if (options?.className) {
        q = query(
          collection(db, NOTES_COLLECTION),
          where('status', '==', 'published'),
          where('className', '==', options.className)
        );
      } else if (options?.classSlug) {
        q = query(
          collection(db, NOTES_COLLECTION),
          where('status', '==', 'published'),
          where('classSlug', '==', options.classSlug)
        );
      }

      if (options?.subject && options.subject !== 'All') {
        q = query(
          collection(db, NOTES_COLLECTION),
          where('status', '==', 'published'),
          where('subject', '==', options.subject)
        );
      }

      const snapshot = await getDocs(q);
      const notes: Note[] = [];
      snapshot.forEach((docSnap) => {
        notes.push({ id: docSnap.id, ...docSnap.data() } as Note);
      });
      // Sort newest first client-side (no composite index required)
      return notes.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime();
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
    } catch (err: any) {
      console.error('[ClassBoard] Firestore getPublishedNotes error:', err?.code, err?.message);
    }
  }

  // Fallback / Demo store
  let list = getLocalNotes().filter((n) => n.status === 'published');

  if (options?.className) {
    list = list.filter((n) => n.className.toLowerCase() === options.className!.toLowerCase());
  } else if (options?.classSlug) {
    list = list.filter((n) => n.classSlug.toLowerCase() === options.classSlug!.toLowerCase());
  }

  if (options?.subject && options.subject !== 'All') {
    list = list.filter((n) => n.subject.toLowerCase() === options.subject!.toLowerCase());
  }

  return list.sort((a, b) => {
    const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime();
    const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime();
    return timeB - timeA;
  });
}

/**
 * Fetch a single note by ID (verifying published state for public requests)
 */
export async function getNoteById(id: string): Promise<Note | null> {
  if (isConfigured && db) {
    try {
      const docRef = doc(db, NOTES_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Note;
      }
    } catch (err) {
      console.warn('Firestore getDoc failed, checking local store:', err);
    }
  }

  const found = getLocalNotes().find((n) => n.id === id);
  return found || null;
}

/**
 * Fetch ALL notes for Admin Dashboard (both Drafts and Published)
 */
export async function getAllNotesForAdmin(): Promise<Note[]> {
  if (isConfigured && db) {
    try {
      // Simple collection fetch — no orderBy to avoid needing an index
      const snapshot = await getDocs(collection(db, NOTES_COLLECTION));
      const notes: Note[] = [];
      snapshot.forEach((docSnap) => {
        notes.push({ id: docSnap.id, ...docSnap.data() } as Note);
      });
      // Sort client-side
      return notes.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime();
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
    } catch (err: any) {
      console.error('[ClassBoard] Firestore getAllNotesForAdmin error:', err?.code, err?.message);
    }
  }

  return [...getLocalNotes()].sort((a, b) => {
    const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime();
    const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime();
    return timeB - timeA;
  });
}

/**
 * Create a new Note
 */
export async function createNote(formData: NoteFormData, authorName: string = 'Teacher'): Promise<string> {
  const classDef = CLASSES.find((c) => c.name === formData.className);
  const classSlug = classDef?.slug || formData.className.toLowerCase().replace(/\s+/g, '-');
  const plainTextPreview = extractPlainText(formData.content, 180);

  const newNoteData = {
    title: formData.title.trim(),
    subject: formData.subject.trim(),
    className: formData.className,
    classSlug,
    content: formData.content,
    plainTextPreview,
    status: formData.status,
    authorName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (isConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, NOTES_COLLECTION), newNoteData);
      const newNote: Note = {
        ...newNoteData,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const list = getLocalNotes();
      list.unshift(newNote);
      saveLocalNotes(list);
      return docRef.id;
    } catch (err: any) {
      console.warn('Firestore addDoc failed, creating in local fallback:', err);
      // Fallback local save
      const newId = `note-${Date.now()}`;
      const localNote: Note = {
        ...newNoteData,
        id: newId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const list = getLocalNotes();
      list.unshift(localNote);
      saveLocalNotes(list);

      if (err?.code === 'permission-denied') {
        console.error('Firestore Permission Denied: Cloud Firestore security rules are blocking writes. Please publish allow read, write rules in Firebase Console.');
      }
      return newId;
    }
  }

  // Fallback local save
  const newId = `note-${Date.now()}`;
  const localNote: Note = {
    ...newNoteData,
    id: newId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const list = getLocalNotes();
  list.unshift(localNote);
  saveLocalNotes(list);

  return newId;
}

/**
 * Update an existing Note
 */
export async function updateNote(id: string, formData: Partial<NoteFormData>): Promise<void> {
  const classDef = formData.className ? CLASSES.find((c) => c.name === formData.className) : undefined;
  const classSlug = classDef?.slug;
  const plainTextPreview = formData.content ? extractPlainText(formData.content, 180) : undefined;

  const updates: any = {
    ...formData,
    updatedAt: serverTimestamp(),
  };
  if (classSlug) updates.classSlug = classSlug;
  if (plainTextPreview !== undefined) updates.plainTextPreview = plainTextPreview;

  // Always update local storage
  const list = getLocalNotes();
  const index = list.findIndex((n) => n.id === id);
  if (index !== -1) {
    list[index] = {
      ...list[index],
      ...formData,
      classSlug: classSlug || list[index].classSlug,
      plainTextPreview: plainTextPreview || list[index].plainTextPreview,
      updatedAt: new Date(),
    };
    saveLocalNotes(list);
  }

  if (isConfigured && db) {
    try {
      const docRef = doc(db, NOTES_COLLECTION, id);
      await updateDoc(docRef, updates);
      return;
    } catch (err) {
      console.warn('Firestore updateDoc failed, updated local store only:', err);
    }
  }
}

/**
 * Toggle Note status between Draft and Published
 */
export async function toggleNoteStatus(id: string, currentStatus: NoteStatus): Promise<NoteStatus> {
  const newStatus: NoteStatus = currentStatus === 'published' ? 'draft' : 'published';
  await updateNote(id, { status: newStatus });
  return newStatus;
}

/**
 * Delete a Note
 */
export async function deleteNote(id: string): Promise<void> {
  const list = getLocalNotes().filter((n) => n.id !== id);
  saveLocalNotes(list);

  if (isConfigured && db) {
    try {
      const docRef = doc(db, NOTES_COLLECTION, id);
      await deleteDoc(docRef);
      return;
    } catch (err) {
      console.warn('Firestore deleteDoc failed, removed from local store only:', err);
    }
  }
}

/**
 * Search published notes across title, subject, content, and class
 */
export async function searchNotes(queryText: string): Promise<Note[]> {
  const cleanQuery = queryText.toLowerCase().trim();
  if (!cleanQuery) return [];

  const notes = await getPublishedNotes();
  return notes.filter(
    (n) =>
      n.title.toLowerCase().includes(cleanQuery) ||
      n.subject.toLowerCase().includes(cleanQuery) ||
      n.className.toLowerCase().includes(cleanQuery) ||
      n.plainTextPreview.toLowerCase().includes(cleanQuery)
  );
}

/**
 * Get distinct subjects present in published notes for a specific class
 */
export async function getSubjectsForClass(classNameOrSlug?: string): Promise<string[]> {
  const notes = await getPublishedNotes(
    classNameOrSlug?.startsWith('year-') ? { classSlug: classNameOrSlug } : { className: classNameOrSlug }
  );
  const subjects = new Set<string>();
  notes.forEach((n) => {
    if (n.subject) subjects.add(n.subject.trim());
  });
  return Array.from(subjects).sort();
}
