/* Unit 12: Presenting a Product or Service. Engine: ../../js/lesson.js. American English, A1 wording, no dashes. */

const UNIT = {
  number: 12,
  title: 'Presenting a Product or Service',
  output: 'Give a 2-minute presentation with 3 slides about a product or service (what it is, the price, and one reason to buy it), then answer 1 question.',
  can: 'give a short presentation about a product and answer a question.',
  bloom: 'Apply, Create',
  minutes: 30,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 11 before you start.', does: 'Remember meeting phrases.',
      items: [
        { q: 'Which sentence is a polite disagreement?', options: ['I am not sure. How about Tuesday?', 'No, never. I do not want that.', 'Bad idea. I do not like it.'], answer: 'I am not sure. How about Tuesday?', why: 'It says you are not sure and it suggests another idea.' },
        { q: 'Which action point is the best?', options: ['Mali will book the cafe on Wednesday.', 'Do it later. We do not know.', 'Someone books the cafe sometime.'], answer: 'Mali will book the cafe on Wednesday.', why: 'It says who, what, and when.' }
      ]
    },
    {
      id: 'present', type: 'learn', title: 'A short presentation', bloom: 'Understand',
      sub: 'Open, show 3 slides, close, and answer a question.', does: 'Hear a short product presentation.',
      points: [
        'Open: Good morning, everyone. Today I will talk about ___.',
        'Slide 1: what it is. Slide 2: the price. Slide 3: one reason to buy it.',
        'Close: Thank you. Any questions?',
        'Keep each slide short: a title, a picture, and no more than 8 words.'
      ],
      models: [{
        title: 'The Island Bottle',
        hint: 'Tap each line to hear it. Or listen to the whole presentation.', audio: true,
        sentences: [
          { text: 'Good morning, everyone. Today I will talk about the Island Bottle.', kind: 'k1', tag: 'Opening', note: 'Greet the audience and say the topic.' },
          { text: 'Slide 1. This is a water bottle. It is light and strong.', kind: 'k2', tag: 'What it is', note: 'Say what the product is and describe it with two adjectives.' },
          { text: 'Slide 2. The price is 250 baht.', say: 'Slide 2. The price is two hundred and fifty baht.', kind: 'k2', tag: 'Price', note: 'Say the price clearly.' },
          { text: 'Slide 3. You should buy it because it keeps water cold for 12 hours.', kind: 'k2', tag: 'Reason', note: 'Give one clear reason to buy.' },
          { text: 'Thank you. Any questions?', kind: 'k1', tag: 'Closing', note: 'Close and invite questions.' },
          { text: 'Is it heavy?', kind: 'k4', tag: 'Question', note: 'A question from the audience.' },
          { text: 'Good question. No, it is light. It is only 300 grams.', kind: 'k3', tag: 'Answer', note: 'Say Good question, then answer in a sentence.' }
        ],
        after: 'Notice: opening, 3 slides, closing, question and answer.'
      }],
      lang: {
        title: 'Product words',
        rows: [
          ['Describe', 'It is cheap, light, strong, small, easy to use, useful, new.'],
          ['Price', 'The price is ___ baht. It is ___ baht each.'],
          ['Reason', 'You should buy it because ___. It is good for ___.'],
          ['Questions', 'Any questions? That is a good question. I am not sure. I will check.']
        ]
      }
    },
    {
      id: 'say', type: 'ladder', title: 'Say it', bloom: 'Apply',
      sub: 'Say each phrase out loud until you can say it with no paper.', does: 'Say the presentation phrases out loud.',
      phrases: [
        { text: 'Good morning, everyone. Today I will talk about the Island Bottle.', frame: 'Good ___, ___. Today I will ___ about the ___.', keys: 'morning / everyone / talk / bottle', cue: 'Open the presentation.' },
        { text: 'This is a water bottle. It is light and strong.', frame: 'This is a ___. It is ___ and ___.', keys: 'bottle / light / strong', cue: 'Say what it is and describe it.' },
        { text: 'The price is 250 baht.', say: 'The price is two hundred and fifty baht.', frame: 'The ___ is ___ baht.', keys: 'price / 250', cue: 'Say the price.' },
        { text: 'You should buy it because it keeps water cold.', frame: 'You ___ buy it ___ it keeps water ___.', keys: 'should / because / cold', cue: 'Give one reason.' },
        { text: 'Thank you. Any questions?', frame: 'Thank ___. Any ___?', keys: 'you / questions', cue: 'Close the presentation.' }
      ]
    },
    {
      id: 'slides', type: 'pick', title: 'Make the slide short', bloom: 'Analyze',
      sub: 'A good slide has a few words only.', does: 'Find slides with too many words.',
      prompt: 'A slide should have no more than 8 words. Tap the 2 slides with too many words. Then tap Check.',
      flag: 'too long',
      hint: 'Count the words. Is it more than 8?',
      sets: [{
        items: [
          { t: 'Island Bottle. Steel. Light. 250 baht.', on: false },
          { t: 'This is a very good bottle and you can use it at home, at work, at school, and when you travel to many places.', on: true },
          { t: 'Keeps water cold for 12 hours.', on: false },
          { t: 'The price of this bottle is two hundred and fifty baht and it is a very good price for everyone.', on: true }
        ],
        why: 'Those two slides have far more than 8 words. Keep slides short and say the rest.'
      }]
    },
    {
      id: 'words', type: 'choose', title: 'Choose the best words', bloom: 'Apply',
      sub: 'Choose the right word or sentence for a presentation.', does: 'Choose good product words and phrases.',
      hint: 'Not this one. Choose the word or sentence that fits the product.',
      items: [
        { q: 'A bottle weighs only 300 grams. Which word fits?', options: ['light', 'heavy', 'expensive'], answer: 'light', why: 'It weighs only 300 grams, so it is light.' },
        { q: 'A product costs only 50 baht. Which word fits?', options: ['cheap', 'expensive', 'broken'], answer: 'cheap', why: 'Fifty baht is a low price, so it is cheap.' },
        { q: 'How do you give a reason to buy?', options: ['You should buy it because it is easy.', 'Buy it now. It is a nice thing.', 'You buy because yes, it is good.'], answer: 'You should buy it because it is easy.', why: 'You should ... because ... gives a clear reason.' },
        { q: 'The audience asks a question. What do you say first?', options: ['Good question.', 'I do not know.', 'Please stop.'], answer: 'Good question.', why: 'It is polite and gives you a moment to think.' }
      ]
    },
    {
      id: 'order', type: 'order', title: 'Put the presentation in order', bloom: 'Analyze',
      sub: 'A presentation follows an order.', does: 'Put the parts of a presentation in order.',
      prompt: 'Tap the lines in the order of the presentation.',
      hint: 'The opening comes first. The questions come last.',
      sets: [{
        items: [
          'Good morning, everyone. Today I will talk about the Island Bottle.',
          'This is a water bottle. It is light and strong.',
          'The price is 250 baht.',
          'You should buy it because it keeps water cold for 12 hours.',
          'Thank you. Any questions?'
        ],
        why: 'The order is: opening, what it is, price, reason, closing.'
      }]
    },
    {
      id: 'plan', type: 'plan', title: 'Plan your presentation', bloom: 'Apply',
      sub: 'Build a short presentation in 4 small steps.', does: 'Build a short presentation.',
      topic: 'The Sunny Sunscreen (150 baht, protects for 8 hours, smells good)',
      slots: [
        { key: 'open', mode: 'one', prompt: 'Choose the opening.', options: [
          { t: 'Good morning, everyone. Today I will talk about Sunny Sunscreen.', ok: true, why: 'It greets the audience and says the topic.' },
          { t: 'OK. Sunscreen. Look.', ok: false, why: 'This is too short and not polite.' },
          { t: 'Hello. I will say many things.', ok: false, why: 'It does not say the topic.' }
        ] },
        { key: 'what', mode: 'one', prompt: 'Choose slide 1 (what it is) and slide 2 (price).', options: [
          { t: 'This is a sunscreen. It is light and smells good. The price is 150 baht.', ok: true, why: 'It says what it is and gives the price.' },
          { t: 'This is a sunscreen. The price is 1,500 baht.', ok: false, why: 'The price is 150 baht, not 1,500.' },
          { t: 'It is a thing. It is nice.', ok: false, why: 'It is not specific.' }
        ] },
        { key: 'reason', mode: 'one', prompt: 'Choose slide 3 (a reason to buy).', options: [
          { t: 'You should buy it because it protects your skin for 8 hours.', ok: true, why: 'It gives a clear reason with a number.' },
          { t: 'You buy it because it is yes.', ok: false, why: 'The sentence is not clear.' },
          { t: 'Sunscreen is made in a factory.', ok: false, why: 'This is not a reason to buy.' }
        ] },
        { key: 'close', mode: 'one', prompt: 'Choose the closing.', options: [
          { t: 'Thank you. Any questions?', ok: true, why: 'It closes and invites questions.' },
          { t: 'That is all. Bye.', ok: false, why: 'It does not invite questions.' },
          { t: 'Finished.', ok: false, why: 'It is too short and not polite.' }
        ] }
      ],
      plannerTitle: 'Your presentation',
      rows: [
        { label: 'Opening', slot: 'open', wait: 'Complete step 1' },
        { label: 'Slides 1 and 2', slot: 'what', wait: 'Complete step 2' },
        { label: 'Slide 3', slot: 'reason', wait: 'Complete step 3' },
        { label: 'Closing', slot: 'close', wait: 'Complete step 4' }
      ],
      afterText: 'The model presentation is ready. In class you will make 3 slides and give your own presentation.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn in class', bloom: 'Create',
      sub: 'Give a 2-minute presentation.',
      task: 'Choose a product or service card. Make 3 slides: what it is, the price, and one reason to buy it. Give a 2-minute presentation to a group of 5. Answer 1 question.',
      condition: 'Slides have no more than 8 words each. Use keywords on the slides only. Do not read from paper.',
      cards: [
        { who: 'Product card A', text: 'Island Bottle: steel, light, 250 baht, keeps water cold for 12 hours.' },
        { who: 'Product card B', text: 'Quick Charger: small, 399 baht, charges a phone in 1 hour.' },
        { who: 'Product card C', text: 'City Tour: half a day, 600 baht, a guide speaks English and Thai.' },
        { who: 'Or choose your own', text: 'Choose a real product or service you know. Find the price and one good reason to buy it.' }
      ],
      phrases: [
        { text: 'Good morning, everyone. Today I will talk about ___.' },
        { text: 'This is a ___. It is ___ and ___.' },
        { text: 'The price is ___ baht.' },
        { text: 'You should buy it because ___.' },
        { text: 'Thank you. Any questions?' },
        { text: 'Good question. ___.' }
      ],
      checklist: [
        'I used an opening, 3 slides in order, and a closing.',
        'My slides had no more than 8 words each, and one picture.',
        'I talked for about 2 minutes. I looked at my audience.',
        'I did not read everything from paper.',
        'I answered a question with at least one sentence.'
      ],
      selfStudy: 'Practice your presentation aloud with keywords only, two times.'
    }
  ],

  exit: {
    outcome: 'I can give a short presentation about a product and answer a question.',
    questions: [
      { q: 'How many words should a slide have?', options: ['Very many', 'A few (no more than 8)', 'None, and a blank page'], answer: 1 },
      { q: 'The audience asks a question. What do you say?', options: ['Good question. I think ...', 'Stop.', 'No questions allowed.'], answer: 0 }
    ]
  }
};
