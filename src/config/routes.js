/**
 * Application Route Constants
 * Centralized route paths for easier maintenance and refactoring
 */

export const ROUTES = {
  // Public Routes
  LOGIN: '/',
  
  // Main Application Routes
  HOME: '/home',
  ROOM: '/room',
  ORDER: '/order',
  GUEST_ORDER: '/guestOrder',
  REPORT: '/report',
  CHARGES: '/charges',
  
  // Static Forms Routes
  STATIC_FORMS: '/staticForms',
  INCIDENT_FORM_CREATE: '/staticForms/incidentForm-create',
  INCIDENT_FORM_EDIT: '/staticForms/incidentForm-edit/:id',
  LOG_FORM_CREATE: '/staticForms/logForm-create',
  MOVE_IN_FORM_CREATE: '/staticForms/moveInSummaryForm-create',
  MOVE_IN_FORM_EDIT: '/staticForms/moveInSummaryForm-edit/:id',
};

export default ROUTES;
