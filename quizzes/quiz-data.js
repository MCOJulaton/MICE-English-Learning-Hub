/* ===================== QUIZ HUB REGISTRY — single source of truth =====================
   Course -> Unit -> Quiz. Every question is drawn from that unit's own real
   lesson content (vocabulary, quick-review banks, etc.) already built into
   the site — nothing invented from scratch. Add a new quiz by adding a new
   object here; host.html/play.html/index.html all read from this file.
   Each question: {q, answers:[...], correct: index, timeLimit: seconds}
   Locked quizzes mirror that unit's lock status elsewhere on the site
   (Practice Hub, Downloads Hub, course listing) — same data-soon-msg pattern. */
const QUIZ_REGISTRY = [
  {
    course: 'English for MICE',
    courseCode: 'mice',
    icon: '🏢',
    quizzes: [
      {
        id: 'mice-u4', unitCode: 'unit-4', unit: 'Unit 4: Professional Greetings & Networking',
        title: 'Professional Greetings & Networking', locked: false,
        questions: [
          {q:'"Rapport" means:', answers:['A type of business card','A warm, comfortable relationship built through good communication','A formal complaint'], correct:1, timeLimit:20},
          {q:'Which word means "an activity or question to help people start conversations"?', answers:['Icebreaker','Handshake','Reception'], correct:0, timeLimit:15},
          {q:'"He gave a confident _____ and held eye contact throughout."', answers:['name tag','handshake','exchange'], correct:1, timeLimit:15},
          {q:'"First impression" means:', answers:['A recognizable place','The opinion formed about someone the first time you meet them','A type of email'], correct:1, timeLimit:20},
          {q:'Which word means "to go up to someone and begin speaking to them"?', answers:['Approach','Follow up','Colleague'], correct:0, timeLimit:15},
          {q:'"Small talk" is best described as:', answers:['A formal business negotiation','Light, polite conversation about everyday topics','An angry disagreement'], correct:1, timeLimit:20},
          {q:'Which word means "to contact someone after a meeting to continue the conversation"?', answers:['Exchange','Follow up','Greet'], correct:1, timeLimit:15},
          {q:'A "colleague" is:', answers:['A person who works in the same field as you','A stranger at an event','Your teacher'], correct:0, timeLimit:15}
        ]
      },
      {
        id: 'mice-u5', unitCode: 'unit-5', unit: 'Unit 5: Giving Directions at Events',
        title: 'Giving Directions at Events', locked: false,
        questions: [
          {q:'"Entrance" means:', answers:['The door you use to leave','The door you use to enter','A long passageway'], correct:1, timeLimit:15},
          {q:'Which word means "a moving staircase"?', answers:['Elevator','Escalator','Corridor'], correct:1, timeLimit:15},
          {q:'"The registration desk is _____ the main entrance" (directly facing it).', answers:['next to','opposite','just past'], correct:1, timeLimit:20},
          {q:'Which phrase means "continue in the same direction"?', answers:['Turn left','Go straight ahead','Turn right'], correct:1, timeLimit:15},
          {q:'"Landmark" means:', answers:['A recognizable place that helps you find your way','A type of elevator','A business card'], correct:0, timeLimit:20},
          {q:'"Turn right _____ the end of the corridor."', answers:['next to','at','opposite'], correct:1, timeLimit:15},
          {q:'"Signage" means:', answers:['A business card','Signs and arrows that give directions','A floor level'], correct:1, timeLimit:15},
          {q:'Which word means "immediately beside"?', answers:['Opposite','Next to','Just past'], correct:1, timeLimit:15}
        ]
      },
      {
        id: 'mice-u6', unitCode: 'unit-6', unit: 'Unit 6: Schedules & Time',
        title: 'Schedules & Time', locked: true, lockMsg: 'Unit 6 will open before its class session.',
        questions: [
          {q:'Which word means "to continue beyond the planned finishing time"?', answers:['Postponed','Overrun','Delayed','Canceled'], correct:1, timeLimit:20},
          {q:'A "run sheet" is:', answers:['A minute-by-minute plan used by event staff on the day','A guest list','A type of ticket','A seating chart'], correct:0, timeLimit:20},
          {q:'"Punctual" means:', answers:['Arriving late','Arriving or starting at the agreed time','Cancelling a meeting','Speaking loudly'], correct:1, timeLimit:20},
          {q:'Which word means "officially moved to a later date, but it will still happen"?', answers:['Canceled','Postponed','Delayed','Overrun'], correct:1, timeLimit:20},
          {q:'An "interval" is:', answers:['A minute-by-minute plan','A planned pause or break between parts of an event','A type of announcement','A guest complaint'], correct:1, timeLimit:20},
          {q:'"The keynote speaker has _____ by 15 minutes."', answers:['delayed','overrun','postponed','canceled'], correct:1, timeLimit:20},
          {q:'Which word means "the total length of time a session lasts"?', answers:['Time slot','Duration','Schedule','Interval'], correct:1, timeLimit:20},
          {q:'"The evening banquet has been _____ due to the storm." (it will NOT happen at all)', answers:['postponed','delayed','canceled','overrun'], correct:2, timeLimit:20}
        ]
      }
    ]
  },
  {
    course: 'English for Communication',
    courseCode: 'communication',
    icon: '💬',
    quizzes: [
      {
        id: 'comm-u5', unitCode: 'unit-5', unit: 'Unit 5: My Daily Routine',
        title: 'My Daily Routine', locked: false,
        questions: [
          {q:'Choose the correct sentence.', answers:['I usually wakes up at 6.','I usually wake up at 6.','I usual wake up at 6.','I waking up at 6 usually.'], correct:1, timeLimit:20},
          {q:'Which word starts describing the FIRST thing you do?', answers:['Finally','After that','First','Then'], correct:2, timeLimit:15},
          {q:'Which phrase means "to prepare yourself before going out"?', answers:['Wake up','Get ready','Attend class','Go to bed'], correct:1, timeLimit:15},
          {q:'Which phrase means "to look again at what you learned"?', answers:['Attend class','Review notes','Go to bed','Wake up'], correct:1, timeLimit:15},
          {q:'Which sequencing word introduces the LAST thing you do?', answers:['First','Then','After that','Finally'], correct:3, timeLimit:15},
          {q:'"I attend class at 9 o\'clock" describes:', answers:['A habit and a specific time','A question','A past event','An opinion'], correct:0, timeLimit:20},
          {q:'Which word introduces something happening in the MIDDLE of a sequence?', answers:['First','Then','Finally','Yesterday'], correct:1, timeLimit:15},
          {q:'What time do most people go to bed, based on the unit\'s example?', answers:['6 a.m.','9 a.m.','10 p.m.','Noon'], correct:2, timeLimit:15}
        ]
      },
      {
        id: 'comm-u6', unitCode: 'unit-6', unit: 'Unit 6: Cultural Studies: Food & Eating',
        title: 'Food & Eating', locked: false,
        questions: [
          {q:'Which word means "the list of food and drinks a restaurant offers"?', answers:['Bill','Menu','Order','Table'], correct:1, timeLimit:15},
          {q:'Which word means "the person who serves food at a restaurant"?', answers:['Customer','Waiter / Server','Menu','Bill'], correct:1, timeLimit:15},
          {q:'"Can I have the _____, please?" (asking to pay at the end)', answers:['menu','order','bill','table'], correct:2, timeLimit:15},
          {q:'Which word means "a person who eats at a restaurant"?', answers:['Server','Customer','Waiter','Menu'], correct:1, timeLimit:15},
          {q:'Which is the most polite way to order?', answers:['"I\'d like rice, please."','"Give me rice."','"Rice now."','"I want rice now."'], correct:0, timeLimit:20},
          {q:'Which is NOT a food word from this unit?', answers:['Noodles','Chicken','Server','Salad'], correct:2, timeLimit:15},
          {q:'"How much _____ it?"', answers:['is','are','was','were'], correct:0, timeLimit:15},
          {q:'Which is a polite response when you don\'t want anything else?', answers:['"Yes, please."','"No, thank you."','"How much?"','"Can I have?"'], correct:1, timeLimit:15}
        ]
      }
    ]
  },
  {
    course: 'English for Wellness Tourism',
    courseCode: 'wellness',
    icon: '🌿',
    quizzes: [
      {
        id: 'wellness-u3', unitCode: 'unit-3', unit: 'Unit 3: Describing Wellness Destinations',
        title: 'Describing Wellness Destinations', locked: true, lockMsg: 'Unit 3 will open before its class session.',
        questions: [
          {q:'"Sanctuary" means:', answers:['A heated room for relaxation','A peaceful, protected place for rest and recovery','A type of massage','A guest complaint'], correct:1, timeLimit:20},
          {q:'Which word means "calm, peaceful, and untroubled"?', answers:['Sanctuary','Serene','Aromatherapy','Retreat'], correct:1, timeLimit:15},
          {q:'"Aromatherapy" uses:', answers:['Hot stones','Essential oils from plants','Herbal teas','Loud music'], correct:1, timeLimit:15},
          {q:'Which word means "to give someone new energy and a feeling of being refreshed"?', answers:['Serene','Revitalize','Sanctuary','Route'], correct:1, timeLimit:20},
          {q:'A "wellness route" is:', answers:['A type of treatment','A planned travel path visiting wellness destinations','A heated room','A guest form'], correct:1, timeLimit:20},
          {q:'"Nature therapy" means:', answers:['Using outdoor environments for healing','A type of massage oil','A hotel policy','A guest complaint'], correct:0, timeLimit:20},
          {q:'Which facility uses heat to promote relaxation and sweating?', answers:['Sauna','Herbal Garden','Reception','Restaurant'], correct:0, timeLimit:15},
          {q:'"The resort restaurant serves _____ ingredients." (produced without artificial chemicals)', answers:['fresh','organic','serene','exclusive'], correct:1, timeLimit:15}
        ]
      },
      {
        id: 'wellness-u4', unitCode: 'unit-4', unit: 'Unit 4: Customer Service',
        title: 'Customer Service', locked: true, lockMsg: 'Unit 4 will open before its class session.',
        questions: [
          {q:'"Hospitality" means:', answers:['A type of complaint','The friendly and warm treatment of guests','A hotel room','A guest request'], correct:1, timeLimit:20},
          {q:'Which word means "paying close attention to guests\' needs"?', answers:['Empathy','Attentive','Rapport','Complaint'], correct:1, timeLimit:15},
          {q:'A "concierge" is:', answers:['A guest who complains','A staff member who assists guests with special requests','A type of treatment','A cleaning schedule'], correct:1, timeLimit:20},
          {q:'"Empathy" means:', answers:['The ability to understand how another person feels','A type of greeting','A hotel policy','A guest form'], correct:0, timeLimit:20},
          {q:'Which word describes a friendly relationship built with a guest?', answers:['Complaint','Rapport','Enquiry','Resolution'], correct:1, timeLimit:15},
          {q:'Best first response to an upset guest:', answers:['"That\'s not my problem."','"I\'m sorry to hear that."','"Please wait."','"Call someone else."'], correct:1, timeLimit:15},
          {q:'"Exceed expectations" means:', answers:['To do exactly what is expected','To do even better than what a guest expected','To ignore a request','To apologize only'], correct:1, timeLimit:20},
          {q:'Which is the FIRST of the Five Principles of Excellent Service?', answers:['Follow up and show you care','Make a strong first impression','Handle complaints professionally','Listen actively'], correct:1, timeLimit:20}
        ]
      },
      {
        id: 'wellness-u5', unitCode: 'unit-5', unit: 'Unit 5: Wellness Tourism Guiding',
        title: 'Wellness Tourism Guiding', locked: true, lockMsg: 'Unit 5 will open before its class session.',
        questions: [
          {q:'An "itinerary" is:', answers:['A type of treatment','A detailed plan of a journey including times and activities','A guest complaint','A hotel bill'], correct:1, timeLimit:20},
          {q:'Which word means "spoken information provided by a guide during a tour"?', answers:['Itinerary','Commentary','Landmark','Pace'], correct:1, timeLimit:15},
          {q:'"Immersive" means:', answers:['Creating the feeling of being completely surrounded by an experience','Very expensive','Very short','Very quiet'], correct:0, timeLimit:20},
          {q:'Which word means "a well-known place that is easy to recognize"?', answers:['Anecdote','Landmark','Transition','Pace'], correct:1, timeLimit:15},
          {q:'"Authentic" means:', answers:['Fake','Genuine and true to original traditions','Very fast','Very expensive'], correct:1, timeLimit:20},
          {q:'Which word means "to accompany and guide someone to a place"?', answers:['Narrate','Escort','Engage','Transition'], correct:1, timeLimit:15},
          {q:'Guiding phrase to invite guests to notice something:', answers:['"Let\'s go now."','"Take a moment to look around you."','"That\'s all, thank you."','"Please pay here."'], correct:1, timeLimit:15},
          {q:'Which word means "the speed at which a tour moves"?', answers:['Route','Pace','Highlight','Anecdote'], correct:1, timeLimit:15}
        ]
      },
      {
        id: 'wellness-u6', unitCode: 'unit-6', unit: 'Unit 6: Reservations & Appointments',
        title: 'Reservations & Appointments', locked: true, lockMsg: 'Unit 6 will open before its class session.',
        questions: [
          {q:'A "reservation" is:', answers:['A completed payment','An arrangement to hold a service in advance','A guest complaint','A type of massage'], correct:1, timeLimit:20},
          {q:'Which word means "proof that a booking has been accepted"?', answers:['Reservation','Confirmation','Cancellation','Deposit'], correct:1, timeLimit:15},
          {q:'"Availability" means:', answers:['Whether a time slot is free and can be booked','The price of a service','A guest\'s name','A type of treatment'], correct:0, timeLimit:20},
          {q:'A "no-show" is:', answers:['When a guest arrives early','When a guest fails to arrive without cancelling','When a guest cancels politely','When a guest asks for a discount'], correct:1, timeLimit:20},
          {q:'Which word means "a change made to an existing reservation"?', answers:['Cancellation','Amendment','Deposit','Rate'], correct:1, timeLimit:15},
          {q:'"A 30% _____ is required to confirm your booking."', answers:['rate','deposit','amendment','preference'], correct:1, timeLimit:15},
          {q:'Most polite way to ask a guest\'s name on the phone:', answers:['"What\'s your name?"','"May I have your full name, please?"','"Name?"','"Who is this?"'], correct:1, timeLimit:20},
          {q:'Which word means "a food restriction based on health, religion, or personal choice"?', answers:['Preference','Dietary requirement','Availability','Amendment'], correct:1, timeLimit:15}
        ]
      }
    ]
  }
];

function findQuiz(quizId){
  for(const course of QUIZ_REGISTRY){
    for(const quiz of course.quizzes){
      if(quiz.id === quizId) return Object.assign({courseName: course.course, courseCode: course.courseCode}, quiz);
    }
  }
  return null;
}
