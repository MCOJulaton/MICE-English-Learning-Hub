/* ===================== UNIT 6 CONTENT DATA =====================
   English for Wellness Tourism — Unit 6: Reservations & Appointments
   Sourced verbatim from the course workbook. Nothing here is UI logic —
   see app.js for rendering/state/voice/progress-tracking. */

const VOCAB = [
  {w:'reservation', t:'n.', d:'an arrangement to hold a service or accommodation in advance'},
  {w:'appointment', t:'n.', d:'a scheduled time for a meeting, treatment, or service'},
  {w:'booking', t:'n.', d:'the act of arranging and confirming a service or accommodation'},
  {w:'availability', t:'n.', d:'whether a time slot or service is free and can be booked'},
  {w:'confirmation', t:'n.', d:'a message or document proving that a booking has been accepted'},
  {w:'cancellation', t:'n.', d:'informing a business that a reservation will no longer be needed'},
  {w:'deposit', t:'n.', d:'a partial payment made in advance to secure a booking'},
  {w:'rate', t:'n.', d:'the price charged for a service, room, or treatment'},
  {w:'preference', t:'n.', d:'something a guest particularly likes or requests for their stay'},
  {w:'dietary requirement', t:'n.', d:'a food restriction based on health, religion, or personal choice'},
  {w:'amendment', t:'n.', d:'a change made to an existing reservation or booking'},
  {w:'waitlist', t:'n.', d:'a list of people waiting for a service when fully booked'},
  {w:'no-show', t:'n.', d:'when a guest fails to arrive for their reservation without cancelling'},
  {w:'peak season', t:'n.', d:'the time of year when a resort receives the most visitors'},
  {w:'exclusive', t:'adj.', d:'available only to a limited number of guests; luxurious and private'}
];
const CORE_VOCAB_IDS = ['reservation','confirmation','cancellation','availability','rate','dietary requirement','amendment','no-show'];

/* Activity 1 — Matching (Section 2, exact 8 pairs) */
const MATCH_PAIRS = [
  {id:'reservation', word:'reservation', meaning:'an arrangement to hold a service or accommodation in advance'},
  {id:'confirmation', word:'confirmation', meaning:'proof that a booking has been accepted and recorded'},
  {id:'cancellation', word:'cancellation', meaning:'informing a business that a booking is no longer needed'},
  {id:'availability', word:'availability', meaning:'whether a time slot is free and can be booked'},
  {id:'rate', word:'rate', meaning:'the price charged for a service or accommodation'},
  {id:'dietary', word:'dietary requirement', meaning:'a food restriction based on health or personal choice'},
  {id:'amendment', word:'amendment', meaning:'a change made to an existing reservation'},
  {id:'noshow', word:'no-show', meaning:'when a guest fails to arrive without cancelling'}
];

/* Activity 2 — Fill in the Blank (exact 8 sentences) */
const FILL_BLANK = [
  {q:'I would like to make a __________ for a Thai herbal massage at 3 p.m. on Saturday.', a:'reservation'},
  {q:"Do you have any __________ for a couple's package this coming weekend?", a:'availability'},
  {q:'A 30% __________ is required to confirm your booking. The remaining balance is due on arrival.', a:'deposit'},
  {q:'The guest requested an __________ to change her appointment from Friday to Saturday afternoon.', a:'amendment'},
  {q:'Please inform us of any __________ at the time of booking so we can prepare accordingly.', a:'dietary requirement'},
  {q:'You will receive a __________ email with all your booking details within 24 hours.', a:'confirmation'},
  {q:'During __________, we recommend booking spa treatments at least one week in advance.', a:'peak season'},
  {q:'Unfortunately, the couple\'s suite is fully booked. Would you like to be placed on our __________?', a:'waitlist'}
];

