function highlightDuplicatesCells() {
  var ss = SpreadsheetApp.openById('1181bwZspoKoP98o4KuzO0S11IsvE59qCwiw4la9kL4o');
  var sheet = ss.getSheetByName("highlight-duplicates");
  var singleColor = "#ffffff";
  var dupColor = " #ffeb3b";
  
  // this one will set dup color for individual cellss that
  // are duplicated in specific rows.
  // only the 2nd and subsequent dup cells will be highlighted with dup colors.
  // the first will get a third color
  var firstOfDupsColor = "#80d8ff";
  
  // get the values
  var data = sheet.getDataRange().getValues();

  // start by setting all the colors to non dups
  var colors = data.map (function (row) {
    return row.map (function () { return singleColor; });
  });
  
  
  // its going to be easier to work by column, so we'll transpose the data first
  var transposed = transpose (data);
  
  // only doing for a selection of columns
  [0, 2].forEach (function (col) {
    
    // look at the data columnwise 
    transposed[col].forEach (function (value) {
      
      // how many times a value appears in this column
      var matches = transposed[col].map (function (d, index) {
        // return the indices of matches
        return value === d ?  index : null;
      })
      .filter (function (d) {
        // get rid of non-matches
        return d !== null;
      });
      
      // if there's duplicates set the dup color, but only for the 2nd and subsequent
      if (matches.length > 1 ) {
        matches.forEach (function (d, i) {
          colors[d][col] = i ? dupColor : firstOfDupsColor;
        });
      }
      
    });

  });

  // now write the updated colors
  sheet.getDataRange().setBackgrounds (colors);
    

   
}

function tt() {
  Logger.log (transpose(transpose ([[1,2,3],[4,5,6]])));
}

 /**
  * transpose rows and columns
  * @param {*[][]} data an array of arrays of columns .. assumes its not jagged
  * @return {*[][]} transposed version
  */
function transpose(data) {
  
  // use the first row of data to decide on 
  return (data[0] || []).map (function (col , colIndex) {
    return data.map (function (row) {
      return row[colIndex];
    });
  });
  
}
    
