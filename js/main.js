/**
 * NOIR BARBER — Application Entry Point & Modules (Stages 1–7)
 * Инициализирует навигацию, анимации и интерактивную форму бронирования.
 */
(function bootstrapNoir(global) {
  'use strict';

  const NOIR = (global.NOIR = global.NOIR || {});

  /**
   * Booking Module (Stage 7)
   * Управляет интерактивной формой записи: валидация полей, телефонная маска,
   * выбор временных слотов, живое резюме визита, модальное окно политики
   * и демонстрационное состояние подготовленной заявки (без отправки на сервер).
   */
  const Booking = {
    form: null,
    statusBox: null,
    submitBtn: null,
    editBtn: null,
    nameInput: null,
    phoneInput: null,
    serviceSelect: null,
    masterSelect: null,
    dateInput: null,
    timeInput: null,
    consentCheckbox: null,
    slotsContainer: null,
    slotButtons: [],
    policyModal: null,
    policyOpenBtn: null,
    policyCloseBtn: null,
    policyConfirmBtn: null,
    policyBackdrop: null,

    // Live summary DOM nodes
    summaryService: null,
    summaryDuration: null,
    summaryMaster: null,
    summaryDate: null,
    summaryTime: null,
    summaryTotal: null,

    // Review DOM nodes
    reviewName: null,
    reviewPhone: null,
    reviewService: null,
    reviewMaster: null,
    reviewDateTime: null,

    serviceMeta: {
      haircut: { name: 'Мужская стрижка', price: '2 000 ₽', duration: '60 мин' },
      machine: { name: 'Стрижка машинкой', price: '1 200 ₽', duration: '30 мин' },
      beard: { name: 'Моделирование бороды', price: '1 500 ₽', duration: '40 мин' },
      complex: { name: 'Комплекс «Стрижка + борода»', price: '3 000 ₽', duration: '90 мин' },
      'royal-shave': { name: 'Королевское бритьё', price: '1 800 ₽', duration: '45 мин' },
    },

    masterMeta: {
      any: 'Любой свободный мастер',
      volkov: 'Александр Волков (Senior Barber)',
      orlov: 'Михаил Орлов (Barber)',
      smirnov: 'Даниил Смирнов (Barber)',
    },

    init() {
      this.form = document.getElementById('booking-form');
      if (!this.form) return;

      this.statusBox = document.getElementById('booking-status');
      this.submitBtn = document.getElementById('booking-submit-btn');
      this.editBtn = document.getElementById('booking-edit-btn');
      this.nameInput = document.getElementById('booking-name');
      this.phoneInput = document.getElementById('booking-phone');
      this.serviceSelect = document.getElementById('booking-service');
      this.masterSelect = document.getElementById('booking-master');
      this.dateInput = document.getElementById('booking-date');
      this.timeInput = document.getElementById('booking-time');
      this.consentCheckbox = document.getElementById('booking-consent');
      this.slotsContainer = document.getElementById('booking-slots-container');
      this.slotButtons = Array.from(document.querySelectorAll('.booking-slot'));

      this.summaryService = document.getElementById('summary-service');
      this.summaryDuration = document.getElementById('summary-duration');
      this.summaryMaster = document.getElementById('summary-master');
      this.summaryDate = document.getElementById('summary-date');
      this.summaryTime = document.getElementById('summary-time');
      this.summaryTotal = document.getElementById('summary-total');

      this.reviewName = document.getElementById('review-name');
      this.reviewPhone = document.getElementById('review-phone');
      this.reviewService = document.getElementById('review-service');
      this.reviewMaster = document.getElementById('review-master');
      this.reviewDateTime = document.getElementById('review-datetime');

      this.policyModal = document.getElementById('policy-modal');
      this.policyOpenBtn = document.getElementById('policy-open-btn');
      this.policyCloseBtn = document.getElementById('policy-close-btn');
      this.policyConfirmBtn = document.getElementById('policy-confirm-btn');
      this.policyBackdrop = document.getElementById('policy-backdrop');

      this.setupDateConstraint();
      this.bindPhoneMask();
      this.bindSlotSelection();
      this.bindLiveSummary();
      this.bindFormSubmission();
      this.bindEditAction();
      this.bindMasterDelegation();
      this.bindPolicyModal();
    },

    setupDateConstraint() {
      if (!this.dateInput) return;
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const minDate = `${yyyy}-${mm}-${dd}`;
      this.dateInput.min = minDate;
    },

    bindPhoneMask() {
      if (!this.phoneInput) return;

      const formatPhone = (val) => {
        const digits = val.replace(/\D/g, '');
        if (!digits) return '';

        let normDigits = digits;
        if (normDigits[0] === '9') {
          normDigits = '7' + normDigits;
        } else if (normDigits[0] === '8') {
          normDigits = '7' + normDigits.slice(1);
        } else if (normDigits[0] !== '7') {
          normDigits = '7' + normDigits;
        }
        normDigits = normDigits.slice(0, 11);

        let res = '+7';
        if (normDigits.length > 1) {
          res += ' (' + normDigits.slice(1, 4);
        }
        if (normDigits.length >= 4) {
          res += ') ' + normDigits.slice(4, 7);
        }
        if (normDigits.length >= 7) {
          res += '-' + normDigits.slice(7, 9);
        }
        if (normDigits.length >= 9) {
          res += '-' + normDigits.slice(9, 11);
        }
        return res;
      };

      this.phoneInput.addEventListener('input', (e) => {
        const oldVal = this.phoneInput.value;
        const formatted = formatPhone(oldVal);
        this.phoneInput.value = formatted;
        this.clearFieldError(this.phoneInput);
      });

      this.phoneInput.addEventListener('focus', () => {
        if (!this.phoneInput.value.trim()) {
          this.phoneInput.value = '+7 (';
        }
      });

      this.phoneInput.addEventListener('blur', () => {
        if (this.phoneInput.value.trim() === '+7 (' || this.phoneInput.value.trim() === '+7') {
          this.phoneInput.value = '';
        }
      });
    },

    selectSlot(index) {
      if (index < 0 || index >= this.slotButtons.length) return;
      const targetBtn = this.slotButtons[index];

      this.slotButtons.forEach((b, i) => {
        const isCurrent = i === index;
        b.classList.toggle('is-selected', isCurrent);
        b.setAttribute('aria-checked', isCurrent ? 'true' : 'false');
        b.setAttribute('tabindex', isCurrent ? '0' : '-1');
      });

      targetBtn.focus();
      const timeVal = targetBtn.getAttribute('data-time') || '';
      this.timeInput.value = timeVal;
      this.clearFieldError(this.timeInput);
      this.updateSummary();
    },

    bindSlotSelection() {
      if (!this.slotButtons.length || !this.timeInput) return;

      const selectedIdx = this.slotButtons.findIndex((b) => b.classList.contains('is-selected'));
      this.slotButtons.forEach((b, i) => {
        const isInitialFocusable = selectedIdx >= 0 ? i === selectedIdx : i === 0;
        b.setAttribute('tabindex', isInitialFocusable ? '0' : '-1');
        b.setAttribute('aria-checked', b.classList.contains('is-selected') ? 'true' : 'false');
      });

      this.slotButtons.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
          this.selectSlot(idx);
        });

        btn.addEventListener('keydown', (e) => {
          let nextIdx = -1;
          const total = this.slotButtons.length;

          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            nextIdx = (idx + 1) % total;
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            nextIdx = (idx - 1 + total) % total;
          } else if (e.key === 'Home') {
            e.preventDefault();
            nextIdx = 0;
          } else if (e.key === 'End') {
            e.preventDefault();
            nextIdx = total - 1;
          }

          if (nextIdx !== -1) {
            this.selectSlot(nextIdx);
          }
        });
      });
    },

    bindLiveSummary() {
      const inputs = [this.serviceSelect, this.masterSelect, this.dateInput];
      inputs.forEach((el) => {
        if (!el) return;
        el.addEventListener('change', () => {
          this.clearFieldError(el);
          this.updateSummary();
        });
      });

      if (this.nameInput) {
        this.nameInput.addEventListener('input', () => this.clearFieldError(this.nameInput));
      }

      if (this.consentCheckbox) {
        this.consentCheckbox.addEventListener('change', () => this.clearFieldError(this.consentCheckbox));
      }
    },

    formatDisplayDate(isoVal) {
      if (!isoVal) return 'Не выбрана';
      const parts = isoVal.split('-');
      if (parts.length !== 3) return isoVal;
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    },

    updateSummary() {
      // Service
      const serviceVal = this.serviceSelect ? this.serviceSelect.value : '';
      const service = this.serviceMeta[serviceVal];
      if (this.summaryService) {
        this.summaryService.textContent = service ? service.name : 'Не выбрана';
      }
      if (this.summaryDuration) {
        this.summaryDuration.textContent = service ? service.duration : '—';
      }
      if (this.summaryTotal) {
        this.summaryTotal.textContent = service ? service.price : '—';
      }

      // Master
      const masterVal = this.masterSelect ? this.masterSelect.value : 'any';
      if (this.summaryMaster) {
        this.summaryMaster.textContent = this.masterMeta[masterVal] || 'Любой свободный мастер';
      }

      // Date
      const dateVal = this.dateInput ? this.dateInput.value : '';
      if (this.summaryDate) {
        this.summaryDate.textContent = this.formatDisplayDate(dateVal);
      }

      // Time
      const timeVal = this.timeInput ? this.timeInput.value : '';
      if (this.summaryTime) {
        this.summaryTime.textContent = timeVal ? `${timeVal} MSK` : 'Не выбрано';
      }
    },

    showFieldError(field, message) {
      const fieldId = field.getAttribute('id');
      const errorEl = document.getElementById(`${fieldId}-error`);
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('is-active');
      }
      field.setAttribute('aria-invalid', 'true');
    },

    clearFieldError(field) {
      const fieldId = field.getAttribute('id');
      const errorEl = document.getElementById(`${fieldId}-error`);
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('is-active');
      }
      field.setAttribute('aria-invalid', 'false');
    },

    validate() {
      let isValid = true;
      let firstInvalidEl = null;

      // 1. Name
      const nameVal = this.nameInput ? this.nameInput.value.trim() : '';
      if (!nameVal || nameVal.length < 2) {
        this.showFieldError(this.nameInput, 'Укажите имя клиента (не менее 2 символов)');
        isValid = false;
        if (!firstInvalidEl) firstInvalidEl = this.nameInput;
      } else {
        this.clearFieldError(this.nameInput);
      }

      // 2. Phone
      const digits = this.phoneInput ? this.phoneInput.value.replace(/\D/g, '') : '';
      if (!digits || digits.length < 11) {
        this.showFieldError(this.phoneInput, 'Укажите полный номер телефона (10 цифр после кода)');
        isValid = false;
        if (!firstInvalidEl) firstInvalidEl = this.phoneInput;
      } else {
        this.clearFieldError(this.phoneInput);
      }

      // 3. Service
      const serviceVal = this.serviceSelect ? this.serviceSelect.value : '';
      if (!serviceVal) {
        this.showFieldError(this.serviceSelect, 'Пожалуйста, выберите услугу из меню');
        isValid = false;
        if (!firstInvalidEl) firstInvalidEl = this.serviceSelect;
      } else {
        this.clearFieldError(this.serviceSelect);
      }

      // 4. Master
      const masterVal = this.masterSelect ? this.masterSelect.value : '';
      if (!masterVal) {
        this.showFieldError(this.masterSelect, 'Пожалуйста, выберите мастера');
        isValid = false;
        if (!firstInvalidEl) firstInvalidEl = this.masterSelect;
      } else {
        this.clearFieldError(this.masterSelect);
      }

      // 5. Date
      const dateVal = this.dateInput ? this.dateInput.value : '';
      if (!dateVal) {
        this.showFieldError(this.dateInput, 'Выберите желаемую дату визита');
        isValid = false;
        if (!firstInvalidEl) firstInvalidEl = this.dateInput;
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const chosen = new Date(dateVal);
        if (chosen < today) {
          this.showFieldError(this.dateInput, 'Дата не может быть в прошлом');
          isValid = false;
          if (!firstInvalidEl) firstInvalidEl = this.dateInput;
        } else {
          this.clearFieldError(this.dateInput);
        }
      }

      // 6. Time
      const timeVal = this.timeInput ? this.timeInput.value : '';
      if (!timeVal) {
        this.showFieldError(this.timeInput, 'Выберите желаемое время визита');
        isValid = false;
        if (!firstInvalidEl) firstInvalidEl = this.slotsContainer || this.timeInput;
      } else {
        this.clearFieldError(this.timeInput);
      }

      // 7. Consent
      if (this.consentCheckbox && !this.consentCheckbox.checked) {
        this.showFieldError(this.consentCheckbox, 'Необходимо согласие на обработку персональных данных');
        isValid = false;
        if (!firstInvalidEl) firstInvalidEl = this.consentCheckbox;
      } else if (this.consentCheckbox) {
        this.clearFieldError(this.consentCheckbox);
      }

      if (firstInvalidEl && typeof firstInvalidEl.focus === 'function') {
        firstInvalidEl.focus();
      }

      return isValid;
    },

    bindFormSubmission() {
      if (!this.form) return;

      this.form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Protection against duplicate clicking
        if (this.submitBtn && this.submitBtn.disabled) return;

        const isValid = this.validate();
        if (!isValid) return;

        // Immediate protection without fake delay
        if (this.submitBtn) {
          this.submitBtn.disabled = true;
        }

        this.renderConfirmation();
      });
    },

    renderConfirmation() {
      const name = this.nameInput ? this.nameInput.value.trim() : '';
      const phone = this.phoneInput ? this.phoneInput.value.trim() : '';
      const serviceKey = this.serviceSelect ? this.serviceSelect.value : '';
      const service = this.serviceMeta[serviceKey];
      const masterKey = this.masterSelect ? this.masterSelect.value : 'any';
      const master = this.masterMeta[masterKey] || 'Любой свободный мастер';
      const date = this.formatDisplayDate(this.dateInput ? this.dateInput.value : '');
      const time = this.timeInput ? this.timeInput.value : '';

      if (this.reviewName) this.reviewName.textContent = name;
      if (this.reviewPhone) this.reviewPhone.textContent = phone;
      if (this.reviewService) {
        this.reviewService.textContent = service ? `${service.name} (${service.price})` : '—';
      }
      if (this.reviewMaster) this.reviewMaster.textContent = master;
      if (this.reviewDateTime) {
        this.reviewDateTime.textContent = `${date} в ${time}`;
      }

      // Hide form, show confirmation box smoothly
      this.form.hidden = true;
      if (this.statusBox) {
        this.statusBox.hidden = false;
        this.statusBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    },

    bindEditAction() {
      if (!this.editBtn) return;
      this.editBtn.addEventListener('click', () => {
        if (this.statusBox) this.statusBox.hidden = true;
        if (this.form) {
          this.form.hidden = false;
          if (this.submitBtn) this.submitBtn.disabled = false;
        }
      });
    },

    bindMasterDelegation() {
      // Automatic pre-selection of master when clicking "Записаться" in Masters section
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href="#booking"]');
        if (!link) return;

        const profile = link.closest('.master-profile');
        if (!profile || !this.masterSelect) return;

        const nameEl = profile.querySelector('.master-profile__name');
        if (!nameEl) return;
        const nameText = nameEl.textContent.trim();

        if (nameText.includes('Волков')) {
          this.masterSelect.value = 'volkov';
        } else if (nameText.includes('Орлов')) {
          this.masterSelect.value = 'orlov';
        } else if (nameText.includes('Смирнов')) {
          this.masterSelect.value = 'smirnov';
        }

        this.clearFieldError(this.masterSelect);
        this.updateSummary();
      });
    },

    bindPolicyModal() {
      if (!this.policyModal) return;

      let lastFocusedTrigger = null;

      const getFocusableElements = () => {
        const dialog = this.policyModal.querySelector('.policy-modal__dialog') || this.policyModal;
        return Array.from(
          dialog.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
      };

      const openModal = (triggerEl) => {
        lastFocusedTrigger = triggerEl || document.activeElement;
        this.policyModal.hidden = false;
        document.body.classList.add('is-locked');

        const focusable = getFocusableElements();
        if (focusable.length) {
          (this.policyCloseBtn || focusable[0]).focus();
        }
      };

      const closeModal = () => {
        this.policyModal.hidden = true;
        document.body.classList.remove('is-locked');
        if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === 'function') {
          lastFocusedTrigger.focus();
        } else if (this.policyOpenBtn) {
          this.policyOpenBtn.focus();
        }
      };

      if (this.policyOpenBtn) {
        this.policyOpenBtn.addEventListener('click', (e) => {
          openModal(e.currentTarget);
        });
      }
      if (this.policyCloseBtn) this.policyCloseBtn.addEventListener('click', closeModal);
      if (this.policyConfirmBtn) this.policyConfirmBtn.addEventListener('click', closeModal);
      if (this.policyBackdrop) this.policyBackdrop.addEventListener('click', closeModal);

      // Focus Trap: Tab, Shift + Tab, Escape
      document.addEventListener('keydown', (e) => {
        if (this.policyModal.hidden) return;

        if (e.key === 'Escape') {
          e.preventDefault();
          closeModal();
          return;
        }

        if (e.key === 'Tab') {
          const focusable = getFocusableElements();
          if (!focusable.length) {
            e.preventDefault();
            return;
          }
          const firstEl = focusable[0];
          const lastEl = focusable[focusable.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstEl || !this.policyModal.contains(document.activeElement)) {
              e.preventDefault();
              lastEl.focus();
            }
          } else {
            if (document.activeElement === lastEl || !this.policyModal.contains(document.activeElement)) {
              e.preventDefault();
              firstEl.focus();
            }
          }
        }
      });
    },
  };

  function initApp() {
    if (NOIR.Navigation && typeof NOIR.Navigation.init === 'function') {
      NOIR.Navigation.init();
    }

    if (NOIR.Animations && typeof NOIR.Animations.init === 'function') {
      NOIR.Animations.init();
    }

    Booking.init();
    NOIR.Booking = Booking;

    document.documentElement.classList.add('is-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})(window);
