function myFunction() {
  var file = DriveApp.getFileById('1Qit3hf-gZLtC1z3XhmVvHW13Qbmp5YK2C5xsn05idl4');
  var owner = file.getOwner();
  Logger.log (owner.getEmail());
  Logger.log (owner.getPhotoUrl());
  Logger.log (owner.getName());
}
