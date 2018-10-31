function highlightDuplicates() {
  var ss = SpreadsheetApp.openById('1181bwZspoKoP98o4KuzO0S11IsvE59qCwiw4la9kL4o');
  var sheet = ss.getSheetByName("highlight-duplicates");
  var singleColor = "#ffffff";
  var dupColor = " #ffeb3b";
  
  // get the backgrounds
  var data = sheet.getDataRange().getValues();

  // look through the data and get the 
  var colors = data.map (function (row, i , a) {
    
    // filter out matches for this row - assuming every column needs to match to be a dup
    var matches = a.filter (function (d) {
      return d.every(function (e,j) {
        return e === row[j];
      });
    });
    
    // should be at least 1
    if (!matches.length) throw 'failed to match target row:' + i;
    
    // if its 1, then its single, otherwise dup 
    return row.map(function (e) {
      return matches.length === 1 ? singleColor : dupColor;
    });  
    
  });

  // now write the updated colors
  sheet.getDataRange().setBackgrounds (colors);
  
}

