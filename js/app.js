(function () {
  const STORAGE_KEY = 'uszefa-logged-in';

  const setLoggedIn = (value) => {
    if (value) {
      localStorage.setItem(STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const isLoggedIn = () => localStorage.getItem(STORAGE_KEY) === 'true';

  const bindLogin = () => {
    const form = document.querySelector('#login-form');
    if (!form) {
      return;
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      setLoggedIn(true);
      window.location.href = 'dashboard.html';
    });
  };

  const bindDashboard = () => {
    if (document.body.dataset.page !== 'dashboard') {
      return;
    }

    if (!isLoggedIn()) {
      window.location.replace('login.html');
      return;
    }

    const logoutButton = document.querySelector('[data-logout]');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        setLoggedIn(false);
        window.location.href = 'login.html';
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    bindLogin();
    bindDashboard();
  });
})();
