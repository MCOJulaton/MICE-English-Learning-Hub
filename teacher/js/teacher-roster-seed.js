/* ===================== TEACHER DASHBOARD — roster seed (no students) =====================
   This file is public on the website, so it holds NO student names, IDs, or
   grades. It only keeps the academic year, semester, and course shells that the
   dashboard code reads (see teacher-data.js). The real students live in
   Firestore behind the teacher login. The full roster for re-importing is kept
   privately in iCloud (MICE-Teaching-Files/private/teacher-roster-seed.FULL.js),
   never in this repository. */
const TEACHER_ROSTER_SEED = {
  academicYear: '2026',
  semester: '1',
  courses: [
    {
      courseId: 'mice',
      courseName: 'English for MICE Industries',
      courseCode: '6335417',
      groups: [
        {
          groupId: '1', schedule: 'Tue 13:30-17:30, Room 143',
          students: [
          ]
        },
        {
          groupId: '2', schedule: 'Tue 13:30-17:30, Room 143',
          students: [
          ]
        },
        {
          groupId: '3', schedule: 'Thu 8:30-12:30, Room 143',
          students: [
          ]
        },
        {
          groupId: '4', schedule: 'Thu 8:30-12:30, Room 143',
          students: [
          ]
        }
      ]
    },
    {
      courseId: 'wellness',
      courseName: 'English for Wellness Tourism',
      courseCode: '6335219',
      groups: [
        {
          groupId: '1', schedule: 'Wed 8:30-12:30, Room 142',
          students: [
          ]
        },
        {
          groupId: '2', schedule: 'Wed 8:30-12:30, Room 142',
          students: [
          ]
        }
      ]
    },
    {
      courseId: 'efc',
      courseName: 'English for Communication',
      courseCode: '9901104',
      groups: [
        {
          groupId: '28', schedule: 'Mon 13:30-15:30 Room 145, Wed 8:30-10:30 Room 1101',
          students: [
          ]
        }
      ]
    }
  ]
};