/* Section 3 — Reading: reservation form fields <-> professional phone phrases */
const PHONE_PHRASES = [
  {field:'Guest Name', phrase:'May I have your full name, please?'},
  {field:'Contact Number', phrase:'Could I take a contact number for your booking?'},
  {field:'Date of Reservation', phrase:'Which date would you like to book?'},
  {field:'Time of Appointment', phrase:'What time would you prefer?'},
  {field:'Service Requested', phrase:'Which treatment or service would you like to book?'},
  {field:'Number of Guests', phrase:'Will this be for one guest or more?'},
  {field:'Special Preferences', phrase:'Do you have any special requests or preferences?'},
  {field:'Dietary Requirements', phrase:'Are there any dietary requirements we should note?'},
  {field:'Deposit / Payment', phrase:'A 30% deposit is required to confirm. How would you like to pay?'},
  {field:'Confirmation Sent', phrase:'You will receive a confirmation to your email shortly.'}
];
const POLITE_FORMS = [
  {direct:"What's your name?", polite:'May I have your full name, please?'},
  {direct:'When do you want it?', polite:'Which date would you prefer?'},
  {direct:'Do you have allergies?', polite:'Are there any dietary requirements we should note?'},
  {direct:'How will you pay?', polite:'How would you like to settle the deposit?'}
];
const RESERVATION_DISCUSSION = [
  {tag:'Situation 1', text:'The guest wants a treatment, but the time they requested is fully booked.', model:'"I\'m sorry, that time is fully booked. May I suggest a different time, or would you like to join our waitlist?"'},
  {tag:'Situation 2', text:'The guest needs to cancel their appointment two hours before it is scheduled to start.', model:'"Of course, I can process that cancellation for you right away."'},
  {tag:'Situation 3', text:'The guest calls to change their booking from a single massage to a couple\'s suite.', model:'"Certainly! Let me update your reservation right away."'}
];

/* Section 4 — Listening: Making a Spa Reservation, Harmony Wellness Spa */
const LISTEN = {
  intro: 'Wan, at the reservation desk of Harmony Wellness Spa, takes a booking call from Ms. Emily Parker.',
  lines: [
    {who:'Wan', kind:'staff', text:'Good morning, Harmony Wellness Spa, reservation desk. This is Wan speaking. How may I help you today?'},
    {who:'Ms. Parker', kind:'delegate', text:'Good morning, Wan. My name is Emily Parker. I am staying at your resort this weekend and I would like to make a reservation for two spa treatments.'},
    {who:'Wan', kind:'staff', text:'Of course, Ms. Parker! I would be happy to help you. Could I just confirm your room number, please?'},
    {who:'Ms. Parker', kind:'delegate', text:'Yes, I am in Room 14, the Garden Suite.'},
    {who:'Wan', kind:'staff', text:'Thank you. Now, which treatments were you interested in?'},
    {who:'Ms. Parker', kind:'delegate', text:"I would like two Swedish massages, one for myself and one for my husband. If possible, could we have them at the same time in a couple's suite?"},
    {who:'Wan', kind:'staff', text:"What a lovely idea! We do have a couple's treatment room. Which day and time would you prefer?"},
    {who:'Ms. Parker', kind:'delegate', text:'We were thinking Saturday afternoon, around 2 p.m. if possible.'},
    {who:'Wan', kind:'staff', text:"Let me check availability for Saturday at 2 p.m.... Good news! The couple's suite is available at that time. Each Swedish massage is 90 minutes, so you would finish at 3:30 p.m."},
    {who:'Ms. Parker', kind:'delegate', text:'Perfect. Is there anything I should know before the session?'},
    {who:'Wan', kind:'staff', text:'Yes, please arrive 15 minutes early to change and relax beforehand, avoid heavy meals within one hour of your treatment, and let us know if you have any allergies or areas to avoid.'},
    {who:'Ms. Parker', kind:'delegate', text:'Good to know. I am actually allergic to nut-based oils.'},
    {who:'Wan', kind:'staff', text:'Thank you for letting me know. I will note that in your booking and ensure only coconut or sesame oil is used. Is there anything else?'},
    {who:'Ms. Parker', kind:'delegate', text:'Could I ask about the rate for the couple\'s session?'},
    {who:'Wan', kind:'staff', text:"Certainly. The couple's Swedish massage is 5,500 baht per person, which includes access to the steam room and complimentary herbal tea service before and after."},
    {who:'Ms. Parker', kind:'delegate', text:'That sounds wonderful. Please go ahead and confirm the booking.'},
    {who:'Wan', kind:'staff', text:"Wonderful! So I have confirmed a couple's Swedish massage in our couple's suite, this Saturday at 2 p.m., with coconut or sesame oil only. You will receive a confirmation to your registered email shortly. Is there anything else I can help you with?"},
    {who:'Ms. Parker', kind:'delegate', text:'No, that is everything. Thank you so much, Wan. You have been very helpful.'},
    {who:'Wan', kind:'staff', text:'It is my pleasure, Ms. Parker. We look forward to welcoming you both on Saturday. Have a wonderful day!'}
  ]
};
/* The interactive reservation form — the student must LISTEN and type each
   field. Checked case-insensitively against a short list of accepted forms
   (not one rigid string) so a reasonable typed answer is not marked wrong. */
