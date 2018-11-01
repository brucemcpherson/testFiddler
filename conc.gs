function combine () {

  // assume that each of these returns an array of values
  // and the objective is simply to append them
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ss = SpreadsheetApp.openById("1h9IGIShgVBVUrUjjawk5MaCEQte_7t32XeEP1Z5jXKQ");
  var values = [].concat(
    concatCustomer() || [],
    concatOther() || [],
    concat() || []
  )
  .map (function (d) {
    return [d];
  });

  var sheet = ss.getSheetByName("Calc");
  sheet.getRange('A2:A').clearContent();
  sheet.getRange(2, 1, values.length, 1).setValues(values);
  
  function concatCustomer(){
    return ["z","xx"];
  }
  
  function concatOther () {
    return ["o1","o2"];
  }
  
  function concat () {
    return ["a"];
  }
  
}

