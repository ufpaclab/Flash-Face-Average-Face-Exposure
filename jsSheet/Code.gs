function doGet(e) {
  let template = HtmlService.createTemplateFromFile('index');
  template.PROLIFIC_PID = e.parameter.PROLIFIC_PID;
  template.STUDY_ID = e.parameter.STUDY_ID;
  template.SESSION_ID = e.parameter.SESSION_ID;
  return template.evaluate();
}

function GetSessionID() {
  let lock = LockService.getScriptLock();
  lock.waitLock(30000);
  
  let scriptProperties = PropertiesService.getScriptProperties();
  let currentID = ReadOrCreateProperty_(scriptProperties, '__sessionId', '0');
  let newID = parseInt(currentID) + 1;
  scriptProperties.setProperty('__sessionId', newID.toString());
  
  lock.releaseLock();
  
  return newID;
}

function Insert(id, subject_number, data) {  
  let scriptProperties = PropertiesService.getScriptProperties();
  
  let lock = LockService.getScriptLock();
  lock.waitLock(30000);
  
  let keyCount = ReadOrCreateProperty_(scriptProperties, 'keyCount', '2');
  keyCount = parseInt(keyCount);
  
  let paddedData = [id, subject_number];
  let keys = Object.keys(data);
  for (let key of keys) {
    let keyIndex = ReadOrCreateProperty_(scriptProperties, 'columnLabels_' + key, keyCount);
    if (keyIndex == keyCount);
      keyCount++;

    paddedData[keyIndex] = data[key];
  }
  scriptProperties.setProperty('keyCount', keyCount.toString());
  
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheetName = 'Results';
  let sheet = ss.getSheetByName(sheetName);
  if (sheet == null) {
    sheet = ss.insertSheet(sheetName);
  }
  sheet.appendRow(paddedData);
  lock.releaseLock();
}

function GetSubject() {
  const SUBJECT_COUNT = 30;
  let scriptProperties = PropertiesService.getScriptProperties();

  let lock = LockService.getScriptLock();
  lock.waitLock(30000);
  let subjectStatuses = [];
  for (let i = 0; i < SUBJECT_COUNT; i++) {
    let status = parseInt(ReadOrCreateProperty_(scriptProperties, 'subjectStatuses_' + i, Date.now().toString()));
    subjectStatuses.push(status);
  }

  let oldestStatus = Date.now();
  let oldestStatusIndex = -1;
  for (let i = 0; i < SUBJECT_COUNT; i++) {
    if (subjectStatuses[i] != -1 && subjectStatuses[i] < oldestStatus) {
      oldestStatus = subjectStatuses[i];
      oldestStatusIndex = i;
    }
  }

  scriptProperties.setProperty('subjectStatuses_' + oldestStatusIndex, Date.now().toString());
  lock.releaseLock();
  if (oldestStatusIndex == -1)
    return Math.floor(Math.random() * SUBJECT_COUNT);
  else
    return oldestStatusIndex;
}

function CompleteSubject(subject_number) {
  let scriptProperties = PropertiesService.getScriptProperties();
  let lock = LockService.getScriptLock();
  lock.waitLock(30000);

  scriptProperties.setProperty('subjectStatuses_' + subject_number, '-1');

  lock.releaseLock();
}


function ReadOrCreateProperty_(properties, key, defaultValue) {
  let value = properties.getProperty(key);
  if (value == null) {
    value = defaultValue.toString();
    properties.setProperty(key, value);
  }
  return value;
}