const RESERVATION_FIELDS = [
  {id:'name', label:'Guest Name', accept:['emily parker','parker','ms parker','ms. parker']},
  {id:'room', label:'Room Number', accept:['14','room 14']},
  {id:'service', label:'Service Requested', accept:['swedish massage','massage','couples swedish massage']},
  {id:'day', label:'Day', accept:['saturday']},
  {id:'time', label:'Time', accept:['2pm','2 pm','2:00pm','2 p.m.','14:00']},
  {id:'rate', label:'Rate (per person)', accept:['5500 baht','5500','5,500 baht','5,500']}
];

/* Section 5 — Real-World Challenges (workbook Activity4 + Section5 extras) */
/* Reshaped from a reveal-only bank into choice + why, matching the
   mechanic Section 6 (Spa Booking Challenge) already proves works
   (SPA_CHALLENGES below). Challenges 1-3 are Ms. Parker calling back
   about her own Saturday couple's booking from LISTEN above; 4-6 stay
   with a different, unnamed guest since her own transcript doesn't
   cover a group booking or an early cancellation. */
const CHALLENGES = [
  {tag:'Challenge 1', guest:'"Hi, this is Emily Parker again. Could we possibly move our Saturday session to 3:30 instead of 2:00? Something has come up."',
    options:[
      {t:'"I\'m sorry, that time is fully booked. May I suggest a different time, or would you like to join our waitlist?"', correct:true},
      {t:'"Sorry, no."'},
      {t:'"That time is not possible."'}
    ],
    why:'A polite refusal always comes with an alternative or a waitlist offer, not a flat no.'},
  {tag:'Challenge 2', guest:'"I am so sorry, but my husband is not feeling well. Can we cancel today\'s session? It is in about two hours."',
    options:[
      {t:'"Of course, I can process that cancellation for you right away. I hope he feels better soon."', correct:true},
      {t:'"Why is he not feeling well?"'},
      {t:'"You cannot cancel this close to the appointment."'}
    ],
    why:'A short-notice cancellation still gets a polite, immediate response, not an interrogation or a flat refusal.'},
  {tag:'Challenge 3', guest:'"Could we change our booking from Swedish massage to Aromatherapy instead? Same time, same couple\'s suite."',
    options:[
      {t:'"Certainly! Let me update your reservation to Aromatherapy for both of you, keeping your Saturday 2 p.m. slot."', correct:true},
      {t:'"That is a completely different booking, you will need to cancel and start again."'},
      {t:'"Sure." (without confirming the details back to her)'}
    ],
    why:'A service change is a normal update, not a whole new booking, and the details should be confirmed back to the guest.'},
  {tag:'Challenge 4', guest:'"Hello, I would like to book a yoga session for a group of 6 people, next Tuesday morning."',
    options:[
      {t:'"Let me check our group availability for Tuesday morning. I will confirm a time that works for everyone."', correct:true},
      {t:'"We do not usually do groups, but I will see what I can do."'},
      {t:'"You will each need to book separately."'}
    ],
    why:'Group requests are handled directly, checking availability rather than deflecting or forcing separate bookings.'},
  {tag:'Challenge 5', guest:'"I need to cancel my booking. It is 3 days before the appointment."',
    options:[
      {t:'"No problem at all. Since this is more than 24 hours in advance, there is no cancellation fee."', correct:true},
      {t:'"There is always a cancellation fee, no exceptions."'},
      {t:'"I will have to check with my manager and call you back."'}
    ],
    why:'Knowing the cancellation policy means you can answer this immediately and accurately, not guess or stall.'},
  {tag:'Challenge 6', guest:'"Could you add me to the waitlist for the herbal treatment? I heard it is fully booked."',
    options:[
      {t:'"Of course. I have added you to our waitlist. We will contact you immediately if a spot becomes available."', correct:true},
      {t:'"It is fully booked, so there is nothing I can do."'},
      {t:'"Try calling back another day."'}
    ],
    why:'A waitlist is exactly the professional response to a fully booked service, not a dead end.'}
];

