function doGet (e) {
  return HtmlService.createHtmlOutputFromFile('crunp');
}


function getSheetsInBook (id) {

  return SpreadsheetApp
  .openById(id)
  .getSheets()
  .map(function (d) {
    return d.getName();
  });
}

// get a single row of data
function getDataFromRow (id , sheetName, rowOffset) {

  return SpreadsheetApp
  .openById(id)
  .getSheetByName(sheetName)
  .getDataRange()
  .offset(rowOffset, 0, 1)
  .getValues()[0];
  
}
