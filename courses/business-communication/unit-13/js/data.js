/* Unit 13: Simple Reports: Numbers Up and Down. Engine: ../../js/lesson.js. American English, A1 wording, no dashes. */

const CHART1 = {
  file: 'bc-u13-chart1.png',
  alt: 'A bar chart of coffee sales at Island Cafe, in hundreds of cups. January 40, February 55, March 55, April 30, May 60, June 80.',
  caption: 'Coffee sales at Island Cafe: Jan 40, Feb 55, Mar 55, Apr 30, May 60, Jun 80.'
};
const CHART2 = {
  file: 'bc-u13-chart2.png',
  alt: 'A bar chart of phone sales at Sky Shop. July 70, August 50, September 50, October 65, November 90, December 40.',
  caption: 'Phone sales at Sky Shop: Jul 70, Aug 50, Sep 50, Oct 65, Nov 90, Dec 40.'
};

const UNIT = {
  number: 13,
  title: 'Simple Reports: Numbers Up and Down',
  output: 'Describe a simple chart (sales by month) in 6 sentences, spoken in 1 minute, and write a 60-word short report.',
  can: 'describe a simple chart and write a short report.',
  bloom: 'Understand, Apply, Analyze',
  minutes: 30,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 12 before you start.', does: 'Remember product words and presentation phrases.',
      items: [
        { q: 'A bottle weighs only 300 grams. Which word fits?', options: ['light', 'heavy', 'expensive'], answer: 'light', why: 'It weighs only 300 grams, so it is light.' },
        { q: 'The audience asks a question. What do you say first?', options: ['Good question.', 'Stop.', 'No questions allowed.'], answer: 'Good question.', why: 'It is polite and gives you a moment to think.' }
      ]
    },
    {
      id: 'chart', type: 'learn', title: 'Read and describe a chart', bloom: 'Understand',
      photo: CHART1,
      sub: 'Say what goes up, what goes down, and what stays the same.', does: 'Hear how to describe a chart.',
      points: [
        'First read the title and the months. Then read the numbers.',
        'Say a change: Sales went up. Sales went down. Sales stayed the same.',
        'Say the highest and the lowest: The highest month was June. The lowest month was April.',
        'Finish with a conclusion: In conclusion, sales were highest in June and lowest in April.'
      ],
      models: [{
        title: 'A short description of the chart',
        hint: 'Look at the chart. Tap each line to hear it. Or listen to the whole description.', audio: true,
        sentences: [
          { text: 'This chart shows coffee sales at Island Cafe from January to June.', kind: 'k1', tag: 'Opening', note: 'Say what the chart shows.' },
          { text: 'Sales went up from 40 in January to 55 in February.', say: 'Sales went up from forty in January to fifty-five in February.', kind: 'k2', tag: 'Up', note: 'Went up means the number is higher. Say both numbers.' },
          { text: 'In March, sales stayed the same.', kind: 'k4', tag: 'Same', note: 'Stayed the same means no change.' },
          { text: 'In April, sales went down to 30.', say: 'In April, sales went down to thirty.', kind: 'k3', tag: 'Down', note: 'Went down means the number is lower.' },
          { text: 'The highest month was June, with 80.', say: 'The highest month was June, with eighty.', kind: 'k2', tag: 'Highest', note: 'The highest is the biggest number.' },
          { text: 'The lowest month was April.', kind: 'k3', tag: 'Lowest', note: 'The lowest is the smallest number.' },
          { text: 'In conclusion, sales were highest in June and lowest in April.', kind: 'k1', tag: 'Conclusion', note: 'End with the most important facts.' }
        ],
        after: 'Notice: opening, up, same, down, highest, lowest, conclusion.'
      }],
      lang: {
        title: 'Chart words',
        rows: [
          ['Change', 'Sales went up. Sales went down. Sales stayed the same. Sales went up from 40 to 55.'],
          ['Biggest and smallest', 'The highest month was ___. The lowest month was ___.'],
          ['Months', 'January, February, March, April, May, June, July, August, September, October, November, December'],
          ['Numbers', '30 thirty, 40 forty, 50 fifty, 55 fifty-five, 60 sixty, 80 eighty, 90 ninety']
        ]
      }
    },
    {
      id: 'say', type: 'ladder', title: 'Say it', bloom: 'Apply',
      sub: 'Say each phrase out loud until you can say it with no paper.', does: 'Say the chart phrases out loud.',
      phrases: [
        { text: 'This chart shows coffee sales from January to June.', frame: 'This ___ shows coffee ___ from ___ to ___.', keys: 'chart / sales / January / June', cue: 'Say what the chart shows.' },
        { text: 'Sales went up from 40 to 55.', say: 'Sales went up from forty to fifty-five.', frame: 'Sales went ___ from ___ to ___.', keys: 'up / 40 / 55', cue: 'Say that the number went up.' },
        { text: 'In April, sales went down to 30.', say: 'In April, sales went down to thirty.', frame: 'In ___, sales went ___ to ___.', keys: 'April / down / 30', cue: 'Say that the number went down.' },
        { text: 'The highest month was June. The lowest month was April.', frame: 'The ___ month was ___. The ___ month was ___.', keys: 'highest / June / lowest / April', cue: 'Say the highest and the lowest.' },
        { text: 'In conclusion, sales were highest in June.', frame: 'In ___, sales were ___ in ___.', keys: 'conclusion / highest / June', cue: 'Give a conclusion.' }
      ]
    },
    {
      id: 'listen', type: 'choose', title: 'Listen and look at the chart', bloom: 'Analyze',
      photo: CHART1,
      sub: 'Look at the chart. Listen to a sentence. Is it true?', does: 'Listen and check a sentence against the chart.',
      options: ['True', 'False'],
      hint: 'Not this one. Look at the chart again and compare the numbers.',
      items: [
        { say: 'Sales went down in April.', answer: 'True', why: 'March is 55 and April is 30, so sales went down.' },
        { say: 'The lowest month was May.', answer: 'False', why: 'The lowest month was April, with 30.' },
        { say: 'Sales stayed the same in February and March.', answer: 'True', why: 'February and March are both 55.' },
        { say: 'The highest month was February.', answer: 'False', why: 'The highest month was June, with 80.' }
      ]
    },
    {
      id: 'words', type: 'choose', title: 'Choose the right words', bloom: 'Apply',
      photo: CHART2,
      sub: 'Look at the new chart. Choose the best sentence.', does: 'Describe a new chart with the right words.',
      hint: 'Not this one. Look at the chart again and check the numbers.',
      items: [
        { q: 'From July (70) to August (50), what happened?', options: ['Sales went down.', 'Sales went up.', 'Sales stayed the same.'], answer: 'Sales went down.', why: '70 to 50 is lower, so sales went down.' },
        { q: 'From August (50) to September (50), what happened?', options: ['Sales stayed the same.', 'Sales went up.', 'Sales went down.'], answer: 'Sales stayed the same.', why: '50 and 50 are the same.' },
        { q: 'Which month was the highest?', options: ['November.', 'July.', 'December.'], answer: 'November.', why: 'November is 90, the biggest number.' },
        { q: 'Which sentence is true?', options: ['The lowest month was December.', 'The lowest month was August.', 'The lowest month was July.'], answer: 'The lowest month was December.', why: 'December is 40, the smallest number.' }
      ]
    },
    {
      id: 'plan', type: 'plan', title: 'Plan your report', bloom: 'Apply',
      photo: CHART1,
      sub: 'Build a short report about the coffee sales chart.', does: 'Build a short report.',
      topic: 'A report on coffee sales at Island Cafe',
      slots: [
        { key: 'open', mode: 'one', prompt: 'Choose the opening sentence.', options: [
          { t: 'This report is about coffee sales at Island Cafe from January to June.', ok: true, why: 'It says the topic and the time.' },
          { t: 'Coffee is a drink that many people like.', ok: false, why: 'It does not say what the report is about.' },
          { t: 'I like Island Cafe very much.', ok: false, why: 'It is about your opinion, not the chart.' }
        ] },
        { key: 'change', mode: 'one', prompt: 'Choose the sentence about change.', options: [
          { t: 'Sales went up in February, stayed the same in March, and went down in April.', ok: true, why: 'It matches the chart.' },
          { t: 'Sales went down in February and went up in April.', ok: false, why: 'It does not match the chart.' },
          { t: 'Sales were very big every month.', ok: false, why: 'It is not clear and does not use numbers.' }
        ] },
        { key: 'hl', mode: 'one', prompt: 'Choose the sentence about the highest and the lowest.', options: [
          { t: 'The highest month was June with 80, and the lowest month was April with 30.', ok: true, why: 'It matches the chart and uses numbers.' },
          { t: 'The highest month was April, and the lowest was June.', ok: false, why: 'The highest and lowest are in the wrong months.' },
          { t: 'June good and April bad.', ok: false, why: 'The grammar is not clear.' }
        ] },
        { key: 'concl', mode: 'one', prompt: 'Choose the conclusion.', options: [
          { t: 'In conclusion, June was the best month and April was the weakest month.', ok: true, why: 'It gives the main idea.' },
          { t: 'In conclusion, I do not know.', ok: false, why: 'It does not give a conclusion.' },
          { t: 'In conclusion, coffee is hot.', ok: false, why: 'It is not about the chart.' }
        ] }
      ],
      plannerTitle: 'Your report',
      rows: [
        { label: 'Opening', slot: 'open', wait: 'Complete step 1' },
        { label: 'Changes', slot: 'change', wait: 'Complete step 2' },
        { label: 'Highest and lowest', slot: 'hl', wait: 'Complete step 3' },
        { label: 'Conclusion', slot: 'concl', wait: 'Complete step 4' }
      ],
      afterText: 'The model report is ready (about 60 words). In class you will describe a new chart and write your own report.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn in class', bloom: 'Create',
      photo: CHART2,
      sub: 'Describe a chart and write a report.',
      task: 'Look at the Sky Shop phone sales chart. Describe it to a partner in 1 minute with 6 sentences. Your partner listens and finds the highest and lowest months. Then write a short report of about 60 words.',
      condition: 'Use keywords only, not sentences on paper. Write the report in class, on paper or on a computer.',
      cards: [
        { who: 'Speaker', text: 'Say what the chart shows. Say what went up, what went down, and what stayed the same. Say the highest and the lowest months. Give a conclusion.' },
        { who: 'Listener', text: 'Listen. Write the highest and the lowest months from what you hear. Then say them back to the speaker.' }
      ],
      phrases: [
        { text: 'This chart shows ___ from ___ to ___.' },
        { text: 'Sales went up from ___ to ___.' },
        { text: 'Sales went down in ___. / Sales stayed the same in ___.' },
        { text: 'The highest month was ___. The lowest month was ___.' },
        { text: 'In conclusion, ___.' }
      ],
      checklist: [
        'I said 6 sentences about the chart.',
        'I used up, down, the same, the highest, and the lowest correctly.',
        'I said at least 3 numbers or months correctly.',
        'My listener found the highest and the lowest months.',
        'My report has about 60 words, an opening, and a conclusion.'
      ],
      selfStudy: 'Describe one more chart aloud and rewrite your report.'
    }
  ],

  exit: {
    outcome: 'I can describe a simple chart and write a short report.',
    questions: [
      { q: 'Sales were 70 in July and 50 in August. What do you say?', options: ['Sales went up.', 'Sales went down.', 'Sales stayed the same.'], answer: 1 },
      { q: 'Which month has the smallest number?', options: ['The highest month', 'The lowest month', 'The first month'], answer: 1 }
    ]
  }
};
