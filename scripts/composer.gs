function off() {
  

  function composer() {
    return Array.prototype.slice.call(arguments).reduceRight(function (prev, current) {
      return function () {
        return current(prev.apply(undefined, arguments));
      };
    });
  };
  
  
  var sumColumn = composer (
    
    // add all the values in column 2
    function (ob) {
      // miss the heading row
      return ob.values.slice(1).reduce (function (p,c) {
        return p+c[ob.package.column];
      },0);
    },
    
    // get the values
    function (ob) {
      return {values:ob.sheet.getDataRange().getValues(), package:ob.package};
    },
    
    // get the sheet
    function (ob) {
      return {sheet:ob.spreadsheet.getSheetByName (ob.package.sheetName), package:ob.package};
    },
    
    // get the spreadsheet
    function (package) {
      return {spreadsheet:SpreadsheetApp.openById(package.id), package:package};
    }

   );
     
  Logger.log (
    sumColumn ({
      id:'1181bwZspoKoP98o4KuzO0S11IsvE59qCwiw4la9kL4o',
      sheetName:"dupRemove",
      column:2})
  );
  
}