/* Section 6 (NEW) — Signature game: SPA BOOKING CHALLENGE
   Harmony Wellness Spa is the same fictional spa introduced in the
   Section 4 listening. The student works the reservation desk: take a
   real booking end to end, then handle five realistic follow-up requests. */
const SPA_MENU = [
  {id:'thai', name:'Thai Massage', duration:'90 min', price:'2,200 baht'},
  {id:'swedish', name:'Swedish Massage', duration:'90 min', price:'2,600 baht'},
  {id:'compress', name:'Herbal Compress', duration:'90 min', price:'2,400 baht'},
  {id:'aroma', name:'Aromatherapy', duration:'60 min', price:'1,800 baht'},
  {id:'yoga', name:'Yoga Session', duration:'60 min', price:'900 baht'}
];
const SPA_SCHEDULE = [
  {time:'9:00', status:'available'},
  {time:'10:30', status:'booked'},
  {time:'12:00', status:'available'},
  {time:'2:00', status:'available'},
  {time:'3:30', status:'booked'},
  {time:'5:00', status:'available'}
];
const SPA_GUEST_REQUEST = "Hi, I'd like to book a Thai massage for two people on Saturday afternoon.";
const SPA_BOOKING_STEPS = [
  {id:'service', prompt:'What service is the guest asking for?',
    options:[{t:'Thai Massage', correct:true},{t:'Swedish Massage'},{t:'Aromatherapy'}]},
  {id:'count', prompt:'How many guests need to be booked?',
    options:[{t:'One guest'},{t:'Two guests', correct:true},{t:'A group of four'}]},
  {id:'time', prompt:'The guest wants Saturday afternoon. Looking at the schedule, which time should you offer?',
    options:[{t:'3:30 p.m.'},{t:'2:00 p.m.', correct:true},{t:'10:30 a.m.'}]},
  {id:'ask', prompt:"How should you ask for the guest's name and a contact number?",
    options:[
      {t:'"May I have your name and a contact number, please?"', correct:true},
      {t:'"What\'s your name and number?"'},
      {t:'"Name and number."'}
    ]},
  {id:'special', prompt:'What should you check before you confirm the booking?',
    options:[
      {t:'"Do you have any allergies or preferences we should know about?"', correct:true},
      {t:'Nothing, just confirm the booking.'},
      {t:'"What is your favourite type of music?"'}
    ]}
];
const SPA_CHALLENGES = [
  {tag:'Challenge 1', guest:'"Actually, could we come at 3:30 instead? That works much better for us."',
    options:[
      {t:'"I\'m sorry, that time is fully booked. May I suggest 2:00, or would you like to join our waitlist?"', correct:true},
      {t:'"Sorry, no."'},
      {t:'"That time is not possible."'}
    ],
    why:'3:30 is already booked. The professional response offers an alternative time or a waitlist spot, politely.'},
  {tag:'Challenge 2', guest:'"I am so sorry, but something has come up. Can we cancel our booking?"',
    options:[
      {t:'"Of course, I can process that cancellation for you right away."', correct:true},
      {t:'"Why do you want to cancel?"'},
      {t:'"You cannot cancel now."'}
    ],
    why:'A polite, immediate response is the professional way to handle a cancellation request.'},
  {tag:'Challenge 3', guest:'"Could we move our appointment to 5:00 instead of 2:00?"',
    options:[
      {t:'"Let me check availability for 5:00... Yes, that time is open. I will update your booking right away."', correct:true},
      {t:'"No, the time is fixed once it is booked."'},
      {t:'"Sure, I will just change it." (without checking the schedule)'}
    ],
    why:'Always check availability on the schedule before confirming a time change.'},
  {tag:'Challenge 4', guest:'"If 3:30 opens up, could you let us know?"',
    options:[
      {t:'"Of course. I have added you to our waitlist. We will contact you immediately if a spot becomes available."', correct:true},
      {t:'"We don\'t offer that."'},
      {t:'"Just call back later and check."'}
    ],
    why:'Offering the waitlist and confirming a follow-up is the professional way to handle a fully booked time.'},
  {tag:'Challenge 5', guest:'"One more thing, I am allergic to nut-based oils."',
    options:[
      {t:'"Thank you for letting me know. I will note that and make sure only nut-free oil is used."', correct:true},
      {t:'"That should be fine, don\'t worry about it."'},
      {t:'(say nothing and move on)'}
    ],
    why:'A guest\'s special requirement must always be acknowledged and noted, never ignored.'}
];

