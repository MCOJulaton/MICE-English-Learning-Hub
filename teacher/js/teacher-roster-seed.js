/* ===================== TEACHER DASHBOARD — real roster seed data =====================
   Transcribed directly from the official Phuket Rajabhat University "ENROLLED
   STUDENT LIST" exports (Academic Year 1/2026) for the three courses this
   dashboard covers. Gender is taken from the official Ms./Mr. title on each
   roster, not guessed from the name. GPAX is the cumulative GPA column from
   the same export, kept for reference only — it has no effect on any grade
   calculation in this course.

   This file only seeds the LOCAL backend (see teacher-data.js) so the
   dashboard has real students to navigate before a live Firebase project
   exists. Once Firestore is connected, this file is no longer read — the
   one-time import step in teacher-data.js copies it into Firestore and the
   app reads from there from then on. Safe to leave in the repo either way:
   it contains names and student ID numbers only, nothing graded. */
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
            { studentId:'6713773101', title:'Ms.', name:'Kamonwan Phomduang', gender:'F', gpax:3.36 },
            { studentId:'6713773102', title:'Mr.', name:'Kubro Suebphong', gender:'M', gpax:2.80 },
            { studentId:'6713773103', title:'Ms.', name:'Juntima Linkluan', gender:'F', gpax:3.78 },
            { studentId:'6713773104', title:'Ms.', name:'Chutamas Noi-sangiam', gender:'F', gpax:3.23 },
            { studentId:'6713773105', title:'Mr.', name:'Thitiphong Hemngam', gender:'M', gpax:3.13 },
            { studentId:'6713773107', title:'Mr.', name:'Natthakon Leklai', gender:'M', gpax:3.51 },
            { studentId:'6713773110', title:'Ms.', name:'Natthinee Martsri', gender:'F', gpax:3.01 },
            { studentId:'6713773111', title:'Ms.', name:'Papitchaya Nakpan', gender:'F', gpax:2.50 },
            { studentId:'6713773112', title:'Ms.', name:'Parisa Varintarawech', gender:'F', gpax:3.17 },
            { studentId:'6713773117', title:'Mr.', name:'Ratthapum Aemaot', gender:'M', gpax:3.03 },
            { studentId:'6713773118', title:'Ms.', name:'Vachiraya Lechay', gender:'F', gpax:3.05 },
            { studentId:'6713773119', title:'Mr.', name:'Weerayut Khaminthong', gender:'M', gpax:2.32 },
            { studentId:'6713773120', title:'Mr.', name:'Sivapat Luangphanang', gender:'M', gpax:3.09 },
            { studentId:'6713773123', title:'Ms.', name:'Sudaporn Thothip', gender:'F', gpax:3.26 },
            { studentId:'6713773124', title:'Ms.', name:'Sumon Ketthong', gender:'F', gpax:3.40 },
            { studentId:'6713773128', title:'Ms.', name:'Orakan Phunapisit', gender:'F', gpax:2.07 },
            { studentId:'6713773131', title:'Mr.', name:'Annasru Hayiyusoh', gender:'M', gpax:2.67 }
          ]
        },
        {
          groupId: '2', schedule: 'Tue 13:30-17:30, Room 143',
          students: [
            { studentId:'6713773201', title:'Ms.', name:'Kitriya Maiessara', gender:'F', gpax:2.78 },
            { studentId:'6713773202', title:'Ms.', name:'Kunlathida Muanchai', gender:'F', gpax:3.67 },
            { studentId:'6713773203', title:'Ms.', name:'Jutamart Jarupongsanon', gender:'F', gpax:2.46 },
            { studentId:'6713773204', title:'Ms.', name:'Chadaporn Koongammak', gender:'F', gpax:2.15 },
            { studentId:'6713773207', title:'Ms.', name:'Nitchakan Khanantai', gender:'F', gpax:1.88 },
            { studentId:'6713773211', title:'Ms.', name:'Tassanee Thinkohyao', gender:'F', gpax:2.73 },
            { studentId:'6713773212', title:'Ms.', name:'Nurulsuhada Binasae', gender:'F', gpax:2.84 },
            { studentId:'6713773213', title:'Ms.', name:'Pragaypech Naiemngam', gender:'F', gpax:2.40 },
            { studentId:'6713773215', title:'Ms.', name:'Panisa Kongsang', gender:'F', gpax:1.84 },
            { studentId:'6713773216', title:'Ms.', name:'Pitcha Vatcharapongsakorn', gender:'F', gpax:2.04 },
            { studentId:'6713773217', title:'Mr.', name:'Puriphat Pattano', gender:'M', gpax:2.32 },
            { studentId:'6713773218', title:'Ms.', name:'Ranchida Sawasdee', gender:'F', gpax:3.88 },
            { studentId:'6713773219', title:'Mr.', name:'Ramnarong Maraya', gender:'M', gpax:3.03 },
            { studentId:'6713773220', title:'Ms.', name:'Wanthani Buriphia', gender:'F', gpax:2.55 },
            { studentId:'6713773221', title:'Ms.', name:'Siriyamat Rotrueangrit', gender:'F', gpax:2.78 },
            { studentId:'6713773222', title:'Mr.', name:'Supachai Inrit', gender:'M', gpax:3.05 },
            { studentId:'6713773225', title:'Ms.', name:'Supaporn Jiaranai', gender:'F', gpax:2.65 },
            { studentId:'6713773226', title:'Ms.', name:'Aticha Tedkul', gender:'F', gpax:2.31 },
            { studentId:'6713773227', title:'Ms.', name:'Aniltita Truadnok', gender:'F', gpax:1.94 },
            { studentId:'6713773230', title:'Mr.', name:'Oatthaphon Sihasaen', gender:'M', gpax:2.76 },
            { studentId:'6713773231', title:'Ms.', name:'Atitaya Kamrairaksa', gender:'F', gpax:2.07 }
          ]
        },
        {
          groupId: '3', schedule: 'Thu 8:30-12:30, Room 143',
          students: [
            { studentId:'6715105101', title:'Ms.', name:'Konkamon Sangpakay', gender:'F', gpax:2.25 },
            { studentId:'6715105102', title:'Mr.', name:'Kittithat Rattanadilok Na Phuket', gender:'M', gpax:2.46 },
            { studentId:'6715105107', title:'Mr.', name:'Jirapad Luxsanavimol', gender:'M', gpax:2.51 },
            { studentId:'6715105111', title:'Ms.', name:'Natnicha Supaprot', gender:'F', gpax:2.67 },
            { studentId:'6715105113', title:'Ms.', name:'Nichaphat Nayao', gender:'F', gpax:2.76 },
            { studentId:'6715105116', title:'Mr.', name:'Teerapong Sutson', gender:'M', gpax:2.36 },
            { studentId:'6715105120', title:'Ms.', name:'Pilipda Nondon', gender:'F', gpax:1.83 },
            { studentId:'6715105123', title:'Mr.', name:'Ronnakorn Prasomkit', gender:'M', gpax:1.84 },
            { studentId:'6715105132', title:'Mr.', name:'Aekkawat Saelim', gender:'M', gpax:2.29 },
            { studentId:'6715105133', title:'Ms.', name:'Dusita Sukbanbon', gender:'F', gpax:3.23 },
            { studentId:'6812226120', title:'Ms.', name:'Pitchsinee Samdaeng', gender:'F', gpax:3.00 },
            { studentId:'6815105109', title:'Mr.', name:'Nattawut Inkhong', gender:'M', gpax:4.00 },
            { studentId:'6815105127', title:'Ms.', name:'Wararat Thongbeang', gender:'F', gpax:3.53 },
            { studentId:'6815105135', title:'Ms.', name:'Sirima Moratstian', gender:'F', gpax:3.75 },
            { studentId:'6815105139', title:'Mr.', name:'Aphisit Ngankhaeng', gender:'M', gpax:3.92 },
            { studentId:'6815105145', title:'Mr.', name:'Asron Che-ubon', gender:'M', gpax:1.65 },
            { studentId:'6815105147', title:'Ms.', name:'Hussana Wangmuang', gender:'F', gpax:3.32 }
          ]
        },
        {
          groupId: '4', schedule: 'Thu 8:30-12:30, Room 143',
          students: [
            { studentId:'6615105102', title:'Ms.', name:'Ketsara Napalat', gender:'F', gpax:2.32 },
            { studentId:'6715105208', title:'Ms.', name:'Yanatchara Thintale', gender:'F', gpax:2.57 },
            { studentId:'6715105210', title:'Ms.', name:'Natthicha Yaprang', gender:'F', gpax:3.50 },
            { studentId:'6715105211', title:'Mr.', name:'Nathaphat Nama', gender:'M', gpax:2.11 },
            { studentId:'6715105214', title:'Ms.', name:'Tidarat Chanasin', gender:'F', gpax:2.09 },
            { studentId:'6715105220', title:'Ms.', name:'Phetcharat Puangket', gender:'F', gpax:3.59 },
            { studentId:'6715105224', title:'Ms.', name:'Runchida Chimprasit', gender:'F', gpax:2.75 },
            { studentId:'6715105225', title:'Ms.', name:'Waranya Hassajag', gender:'F', gpax:2.52 },
            { studentId:'6715105227', title:'Ms.', name:'Sudarat Chanthakhian', gender:'F', gpax:3.07 },
            { studentId:'6715105228', title:'Ms.', name:'Suphawadi Ouechanya', gender:'F', gpax:2.58 },
            { studentId:'6715105230', title:'Ms.', name:'Aritsara Thanon', gender:'F', gpax:2.64 },
            { studentId:'6715105232', title:'Ms.', name:'Sirichada Namyen', gender:'F', gpax:3.02 },
            { studentId:'6815105103', title:'Ms.', name:'Jirattikarn Bornamron', gender:'F', gpax:3.92 },
            { studentId:'6815105134', title:'Ms.', name:'Sawittree Yanyun', gender:'F', gpax:3.19 },
            { studentId:'6815105137', title:'Ms.', name:'Saowalak Nayao', gender:'F', gpax:2.80 },
            { studentId:'6815105144', title:'Ms.', name:'Atsamaporn Bornamron', gender:'F', gpax:3.80 }
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
            { studentId:'6715105101', title:'Ms.', name:'Konkamon Sangpakay', gender:'F', gpax:2.25 },
            { studentId:'6715105102', title:'Mr.', name:'Kittithat Rattanadilok Na Phuket', gender:'M', gpax:2.46 },
            { studentId:'6715105106', title:'Ms.', name:'Chantra Plodphai', gender:'F', gpax:3.42 },
            { studentId:'6715105107', title:'Mr.', name:'Jirapad Luxsanavimol', gender:'M', gpax:2.51 },
            { studentId:'6715105111', title:'Ms.', name:'Natnicha Supaprot', gender:'F', gpax:2.67 },
            { studentId:'6715105113', title:'Ms.', name:'Nichaphat Nayao', gender:'F', gpax:2.76 },
            { studentId:'6715105115', title:'Ms.', name:'Thamonwan Chonlatee', gender:'F', gpax:2.26 },
            { studentId:'6715105116', title:'Mr.', name:'Teerapong Sutson', gender:'M', gpax:2.36 },
            { studentId:'6715105120', title:'Ms.', name:'Pilipda Nondon', gender:'F', gpax:1.83 },
            { studentId:'6715105123', title:'Mr.', name:'Ronnakorn Prasomkit', gender:'M', gpax:1.84 },
            { studentId:'6715105126', title:'Ms.', name:'Sasawan Junpakdee', gender:'F', gpax:2.59 },
            { studentId:'6715105128', title:'Mr.', name:'Surasak Prombut', gender:'M', gpax:2.65 },
            { studentId:'6715105130', title:'Ms.', name:'Onauma Arman', gender:'F', gpax:2.59 },
            { studentId:'6715105132', title:'Mr.', name:'Aekkawat Saelim', gender:'M', gpax:2.29 },
            { studentId:'6715105133', title:'Ms.', name:'Dusita Sukbanbon', gender:'F', gpax:3.23 },
            { studentId:'6715105134', title:'Ms.', name:'Ranrawe Rueangdech', gender:'F', gpax:2.81 },
            { studentId:'6715105135', title:'Ms.', name:'Prapassorn Suwantara', gender:'F', gpax:2.54 },
            { studentId:'6815105134', title:'Ms.', name:'Sawittree Yanyun', gender:'F', gpax:3.19 },
            { studentId:'6815105137', title:'Ms.', name:'Saowalak Nayao', gender:'F', gpax:2.80 }
          ]
        },
        {
          groupId: '2', schedule: 'Wed 8:30-12:30, Room 142',
          students: [
            { studentId:'6715105204', title:'Ms.', name:'Jaritchaya Saman', gender:'F', gpax:2.09 },
            { studentId:'6715105205', title:'Ms.', name:'Janraem Bona', gender:'F', gpax:2.73 },
            { studentId:'6715105206', title:'Ms.', name:'Jirapat Peakboot', gender:'F', gpax:2.53 },
            { studentId:'6715105208', title:'Ms.', name:'Yanatchara Thintale', gender:'F', gpax:2.57 },
            { studentId:'6715105209', title:'Ms.', name:'Thitima Tandhasri', gender:'F', gpax:2.44 },
            { studentId:'6715105210', title:'Ms.', name:'Natthicha Yaprang', gender:'F', gpax:3.50 },
            { studentId:'6715105211', title:'Mr.', name:'Nathaphat Nama', gender:'M', gpax:2.11 },
            { studentId:'6715105214', title:'Ms.', name:'Tidarat Chanasin', gender:'F', gpax:2.09 },
            { studentId:'6715105220', title:'Ms.', name:'Phetcharat Puangket', gender:'F', gpax:3.59 },
            { studentId:'6715105221', title:'Ms.', name:'Panthira Kongkaew', gender:'F', gpax:2.88 },
            { studentId:'6715105223', title:'Mr.', name:'Ronnaphum Wannasorn', gender:'M', gpax:2.96 },
            { studentId:'6715105224', title:'Ms.', name:'Runchida Chimprasit', gender:'F', gpax:2.75 },
            { studentId:'6715105225', title:'Ms.', name:'Waranya Hassajag', gender:'F', gpax:2.52 },
            { studentId:'6715105227', title:'Ms.', name:'Sudarat Chanthakhian', gender:'F', gpax:3.07 },
            { studentId:'6715105228', title:'Ms.', name:'Suphawadi Ouechanya', gender:'F', gpax:2.58 },
            { studentId:'6715105230', title:'Ms.', name:'Aritsara Thanon', gender:'F', gpax:2.64 },
            { studentId:'6715105232', title:'Ms.', name:'Sirichada Namyen', gender:'F', gpax:3.02 }
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
            { studentId:'6913744101', title:'Ms.', name:'Kamonchanok Tongtip', gender:'F', gpax:0 },
            { studentId:'6913744102', title:'Ms.', name:'Kanyanat Chanthawat', gender:'F', gpax:0 },
            { studentId:'6913744103', title:'Mr.', name:'Kerkkiaet Chumpon', gender:'M', gpax:0 },
            { studentId:'6913744104', title:'Ms.', name:'Khodiya Mukhura', gender:'F', gpax:0 },
            { studentId:'6913744105', title:'Ms.', name:'Chuthamanee Ramphun', gender:'F', gpax:0 },
            { studentId:'6913744106', title:'Ms.', name:'Saneeya Dokyeeson', gender:'F', gpax:0 },
            { studentId:'6913744107', title:'Ms.', name:'Tikamphon Paewpairee', gender:'F', gpax:0 },
            { studentId:'6913744108', title:'Ms.', name:'Nattakrita Srinaowarat', gender:'F', gpax:0 },
            { studentId:'6913744110', title:'Mr.', name:'Nattapat Phakkunnan', gender:'M', gpax:0 },
            { studentId:'6913744111', title:'Ms.', name:'Tithipphayanipha Simachany', gender:'F', gpax:0 },
            { studentId:'6913744112', title:'Ms.', name:'Thidathip Changsaeng', gender:'F', gpax:0 },
            { studentId:'6913744113', title:'Ms.', name:'Natchami Chamnanwethi', gender:'F', gpax:0 },
            { studentId:'6913744114', title:'Ms.', name:'Nasreen Kongsin', gender:'F', gpax:0 },
            { studentId:'6913744115', title:'Ms.', name:'Ninlanee Supmak', gender:'F', gpax:0 },
            { studentId:'6913744116', title:'Ms.', name:'Nurarsikin Hwangbu', gender:'F', gpax:0 },
            { studentId:'6913744117', title:'Ms.', name:'Nureeda Bortoei', gender:'F', gpax:0 },
            { studentId:'6913744119', title:'Mr.', name:'Pavaonrat Srirak', gender:'M', gpax:0 },
            { studentId:'6913744121', title:'Ms.', name:'Pinnicha Saetan', gender:'F', gpax:0 },
            { studentId:'6913744122', title:'Ms.', name:'Panida Songkun', gender:'F', gpax:0 },
            { studentId:'6913744123', title:'Ms.', name:'Phetwadee Rueangphetr', gender:'F', gpax:0 },
            { studentId:'6913744124', title:'Ms.', name:'Fadear Chemah', gender:'F', gpax:0 },
            { studentId:'6913744125', title:'Ms.', name:'Phakkharamai Phokha', gender:'F', gpax:0 },
            { studentId:'6913744126', title:'Ms.', name:'Mareeya Krueasob', gender:'F', gpax:0 },
            { studentId:'6913744127', title:'Ms.', name:'Ruangmanee Kongpan', gender:'F', gpax:0 },
            { studentId:'6913744128', title:'Ms.', name:'Russanee Waewwanchit', gender:'F', gpax:0 },
            { studentId:'6913744129', title:'Ms.', name:'Wannaporn Sae-tan', gender:'F', gpax:0 },
            { studentId:'6913744131', title:'Ms.', name:'Sasikan Thimkorn', gender:'F', gpax:0 },
            { studentId:'6913744132', title:'Ms.', name:'Sirorat Mankun', gender:'F', gpax:0 },
            { studentId:'6913744133', title:'Mr.', name:'Suphakit Lirum', gender:'M', gpax:0 },
            { studentId:'6913744134', title:'Ms.', name:'Samantachida Jitchoy', gender:'F', gpax:0 },
            { studentId:'6913744135', title:'Ms.', name:'Honglada Nooim', gender:'F', gpax:0 },
            { studentId:'6913744136', title:'Mr.', name:'Aphichai Limsakun', gender:'M', gpax:0 },
            { studentId:'6913744137', title:'Ms.', name:'Amonrat Tasang', gender:'F', gpax:0 },
            { studentId:'6913744138', title:'Ms.', name:'Orratai Somsak', gender:'F', gpax:0 },
            { studentId:'6913744139', title:'Ms.', name:'Alisa Samah', gender:'F', gpax:0 },
            { studentId:'6913744140', title:'Ms.', name:'Atittaya Chupradid', gender:'F', gpax:0 },
            { studentId:'6913744141', title:'Mr.', name:'Arnan', gender:'M', gpax:0 }
          ]
        }
      ]
    }
  ]
};
