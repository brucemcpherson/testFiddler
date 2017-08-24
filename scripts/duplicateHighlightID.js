function highlightDuplicatesID() {
  var ss = SpreadsheetApp.openById('1181bwZspoKoP98o4KuzO0S11IsvE59qCwiw4la9kL4o');
  var sheet = ss.getSheetByName("highlight-duplicates");
  var singleColor = "#ffffff";
  var dupColor = " #ffeb3b";
  
  // get the values
  var data = sheet.getDataRange().getValues();

  // In this case, the ID is in column 0 , and we want to highlight duplicate IDS
  
  // look through the data and get the 
  var counts = data.reduce (function (prev , row , index) {
    
    // if we've seen this one already then its a dup
    // use the ID as a property
    var key = row[0].toString();
    prev[key] = prev[key] || {indices:[]};
    
    // increment the rows we've seen it on
    prev[key].indices.push (index);
    return prev;
    
  }, {});
  
  // now we have an object organized by ID, with a property of how many times it was spotted
  var colors = data.map (function (row) {
    var key = row[0].toString();
    return row.map(function (e) {
      return counts[key].indices.length === 1 ? singleColor : dupColor;
    });  
  });

  // now write the updated colors
  sheet.getDataRange().setBackgrounds (colors);
  
}

