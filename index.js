let cardDetails = {};
let currentType = '';

const BASE_CARD = {
  deadline: '',
  assumptions: '',
  'acceptance-criteria': '',
}

function getUserStories() {
  const stories = Array.from(document.querySelectorAll('#user-stories-container .user-story'));
  const text = stories.map(story => {
    const asA = story.querySelector('.as-a > input').value;
    const iWantTo = story.querySelector('.i-want-to > input').value;
    const soICan = story.querySelector('.so-i-can > input').value;
    return `*As a* ${asA}, *I want to* ${iWantTo} *so I can* ${soICan}.`;
  });
  return text.join('\n');
}

const CARD_TEMPLATES = {
  collection: {
    name: '',
    'authorize-api': false,
  },
  aperture: {
    collection: '',
    external: false,
    audience: '',
    purpose: '',
    partner: '',
    dimensions: '1x1',
    details: '',
  },
  api: {
    endpoint: '',
    'public-edge': false,
    'data-source': '',
    'business-logic': '',
    payload: '',
  },
  visualization: {
    'data-representation': '',
    animation: '',
    colors: '',
    'edge-cases': '',
  },
  store: {
    name: '',
    definition: `
| # | name | type | nullable | default |
|-|-|-|-|-|
| 1 | column | string | false | abc |
    `,
  },
  loader: {
    'loader-type': 'apertures-api',
    'data-source': '',
    payload: '',
  },
  bug: {
    context: '',
    'steps-to-reproduce': '',
    'expected-result': '',
    version: '',
  },
  task: {
    timebox: '',
    goals: '',
    'acceptance-criteria': '',
  },
  story: {
    'user-stories': getUserStories,
  },
};

const EFFECTS = {
  setLoaderType: function setLoaderType(target) {
    const loaderType = target.value;
    const element = document.querySelector('#loader-type-source-description');
    element.innerHTML = loaderTypeSourceDescriptions[loaderType];
  }
};

const loaderTypeSourceDescriptions = {
  'apertures-api': 'Which apertures api endpoint will this use?',
  'google-sheets': 'What is the sheet id, and which sheets (tabs)?',
  'generic': 'How should this data be retrieved?',
}

function updateFormFields(cardType) {
  document.querySelector('#jira-form').style.display = 'block';
  currentType = cardType;

  const sections = Array.from(document.querySelectorAll('.section'));
  sections.forEach(section => section.style.display = 'none');
  document.querySelector(`#${cardType}`).style.display = 'block';

  cardDetails = {
    ...BASE_CARD,
    ...CARD_TEMPLATES[cardType],
  };

  // special cases
  document.querySelector('#user-stories-container').innerHTML = '';

  const inputs = Array.from(document.querySelectorAll('[data-id]'));
  inputs.forEach(input => {
    const field = input.getAttribute('data-id');
    if (field.type === 'checkbox') {
      input.checked = cardDetails[field];
    } else {
      input.value = cardDetails[field];
    }
  });
}

function update(input) {
  const field = input.getAttribute('data-id');
  let key = 'value';
  if (field.type === 'checkbox') {
    key = 'checked';
  }
  const value = input[key];
  cardDetails[field] = value;
}

function capitalize(s) {
  return s[0].toUpperCase() + s.substr(1);
}

function generateJiraDescription() {
  console.log(JSON.stringify(cardDetails, null, 2));
  const array = Object.entries(cardDetails).map(([key, value]) => {
    let text = value;
    if (typeof value === 'function') {
      text = value();
    }
    return `*${
      key.split('-').map(capitalize).join(' ')
    }*\n${text}`;
});
  const result = array.join('\n\n');

  const text = document.createElement('textarea');
  text.style.position = 'fixed';
  text.style.left = '5px';
  text.style.top = '5px';
  text.style.boxShadow = '#000 0 0 20px 10px';
  text.style.width = `calc(100vw - 30px)`;
  text.style.height = `calc(100vh - 30px)`;
  text.value = result;

  const button = document.createElement('button');
  button.style.position = 'fixed';
  button.style.right = '25px';
  button.style.top = '25px';
  button.innerHTML = 'CLOSE';
  button.addEventListener('click', () => {
    updateFormFields(currentType);
    document.body.removeChild(text);
    document.body.removeChild(button);
  });

  document.body.appendChild(text);
  document.body.appendChild(button);

  text.focus();
  text.setSelectionRange(0, result.length);
}

function addUserStory() {
  const container = document.querySelector('#user-stories-container');

  const story = document.createElement('div');
  story.className = 'user-story';

  const asA = document.createElement('div');
  asA.className = 'as-a';
  const input0 = document.createElement('input');
  asA.appendChild(input0);
  story.appendChild(asA);

  const iWantTo = document.createElement('div');
  iWantTo.className = 'i-want-to';
  const input1 = document.createElement('input');
  iWantTo.appendChild(input1);
  story.appendChild(iWantTo);

  const soICan = document.createElement('div');
  soICan.className = 'so-i-can';
  const input2 = document.createElement('input');
  soICan.appendChild(input2);
  story.appendChild(soICan);

  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete';
  deleteButton.innerHTML = '&times;';
  story.appendChild(deleteButton);
  deleteButton.addEventListener('click', () => container.removeChild(story));

  container.appendChild(story);
}

window.addEventListener('load', () => {
  document.querySelector('#card-type')
    .addEventListener('change', (event) => updateFormFields(event.target.value));

  const inputs = Array.from(document.querySelectorAll('[data-id]'));
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      const effect = input.getAttribute('data-effect');
      update(input);
      if (effect && EFFECTS[effect]) {
        EFFECTS[effect](input);
      }
    });
  });

  document.querySelector('#add-user-story').addEventListener('click', addUserStory);

  document.querySelector('#submit').addEventListener('click', generateJiraDescription);
});