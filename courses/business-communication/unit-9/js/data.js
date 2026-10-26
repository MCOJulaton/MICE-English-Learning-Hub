/* Unit 9: Prices, Quantities, and Orders. Engine: ../../js/lesson.js. American English, A1 wording, no dashes. */

const UNIT = {
  number: 9,
  title: 'Prices, Quantities, and Orders',
  output: 'Take a catalog order in a role-play: ask what and how many, say each price and the total, confirm the delivery day, and complete an order form correctly.',
  can: 'take an order, say the prices and the total, and fill in an order form.',
  bloom: 'Understand, Apply',
  minutes: 30,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 8 before you start.', does: 'Remember places and directions.',
      items: [
        { q: 'Which words say where a place is?', options: ['next to, behind, opposite', 'thank you, please, sorry', 'first, then, finally'], answer: 'next to, behind, opposite', why: 'Next to, behind, and opposite say where something is.' },
        { q: 'Which sentence welcomes a visitor?', options: ['Welcome to Sunrise Hotel. How can I help you?', 'Go to the room over there now.', 'Who are you? What do you want here?'], answer: 'Welcome to Sunrise Hotel. How can I help you?', why: 'It is polite and clear.' }
      ]
    },
    {
      id: 'order', type: 'learn', title: 'Take an order', bloom: 'Understand',
      sub: 'Ask what and how many. Say the prices. Say the total. Confirm delivery.', does: 'Hear how to take an order.',
      points: [
        'Ask what and how many: What would you like? How many would you like?',
        'Say the price: It is 15 baht each. The pens are 15 baht each.',
        'Say the total: 20 pens at 15 baht is 300 baht. The total is 900 baht.',
        'Confirm delivery: It will arrive on Thursday. Is that OK?'
      ],
      models: [{
        title: 'An order for office supplies',
        hint: 'Tap each line to hear it. Or listen to the whole order.', audio: true,
        sentences: [
          { text: 'Island Supply. How can I help you?', kind: 'k1', tag: 'Supplier', note: 'Answer with the company name.' },
          { text: 'I would like to order some office supplies, please.', kind: 'k2', tag: 'Buyer', note: 'I would like to ... is polite.' },
          { text: 'Of course. What would you like?', kind: 'k1', tag: 'Supplier', note: 'Ask what the buyer wants.' },
          { text: 'I need 20 pens, please. How much are they?', kind: 'k2', tag: 'Buyer', note: 'Say what you need and ask the price.' },
          { text: 'The pens are 15 baht each. So 20 pens is 300 baht.', say: 'The pens are fifteen baht each. So twenty pens is three hundred baht.', kind: 'k1', tag: 'Supplier', note: 'Say the price and the amount.' },
          { text: 'Anything else?', kind: 'k1', tag: 'Supplier', note: 'Ask if the buyer wants more.' },
          { text: 'Yes, 5 boxes of paper, please.', kind: 'k2', tag: 'Buyer', note: 'Say the quantity and the item.' },
          { text: 'The paper is 120 baht a box. That is 600 baht. The total is 900 baht.', say: 'The paper is one hundred and twenty baht a box. That is six hundred baht. The total is nine hundred baht.', kind: 'k1', tag: 'Supplier', note: 'Add up: 300 and 600 is 900.' },
          { text: 'That is fine. When will it arrive?', kind: 'k2', tag: 'Buyer', note: 'Ask about delivery.' },
          { text: 'It will arrive on Thursday. Is that OK?', say: 'It will arrive on Thursday. Is that okay?', kind: 'k1', tag: 'Supplier', note: 'Confirm the delivery day.' }
        ],
        after: 'Notice: what, how many, price, total, delivery.'
      }],
      lang: {
        title: 'Numbers and units',
        rows: [
          ['Numbers', '13 thirteen, 14 fourteen, 15 fifteen. 20 twenty, 30 thirty. 100 a hundred. 120 a hundred and twenty. 1,000 a thousand.'],
          ['Units', 'a box, a pack, a piece, a dozen (12), each (for one)'],
          ['Prices', 'How much is it? It is 15 baht each. The total is 900 baht.']
        ]
      }
    },
    {
      id: 'say', type: 'ladder', title: 'Say it', bloom: 'Apply',
      sub: 'Say each phrase out loud until you can say it with no paper.', does: 'Say the order phrases out loud.',
      phrases: [
        { text: 'How much is it?', frame: 'How ___ is ___?', keys: 'much / it', cue: 'Ask the price.' },
        { text: 'The pens are 15 baht each.', say: 'The pens are fifteen baht each.', frame: 'The ___ are ___ baht ___.', keys: 'pens / 15 / each', cue: 'Say the price of one pen.' },
        { text: 'How many would you like?', frame: 'How ___ would you ___?', keys: 'many / like', cue: 'Ask the quantity.' },
        { text: 'The total is 900 baht.', say: 'The total is nine hundred baht.', frame: 'The ___ is ___ baht.', keys: 'total / 900', cue: 'Say the total.' },
        { text: 'It will arrive on Thursday. Is that OK?', say: 'It will arrive on Thursday. Is that okay?', frame: 'It will ___ on ___. Is that ___?', keys: 'arrive / Thursday / OK', cue: 'Confirm the delivery day.' }
      ]
    },
    {
      id: 'prices', type: 'dictate', title: 'Listen to prices', bloom: 'Apply',
      sub: 'Listen. Type the price in numbers.', does: 'Hear and write prices.',
      prompt: 'Type the number you hear.',
      hint: 'Listen again slowly. Think about hundreds, tens, and ones.',
      items: [
        { say: 'three hundred and fifty baht', q: 'Price 1', label: 'Baht', numeric: true, answer: '350', why: 'Three hundred and fifty is 350.' },
        { say: 'four hundred and twenty baht', q: 'Price 2', label: 'Baht', numeric: true, answer: '420', why: 'Four hundred and twenty is 420.' },
        { say: 'nine hundred and ninety baht', q: 'Price 3', label: 'Baht', numeric: true, answer: '990', why: 'Nine hundred and ninety is 990.' },
        { say: 'one thousand two hundred baht', q: 'Price 4', label: 'Baht', numeric: true, answer: '1200', why: 'One thousand two hundred is 1,200.' }
      ]
    },
    {
      id: 'form', type: 'dictate', title: 'Fill in the order form', bloom: 'Apply',
      sub: 'Listen to an order. Write it on the form and add up the total.', does: 'Listen to an order and fill in a form.',
      prompt: 'Listen to the order. Type the details. Then work out the total.',
      hint: 'Listen again slowly. Pens: 20 at 15 baht. Paper: 5 boxes at 120 baht. Add the two amounts.',
      items: [
        { say: 'I would like twenty pens at fifteen baht each, and five boxes of paper at one hundred and twenty baht a box. Please deliver on Thursday.', q: 'Order form',
          fields: [
            { label: 'Item 1', answer: 'pens', accept: ['pen'] },
            { label: 'Quantity 1', answer: '20', numeric: true },
            { label: 'Item 2', answer: 'paper' },
            { label: 'Quantity 2', answer: '5', numeric: true },
            { label: 'Total (baht)', answer: '900', numeric: true, accept: ['900baht'] },
            { label: 'Delivery day', answer: 'Thursday' }
          ], why: '20 pens at 15 baht is 300. 5 boxes at 120 baht is 600. 300 and 600 is 900 baht.' }
      ]
    },
    {
      id: 'addup', type: 'choose', title: 'Add it up', bloom: 'Apply',
      sub: 'Choose the right total.', does: 'Work out totals.',
      hint: 'Not this one. Multiply the price by the quantity. Then add.',
      items: [
        { q: '3 pens at 15 baht each. What is the total?', options: ['45 baht', '35 baht', '18 baht'], answer: '45 baht', why: '3 times 15 is 45.' },
        { q: '2 boxes of paper at 120 baht each. What is the total?', options: ['240 baht', '220 baht', '122 baht'], answer: '240 baht', why: '2 times 120 is 240.' },
        { q: '10 files at 25 baht each. What is the total?', options: ['250 baht', '225 baht', '35 baht'], answer: '250 baht', why: '10 times 25 is 250.' },
        { q: '4 pens at 15 baht and 1 box of paper at 120 baht. What is the total?', options: ['180 baht', '135 baht', '195 baht'], answer: '180 baht', why: '4 pens is 60 baht. 60 and 120 is 180 baht.' }
      ]
    },
    {
      id: 'phrases', type: 'choose', title: 'Choose the best phrase', bloom: 'Apply',
      sub: 'Choose the best thing to say when you take an order.', does: 'Choose polite order phrases.',
      hint: 'Not this one. Be polite and clear.',
      items: [
        { q: 'You want to know the price. What do you say?', options: ['How much is it?', 'Money?', 'What is price bad?'], answer: 'How much is it?', why: 'It is short and correct.' },
        { q: 'You want to know the quantity. What do you say?', options: ['How many would you like?', 'How much many?', 'Give me number.'], answer: 'How many would you like?', why: 'Use How many for things you can count.' },
        { q: 'The order is finished. What do you say about delivery?', options: ['It will arrive on Thursday. Is that OK?', 'It comes Thursday. You wait there.', 'Thursday you wait for the box.'], answer: 'It will arrive on Thursday. Is that OK?', why: 'It is polite and it checks.' }
      ]
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn in class', bloom: 'Create',
      sub: 'The order role-play, two rounds.',
      task: 'Work in pairs. The supplier takes an order. The buyer says what they need. The supplier asks how many, says each price and the total, and confirms the delivery day. The supplier fills in the order form. Swap roles with a new card.',
      condition: 'Sit back to back or with a screen between you. No script on paper. You may look at the price list and the phrase card.',
      cards: [
        { who: 'Price list (supplier)', text: 'Pens: 15 baht each. Notebooks: 40 baht each. Paper: 120 baht a box. Files: 25 baht each. Staples: 30 baht a pack.' },
        { who: 'Buyer card 1', text: 'You need 12 pens, 5 notebooks, and 2 boxes of paper. You want delivery on Wednesday.' },
        { who: 'Buyer card 2', text: 'You need 20 files, 3 packs of staples, and 6 notebooks. You want delivery on Friday.' }
      ],
      phrases: [
        { text: 'What would you like?' },
        { text: 'How much is it? / It is ___ baht each.' },
        { text: 'How many would you like?' },
        { text: 'The total is ___ baht.' },
        { text: 'It will arrive on ___. Is that OK?' }
      ],
      checklist: [
        'I took at least 3 items with quantities.',
        'I said each price and the total correctly.',
        'I confirmed the delivery day.',
        'My order form has the item, quantity, price, total, and delivery day, with at most 1 mistake.',
        'I did not read from paper.'
      ],
      selfStudy: 'Practice numbers to 1,000. Complete one more order form.'
    }
  ],

  exit: {
    outcome: 'I can take an order, say the prices and the total, and fill in an order form.',
    questions: [
      { q: '5 boxes at 120 baht each. What is the total?', options: ['500 baht', '600 baht', '125 baht'], answer: 1 },
      { q: 'Which question asks for a quantity?', options: ['How many would you like?', 'How much is it?', 'When will it arrive?'], answer: 0 }
    ]
  }
};
