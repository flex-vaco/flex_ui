import APP_CONSTANTS from "../appConstants";
import Swal from 'sweetalert2';

const menuAccessRoles = [
  APP_CONSTANTS.USER_ROLES.MANAGER,
  APP_CONSTANTS.USER_ROLES.ADMINISTRATOR,
  APP_CONSTANTS.USER_ROLES.PRODUCER
];
const utilizationAccessRoles = [
  APP_CONSTANTS.USER_ROLES.MANAGER,
  APP_CONSTANTS.USER_ROLES.ADMINISTRATOR,
  APP_CONSTANTS.USER_ROLES.PRODUCER
];
const allocationAccessRoles = [
  APP_CONSTANTS.USER_ROLES.MANAGER,
  APP_CONSTANTS.USER_ROLES.ADMINISTRATOR,
  APP_CONSTANTS.USER_ROLES.PRODUCER
];
const employeeAccessRoles = [
  APP_CONSTANTS.USER_ROLES.MANAGER,
  APP_CONSTANTS.USER_ROLES.ADMINISTRATOR,
];
const projectAccessRoles = [
  APP_CONSTANTS.USER_ROLES.MANAGER,
  APP_CONSTANTS.USER_ROLES.ADMINISTRATOR,
  APP_CONSTANTS.USER_ROLES.PRODUCER
];
const clientAccessRoles = [
  APP_CONSTANTS.USER_ROLES.MANAGER,
  APP_CONSTANTS.USER_ROLES.ADMINISTRATOR
];
const lineOfBusinessAccessRoles = [
  APP_CONSTANTS.USER_ROLES.ADMINISTRATOR
];
const reportAccessRoles = [
  APP_CONSTANTS.USER_ROLES.MANAGER,
  APP_CONSTANTS.USER_ROLES.ADMINISTRATOR,
  APP_CONSTANTS.USER_ROLES.PRODUCER
];
const reportAccessTimesheetApprove = [
  APP_CONSTANTS.USER_ROLES.MANAGER,
  APP_CONSTANTS.USER_ROLES.PRODUCER
];
const categoryAccessRole = [
  APP_CONSTANTS.USER_ROLES.ADMINISTRATOR
];
const hiringAccessRole = [
  APP_CONSTANTS.USER_ROLES.MANAGER,
  APP_CONSTANTS.USER_ROLES.PRODUCER
];
const aiChatAccessRoles = reportAccessRoles;
const userAccessRoles = [APP_CONSTANTS.USER_ROLES.ADMINISTRATOR];
const locationAccessRoles = [APP_CONSTANTS.USER_ROLES.ADMINISTRATOR];
export const activeUserRole = localStorage.getItem("user_role");
export const activeUser = JSON.parse(localStorage.getItem("user"));

export const userIsEmployee = () => {
  return (activeUserRole === APP_CONSTANTS.USER_ROLES.EMPLOYEE) ? true : false;
};

export const userIsProducer = () => {
  return (activeUserRole === APP_CONSTANTS.USER_ROLES.PRODUCER) ? true : false;
};

export const userIsManager = () => {
  return (activeUserRole === APP_CONSTANTS.USER_ROLES.MANAGER) ? true : false;
};

export const hasMenuAccess = (activeUserRole) => {
  return menuAccessRoles.includes(activeUserRole) ? true : false;
};
export const hasEmployeeAccess = (activeUserRole) => {
  return employeeAccessRoles.includes(activeUserRole) ? true : false;
};
export const hasAllocationAccess = (activeUserRole) => {
  return allocationAccessRoles.includes(activeUserRole) ? true : false;
};
export const hasProjectAccess = (activeUserRole) => {
  return projectAccessRoles.includes(activeUserRole) ? true : false;
};
export const hasUtilizationAccess = (activeUserRole) => {
  return utilizationAccessRoles.includes(activeUserRole) ? true : false;
};
export const hasUserAccess = (activeUserRole) => {
  return userAccessRoles.includes(activeUserRole) ? true : false;
};
export const hasLocationAccess = (activeUserRole) => {
  return locationAccessRoles.includes(activeUserRole) ? true : false;
};
export const hasReportAccess = (activeUserRole) => {
  return reportAccessRoles.includes(activeUserRole) ? true : false;
};
export const hasAIChatAccess = (activeUserRole) => {
  return aiChatAccessRoles.includes(activeUserRole) ? true : false;
};
export const hasClientAccess = (activeUserRole) => {
  return clientAccessRoles.includes(activeUserRole) ? true : false;
};
export const hasLineOfBusinessAccess = (activeUserRole) => {
  return lineOfBusinessAccessRoles.includes(activeUserRole) ? true : false;
};
export const hasApproveTimesheetAccess = (activeUserRole) => {
  return reportAccessTimesheetApprove.includes(activeUserRole) ? true : false;
};
export const hasCategoriesAccess = (activeUserRole) => {
  return categoryAccessRole.includes(activeUserRole) ? true : false;
};
export const hasHiringAccess = (activeUserRole) => {
  return hiringAccessRole.includes(activeUserRole) ? true : false;
};
export const validateForm = (valdiationFields) => {
  //remove all previous invalid-feedback divs
  document.querySelectorAll('.invalid-feedback').forEach(f => { f.remove() })
  let allFieldsAreValid = true;
  let form = '';
  valdiationFields.forEach((field) => {
    if (!field.checkValidity()) {
      form = field.form;
      field.classList.add('is-invalid');
      const invDiv = document.createElement('div');
      invDiv.textContent = `${field.labels[0].innerText} is Required!`;
      invDiv.setAttribute('class', 'invalid-feedback');
      field.insertAdjacentElement('afterend', invDiv);
      allFieldsAreValid = false;
    } else {
      field.classList.remove('is-invalid');
    }
  })
  if (form) form.classList.add('was-validated');
  return allFieldsAreValid;
};

export const validateUploadFile = (file, fileFor) => {
  let validFile = true;
  if (!file || !fileFor){
      console.error("Usage: validateUploadFile(file: <uploadFile>, fileFor: <string>)");
      validFile = false;
  } 
  const size = file.size;
  const name = file.name;
  const type = file.type?.split('/')[1]?.trim();
  const maxAllowedUploadSize = 3e6; //3MB

  let allowedFileTypes = [];
  switch (fileFor) {
      case "image":
          allowedFileTypes = ["png", "jpg", "jpeg"];
          break;
      case "resume":
          allowedFileTypes = ["pdf"];
          break;
      default:
          allowedFileTypes = [];
  }

  if ((!size && isNaN(size)) || (size > maxAllowedUploadSize)){ // should not be greated than 1MB
      Swal.fire({
          icon: 'error',
          title: 'Invalid File',
          text: 'Please ensure file size is less than 3MB',
          showConfirmButton: true
      });
      validFile = false;
  } 
  if(!allowedFileTypes.includes(type)){
      Swal.fire({
          icon: 'error',
          title: `Invalid File-type: ${type}`,
          text: `Valid types for ${fileFor} include: ${allowedFileTypes}`,
          showConfirmButton: true
      });
      validFile = false;
  } 
  return validFile;
};