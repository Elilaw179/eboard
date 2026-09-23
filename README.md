# EBoard — Student Digital Notes Portal (ClassBoard)

**EBoard** is a modern, responsive digital classroom notes platform designed for teachers and students. It replaces the physical whiteboard hassle by allowing teachers to author, paste from Microsoft Word, and publish lessons from an administrative dashboard, while students can visit without an account, choose their year group (Year 7 to Year 12), and read, project, and copy notes with ease.

---

## Features

### For Students
* **No Account Required**: Direct, friction-free access to lessons.
* **Modern Classroom Aesthetic**: Designed like a clean projected whiteboard / A4 sheet document, not a corporate business dashboard.
* **Six Year Groups Supported**: Year 7, Year 8, Year 9, Year 10, Year 11, and Year 12 with dedicated curriculums and custom educational iconography.
* **Dynamic Subject Filter**: Filter by Computer Science, Robotics, Physics, Mathematics, Science, English, etc.
* **The Digital Classroom Board**:
  * Clean centered white document canvas with comfortable typography, line spacing, code blocks, tables, and lists.
  * **Focus / Projector Mode**: 1-click toggle that hides distractions, maximizes reading space, and enhances typography contrast for classroom projectors.
  * **1-Click Copy Note & Free Selection**: Unrestricted text selection (Ctrl+C and right-click fully supported) + 1-click "Copy Note" button.
  * **Print-Ready**: Clean `@media print` CSS removes navigation and headers when printing or saving as PDF.
  * **Search**: Instant search across titles, subjects, year groups, and note text.

### For Teachers & Administrators
* **Secure Teacher Login**: Email + Password authentication (`/admin/login`).
* **Microsoft Word Compatibility**: TipTap rich-text editor parses complex Word clipboard HTML cleanly (preserving bold, italics, underline, headings, lists, tables, and colors).
* **Word-Style Toolbar**:
  * Headings (H1, H2, H3), Paragraph
  * Bold, Italic, Underline, Strikethrough
  * Align Left, Center, Right, Justify
  * Bullet Lists, Numbered Lists, Blockquotes, Code Blocks, Horizontal Dividers
  * Text Color & Highlighting
  * Tables (Insert 3x3, Add/Delete Rows & Columns)
  * Image / Diagram upload
* **Draft & Publish States**: Drafts are completely hidden from students until published.
* **Class & Subject Management**: Class dropdown (Year 7 - 12) and dynamic subject tagging.
* **Overview Metrics**: Total Notes, Published Notes, Draft Notes, and per-class note breakdown.

---

## Technology Stack
* **Framework**: Next.js 14+ (App Router)
* **Language**: TypeScript
* **Rich Text Editor**: TipTap (ProseMirror engine with Word paste compatibility)
* **Styling**: Tailwind CSS + `@tailwindcss/typography`
* **Icons**: Lucide React
* **Backend**: Firebase Authentication, Cloud Firestore, Firebase Storage

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Firebase project credentials from the [Firebase Console](https://console.firebase.google.com/):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

*Note: EBoard includes a local demo data engine out of the box, allowing you to run and test immediately even before setting up Firebase credentials!*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Teacher / Admin Credentials
* **Login URL**: `/admin/login` (also linked subtly in the footer)
* **Demo / Testing Credentials**:
  * Email: `teacher@eboard.edu`
  * Password: `admin123`

---

## Firebase Security Rules
Production-grade security rules are included in the repository:
* `firestore.rules`: Students can **only read** published notes. Only authenticated teachers can read drafts or perform write/update/delete operations.
* `storage.rules`: Educational diagrams in `/note-images` are readable by students, but uploads require teacher authentication, must be image types, and are capped at 5MB.

To deploy security rules to Firebase:
```bash
firebase deploy --only firestore:rules,storage
```

---

## Deployment to Vercel
1. Push your repository to GitHub or GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. Add the `NEXT_PUBLIC_FIREBASE_*` environment variables in the Vercel project settings.
4. Deploy!