/* Section 8 (NEW) — Writing: Reservation Confirmation Email */
const WRITING_TASK = {
  prompt: "Write a short confirmation email to a guest after taking their spa reservation. Use the booking from Section 4, the Spa Booking Challenge, or one of the situations below.",
  situations: [
    {tag:'Situation A', text:"Ms. Parker booked a couple's Swedish massage for Saturday at 2 p.m."},
    {tag:'Situation B', text:'A guest booked a Thai massage for two people on Saturday at 2:00 p.m.'},
    {tag:'Situation C', text:'A guest booked a yoga session for a group of six on Tuesday morning.'}
  ],
  usefulPhrases: [
    'Dear [Guest Name],',
    'Thank you for booking with Harmony Wellness Spa.',
    'This email confirms your reservation for...',
    'Date: ... / Time: ... / Service: ...',
    'A deposit of ... is required to secure your booking.',
    'If you need to make any changes, please contact us at least 24 hours in advance.',
    'We look forward to welcoming you.',
    'Warm regards,'
  ]
};

/* Final performance — "Can I Handle This Booking?" */
const ROLEPLAY = {
  a:{title:'Student A: Reservation Desk', body:'You work at the reservation desk of Harmony Wellness Spa. Take the reservation, confirm all details, and close the call professionally.',
    phrases:['Good morning / afternoon, ... Spa, reservation desk.', 'Which treatment would you like to book?', 'Let me check availability for...', 'A deposit of... is required to confirm.', 'You will receive a confirmation email shortly.']},
  b:{title:'Student B: Caller', body:'You are calling to book a wellness treatment.', phrases:['I would like to book a...', 'Do you have availability for...?', 'I should mention that I...', 'Could I ask about the rate for...?', 'Could you confirm that the booking is for...?']}
};

/* Section 6 — Reflection (Section 7 Can-Do statements, verbatim) */
const REFLECTION = [
  'I can make and take a wellness tourism reservation call professionally in English.',
  'I can confirm all key reservation details: name, date, time, service, and preferences.',
  'I can handle changes, cancellations, and waitlist situations with polite language.',
  'I can write a short confirmation email for a wellness tourism booking.'
];

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Reservation Vocabulary'},
  {key:'s2', label:'Vocabulary In Context'},
  {key:'s3', label:'Reading: Phone Phrases'},
  {key:'s4', label:'The Reservation Call'},
  {key:'s5', label:'Real-World Challenges'},
  {key:'s5b', label:'Spa Booking Challenge'},
  {key:'s6', label:'Final Performance'},
  {key:'s6b', label:'Writing: Confirmation Email'},
  {key:'s7', label:'Self-Check'},
  {key:'complete', label:'Complete'}
];

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for Wellness Tourism',
  courseCode: 'wellness',
  unit: 'Unit 6: Reservations & Appointments',
  unitCode: 'unit-6'
};

/* ===================== TAKE-HOME ASSET ===================== */
const STUDY_GUIDE_DATA_URI = "../../../assets/study-guide/Unit6-Reservations-Appointments-Study-Guide.jpg";
const STUDY_GUIDE_FILENAME = "Unit6-Reservations-Appointments-Study-Guide.jpg";

/* ===================== SECTION PHOTOS =====================
   Paths are relative to /courses/wellness/unit-6/index.html. */
const SECTION_PHOTOS = {
  hero: { src:'../../../assets/images/wt-u6-hero.jpg', alt:'A wellness spa staff member taking a reservation by phone and computer' },
  phone: { src:'../../../assets/images/wt-u6-phone.jpg', alt:'A resort staff member smiling while speaking on the phone' },
  confirm: { src:'../../../assets/images/wt-u6-confirm.jpg', alt:'A staff member typing a booking confirmation at a reception desk' }
};
