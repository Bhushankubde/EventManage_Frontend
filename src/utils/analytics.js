export const analytics = {
  pageView: (pageName) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
      });
    }
  },

  trackEvent: (eventName, params) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params);
    }
  },

  trackBooking: (bookingId, totalAmount) => {
    analytics.trackEvent('purchase', {
      transaction_id: bookingId,
      value: totalAmount,
      currency: 'USD',
    });
  },

  trackSearch: (searchQuery) => {
    analytics.trackEvent('search', {
      search_term: searchQuery,
    });
  },
};
