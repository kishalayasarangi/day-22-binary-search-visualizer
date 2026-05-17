let arr = [];
let steps = [];
let currentStep = 0;
let searchDone = false;

function parseArray() {
  return document.getElementById('arrayInput').value
    .split(',')
    .map(v => parseInt(v.trim()))
    .filter(v => !isNaN(v))
    .sort((a, b) => a - b);
}

function randomArray() {
  const size = Math.floor(Math.random() * 8) + 8;
  const set = new Set();
  while (set.size < size) set.add(Math.floor(Math.random() * 150) + 1);
  arr = [...set].sort((a, b) => a - b);
  document.getElementById('arrayInput').value = arr.join(', ');
  document.getElementById('targetInput').value = arr[Math.floor(Math.random() * arr.length)];
  resetSearch();
}

function buildSteps(arr, target) {
  const steps = [];
  let left = 0, right = arr.length - 1;
  let comparisons = 0;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;

    if (arr[mid] === target) {
      steps.push({ left, mid, right, status: 'found', comparisons, eliminated: getEliminated(arr.length, left, right) });
      break;
    } else if (arr[mid] < target) {
      steps.push({ left, mid, right, status: 'go-right', comparisons, eliminated: getEliminated(arr.length, left, right) });
      left = mid + 1;
    } else {
      steps.push({ left, mid, right, status: 'go-left', comparisons, eliminated: getEliminated(arr.length, left, right) });
      right = mid - 1;
    }
  }

  if (steps.length === 0 || steps[steps.length - 1].status !== 'found') {
    steps.push({ left, mid: -1, right, status: 'not-found', comparisons, eliminated: [] });
  }

  return steps;
}

function getEliminated(size, left, right) {
  const elim = [];
  for (let i = 0; i < left; i++) elim.push(i);
  for (let i = right + 1; i < size; i++) elim.push(i);
  return elim;
}

function startSearch() {
  arr = parseArray();
  if (arr.length === 0) { alert('Please enter a valid array!'); return; }

  const target = parseInt(document.getElementById('targetInput').value);
  if (isNaN(target)) { alert('Please enter a valid target!'); return; }

  document.getElementById('arrayInput').value = arr.join(', ');
  steps = buildSteps(arr, target);
  currentStep = 0;
  searchDone = false;

  document.getElementById('arraySize').textContent = arr.length;
  document.getElementById('stepCount').textContent = '0';
  document.getElementById('comparisons').textContent = '0';
  document.getElementById('resultStat').textContent = '—';
  document.getElementById('logList').innerHTML = '';
  document.getElementById('searchBtn').disabled = true;
  document.getElementById('stepBtn').disabled = false;

  renderStep(-1, arr);
  addLog(0, `Array sorted. Searching for <strong>${target}</strong> in ${arr.length} elements.`, '');
}

function nextStep() {
  if (currentStep >= steps.length) return;
  const step = steps[currentStep];
  const target = parseInt(document.getElementById('targetInput').value);

  renderStep(currentStep, arr);
  document.getElementById('stepCount').textContent = currentStep + 1;
  document.getElementById('comparisons').textContent = step.comparisons;

  let msg = '';
  let cls = '';

  if (step.status === 'found') {
    msg = `Step ${currentStep + 1}: mid=${step.mid}, arr[${step.mid}]=${arr[step.mid]} = target! ✅ Found at index ${step.mid}`;
    cls = 'success';
    document.getElementById('resultStat').textContent = `Index ${step.mid}`;
    document.getElementById('stepBtn').disabled = true;
    document.getElementById('searchBtn').disabled = false;
    searchDone = true;
  } else if (step.status === 'not-found') {
    msg = `Step ${currentStep + 1}: Search space empty. ${target} not in array! ❌`;
    cls = 'fail';
    document.getElementById('resultStat').textContent = 'Not Found';
    document.getElementById('stepBtn').disabled = true;
    document.getElementById('searchBtn').disabled = false;
    searchDone = true;
  } else if (step.status === 'go-right') {
    msg = `Step ${currentStep + 1}: mid=${step.mid}, arr[${step.mid}]=${arr[step.mid]} < ${target} → search right half`;
  } else {
    msg = `Step ${currentStep + 1}: mid=${step.mid}, arr[${step.mid}]=${arr[step.mid]} > ${target} → search left half`;
  }

  addLog(currentStep + 1, msg, cls);
  currentStep++;
}

function renderStep(stepIdx, arr) {
  const display = document.getElementById('arrayDisplay');
  const ptrRow = document.getElementById('pointerRow');

  const step = stepIdx >= 0 ? steps[stepIdx] : null;

  display.innerHTML = '';
  ptrRow.innerHTML = '';

  arr.forEach((val, i) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.innerHTML = `${val}<span class="index">${i}</span>`;

    if (step) {
      if (step.status === 'found' && i === step.mid) cell.classList.add('found-cell');
      else if (step.eliminated.includes(i)) cell.classList.add('eliminated');
      else {
        if (i === step.left) cell.classList.add('left-ptr');
        if (i === step.mid) cell.classList.add('mid-ptr');
        if (i === step.right) cell.classList.add('right-ptr');
      }
    }

    display.appendChild(cell);

    const ptr = document.createElement('div');
    ptr.className = 'ptr-label';
    if (step) {
      const labels = [];
      if (i === step.left) labels.push('L');
      if (i === step.mid) labels.push('M');
      if (i === step.right) labels.push('R');
      if (labels.length > 0) {
        ptr.textContent = labels.join('/');
        ptr.classList.add(labels[0]);
      }
    }
    ptrRow.appendChild(ptr);
  });
}

function addLog(step, msg, cls) {
  const list = document.getElementById('logList');
  const li = document.createElement('li');
  li.className = `log-item ${cls}`;
  li.innerHTML = `<span class="step-num">#${step}</span><span>${msg}</span>`;
  list.appendChild(li);
  list.scrollTop = list.scrollHeight;
}

function resetSearch() {
  steps = [];
  currentStep = 0;
  searchDone = false;
  document.getElementById('stepCount').textContent = '0';
  document.getElementById('comparisons').textContent = '0';
  document.getElementById('resultStat').textContent = '—';
  document.getElementById('logList').innerHTML = '<li class="log-empty">Press Start Search to begin</li>';
  document.getElementById('searchBtn').disabled = false;
  document.getElementById('stepBtn').disabled = true;
  document.getElementById('arrayDisplay').innerHTML = '';
  document.getElementById('pointerRow').innerHTML = '';
}

window.onload = () => {
  arr = parseArray();
  document.getElementById('arraySize').textContent = arr.length;
  renderStep(-1, arr);
};