document.querySelectorAll('[data-email-user][data-email-domain]').forEach((element) => {
  const user = element.dataset.emailUser || '';
  const domain = element.dataset.emailDomain || '';
  if (!user || !domain) {
    return;
  }

  const email = `${user}@${domain}`;
  const label = element.dataset.emailLabel || email;

  if (element.tagName === 'A') {
    element.href = `mailto:${email}`;
  }

  element.setAttribute('aria-label', element.dataset.emailAria || label);
});