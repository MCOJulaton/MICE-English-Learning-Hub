/* ===================== MIDTERM EXAM — access lock =====================
   Single source of truth for whether the Midterm Exam is open to
   students. Loaded by the Midterm Exam pages themselves (the hub and all
   three course detail pages) AND by the Quiz Hub, so its "Midterm Exam"
   card shows as locked too, everywhere in sync.

   Flip to false when you want students to be able to open the exam
   pages. */
const MIDTERM_EXAM_LOCKED = true;
