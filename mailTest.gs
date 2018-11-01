function mt() {

  // move this out of the loop
  var file = DriveApp.getFileById('0B3R47ecEHS2-WUFRTmFaT2piWDg');
  Logger.log (MailApp.getRemainingDailyQuota());
  var fileBlob = file.getBlob();
  
  MailApp.sendEmail("info@theperch.in", "the file", "your file" , {
    attachments: [fileBlob]
  });
  
}
