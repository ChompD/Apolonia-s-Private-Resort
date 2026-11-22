// ---------- Header: solid background once the page scrolls ----------
const header = document.querySelector('.site-header');

function updateHeader() {
    header.classList.toggle('is-solid', window.scrollY > 40);
}
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

// ---------- Phone / tablet menu ----------
const drawer = document.getElementById('drawer');
const menuToggle = document.querySelector('.menu-toggle');
const drawerClose = drawer.querySelector('.drawer-close');
const backdrop = document.querySelector('.drawer-backdrop');

function openMenu() {
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    drawerClose.focus();
}

function closeMenu() {
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    menuToggle.focus();
}

menuToggle.addEventListener('click', openMenu);
drawerClose.addEventListener('click', closeMenu);
backdrop.addEventListener('click', closeMenu);
drawer.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
});

// ---------- Fade sections in as they scroll into view ----------
const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealItems.forEach((el) => observer.observe(el));
} else {
    revealItems.forEach((el) => el.classList.add('is-visible'));
}

// ---------- Dates can't be in the past ----------
const today = new Date();
const todayValue = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
document.querySelectorAll('input[type="date"]').forEach((input) => {
    input.min = todayValue;
});

// ---------- Availability calendar (contact page) ----------
// Loads the public Google Calendar once its ID is filled in on the page.
// Month view on wider screens, agenda list on phones.
const calendarBox = document.querySelector('[data-calendar-id]');
const calendarId = calendarBox ? calendarBox.dataset.calendarId.trim() : '';

if (calendarId) {
    const phone = window.matchMedia('(max-width: 640px)');
    const iframe = document.createElement('iframe');
    iframe.title = 'Availability calendar';
    iframe.loading = 'lazy';

    const setCalendarView = () => {
        const params = new URLSearchParams({
            src: calendarId,
            ctz: 'Asia/Manila',
            mode: phone.matches ? 'AGENDA' : 'MONTH',
            showTitle: '0',
            showPrint: '0',
            showTabs: '0',
            showCalendars: '0',
            showTz: '0',
        });
        iframe.src = 'https://calendar.google.com/calendar/embed?' + params.toString();
    };

    setCalendarView();
    phone.addEventListener('change', setCalendarView);
    calendarBox.replaceChildren(iframe);
}

// ---------- Contact form ----------
const form = document.getElementById('contact-form');

if (form) {
    const status = form.querySelector('.form-status');

    // Fill in choices passed from the home page booking strip
    const params = new URLSearchParams(window.location.search);
    ['date', 'package', 'guests'].forEach((key) => {
        const value = params.get(key);
        if (value && form.elements[key]) form.elements[key].value = value;
    });
    if (params.has('package')) {
        form.elements.subject.value = params.get('package') + ' booking inquiry';
    }

    // Open the visitor's email app with the message ready to send
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
            status.textContent = 'Please fill in your name, a valid e-mail and a message.';
            form.querySelector(':invalid').focus();
            return;
        }

        const data = new FormData(form);
        const value = (key) => (data.get(key) || '').trim();
        const subject = value('subject') || 'Inquiry from ' + value('name');
        const body = [
            value('message'),
            '',
            'Name: ' + value('name'),
            'E-mail: ' + value('email'),
            'Contact no.: ' + (value('contact') || '-'),
            'Package: ' + (value('package') || 'Not sure yet'),
            'Preferred date: ' + (value('date') || '-'),
            'Number of guests: ' + (value('guests') || '-'),
        ].join('\n');

        window.location.href =
            'mailto:Apoloniasresort@gmail.com' +
            '?subject=' + encodeURIComponent(subject) +
            '&body=' + encodeURIComponent(body);

        status.textContent = 'Your email app should open now. If it doesn’t, email us at Apoloniasresort@gmail.com.';
    });
}
