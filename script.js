const toastEl = document.getElementById('toast-banner');
let toastTimer;

function showToast(message, isError = false) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.style.backgroundColor = isError ? '#dc2626' : '#0f172a';
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3200);
}

document.querySelectorAll('.info-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const infoText = link.getAttribute('data-info') || 'Pesapal Biz automated settlement details.';
    showToast(infoText);
  });
});

const dateInput = document.getElementById('next-processing');
const bankSelect = document.getElementById('default-bank');
const scheduleForm = document.getElementById('schedule-form');
const todayISO = new Date().toISOString().split('T')[0];

function showError(inputEl, message) {
  clearError(inputEl);
  inputEl.classList.add('input-error');
  const err = document.createElement('span');
  err.className = 'error-text';
  err.textContent = message;
  inputEl.closest('.form-group').appendChild(err);
}

function clearError(inputEl) {
  inputEl.classList.remove('input-error');
  const existing = inputEl.closest('.form-group').querySelector('.error-text');
  if (existing) existing.remove();
}

if (dateInput) {
  dateInput.addEventListener('focus', () => {
    dateInput.type = 'date';
    dateInput.min = todayISO;
  });
  dateInput.addEventListener('blur', () => {
    if (!dateInput.value) dateInput.type = 'text';
  });
  dateInput.addEventListener('change', () => {
    if (dateInput.value && dateInput.value < todayISO) {
      showError(dateInput, 'Please pick today or a future date.');
    } else if (dateInput.value) {
      clearError(dateInput);
    }
  });
}

if (bankSelect) {
  bankSelect.addEventListener('change', () => {
    if (bankSelect.value) clearError(bankSelect);
  });
}

function validateWithdrawalForm() {
  let isValid = true;

  if (!dateInput.value.trim()) {
    showError(dateInput, 'Please pick a Next Processing date.');
    isValid = false;
  } else if (dateInput.value < todayISO) {
    showError(dateInput, 'Processing date cannot be in the past.');
    isValid = false;
  } else {
    clearError(dateInput);
  }

  if (!bankSelect.value) {
    showError(bankSelect, 'Please select your Default Bank.');
    isValid = false;
  } else {
    clearError(bankSelect);
  }

  return isValid;
}

if (scheduleForm) {
  scheduleForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateWithdrawalForm()) {
      const currency = document.querySelector('input[name="currency"]:checked')?.value || 'KES';
      const freq = document.getElementById('frequency')?.value || 'monthly';
      showToast(`✓ Saved: ${currency} ${freq} schedule to ${bankSelect.value} on ${dateInput.value}.`);
    } else {
      showToast('Please fix the highlighted form errors.', true);
    }
  });
}
const hideBtn = document.querySelector('.hide-balance');
const balanceValues = document.querySelectorAll('.bal-col strong');
const originalAmounts = Array.from(balanceValues).map(el => el.textContent);
let isHidden = false;

if (hideBtn) {
  hideBtn.addEventListener('click', () => {
    isHidden = !isHidden;
    balanceValues.forEach((el, index) => {
      el.textContent = isHidden ? '••••••' : originalAmounts[index];
    });
    hideBtn.textContent = isHidden ? '👁️ Show Balance' : '👁️ Hide Balance';
  });
}

const withdrawBtn = document.querySelector('.withdraw-btn');
if (withdrawBtn) {
  withdrawBtn.addEventListener('click', () => {
    if (validateWithdrawalForm()) {
      showToast(`✓ Withdrawal request sent to ${bankSelect.value} for ${dateInput.value}.`);
    } else {
      showToast('Select a processing date and bank in Step 1 first.', true);
    }
  });
}

const actionTiles = document.querySelectorAll('.action-tile');
const actionPanel = document.getElementById('action-panel');

const actionViews = {
  Transactions: '',
  Statements: '<strong>📄 November 2026 Statement:</strong> Ready for export (142 settled transactions).',
  Invoices: '<strong>🧾 Open Invoices:</strong> 3 unpaid customer invoices totaling <strong>KES 48,500</strong>.'
};

actionTiles.forEach(tile => {
  tile.addEventListener('click', () => {
    actionTiles.forEach(t => t.classList.remove('active-tile'));
    tile.classList.add('active-tile');

    const mode = tile.getAttribute('data-action');
    if (mode === 'Transactions') {
      actionPanel.classList.add('hidden');
      actionPanel.innerHTML = '';
    } else {
      actionPanel.innerHTML = actionViews[mode];
      actionPanel.classList.remove('hidden');
    }
    showToast(`Switched Quick Action to ${mode}`);
  });
});

const viewMoreBtn = document.getElementById('view-more-btn');
const extraTxItems = document.querySelectorAll('.extra-tx');
let isExpanded = false;

if (viewMoreBtn) {
  viewMoreBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isExpanded = !isExpanded;
    extraTxItems.forEach(item => {
      item.classList.toggle('hidden', !isExpanded);
    });
    viewMoreBtn.textContent = isExpanded ? 'Show Less' : 'View More';
  });
}

document.getElementById('nav-settings')?.addEventListener('click', () => {
  showToast('Branch Settings: Gigiri Village Market (Active)');
});
document.getElementById('nav-alerts')?.addEventListener('click', () => {
  showToast('2 new settled POS payments today.');
});

const dailyTotals = {
  Mon: 'KES 62,400',
  Tue: 'KES 84,100',
  Wed: 'KES 71,500',
  Thu: 'KES 118,900',
  Fri: 'KES 96,300',
  Sat: 'KES 52,000'
};

const barCols = document.querySelectorAll('.bar-col');
const chartTitle = document.querySelector('.chart-box .mini-title');

barCols.forEach(col => {
  col.addEventListener('click', () => {
    document.querySelectorAll('.bar-fill').forEach(bar => bar.classList.remove('active'));
    const fill = col.querySelector('.bar-fill');
    const day = col.querySelector('.bar-day').textContent;
    fill.classList.add('active');
    if (chartTitle) {
      chartTitle.textContent = `Revenue Breakdown — ${day}: ${dailyTotals[day]}`;
    }
  });
});

const exportBtn = document.querySelector('.export-btn');
if (exportBtn) {
  exportBtn.addEventListener('click', () => {
    const originalText = exportBtn.textContent;
    exportBtn.textContent = 'Downloading...';
    exportBtn.style.opacity = '0.75';
    setTimeout(() => {
      exportBtn.textContent = '✓ Downloaded';
      exportBtn.style.backgroundColor = '#16a34a';
      exportBtn.style.opacity = '1';
      showToast('✓ November 2026 Statement PDF downloaded.');
      setTimeout(() => {
        exportBtn.textContent = originalText;
        exportBtn.style.backgroundColor = '#1e293b';
      }, 2000);
    }, 800);
  });
}
