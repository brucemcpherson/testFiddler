function removeDuplicates() {
  var ss = SpreadsheetApp.openById('1181bwZspoKoP98o4KuzO0S11IsvE59qCwiw4la9kL4o');
  var sheet = ss.getSheetByName("remove-duplicates");
  
  // this one will remove duplicates rows using a fiddler
  // http://ramblings.mcpher.com/Home/excelquirks/gassnips/uniquefiddler
  // get the values, remove duplicate rows - a duplicate defined as same first/last name
  var fiddler = new cUseful.Fiddler(sheet);
  
  // get all the unique values in a given column
  Logger.log (fiddler.getUniqueValues("first name"));
  
  // get all the unique values in a given column, with a custom compare function
  Logger.log (fiddler.getUniqueValues("first name", function (a,b) {
    return a.toLowerCase() === b.toLowerCase();
  })); 
  
  // remove duplicates using multiple columns
  // and write back to a different sheet (creating it if necessary)
  fiddler.filterUnique (["first name","last name"])
  .dumpValues (ss.getSheetByName ("dupremove") || ss.insertSheet ("dupremove"));
  
  // remove duplicates, with a custom compare function 
  // and write back to a different sheet (creating it if necessary)
  var fiddler = new cUseful.Fiddler(sheet)
  .filterUnique (["first name","last name"] ,false , function (a,b) {
    return a.toLowerCase() === b.toLowerCase(); 
  }).dumpValues (ss.getSheetByName ("customdupremove") || ss.insertSheet ("customdupremove"));
  
  // remove duplicates, with a custom compare function , and keep the last occurrence
  // and write back to a different sheet (creating it if necessary)
  var fiddler = new cUseful.Fiddler(sheet)
  .filterUnique (["first name","last name"] ,true , function (a,b) {
    return a.toLowerCase() === b.toLowerCase(); 
  }).dumpValues (ss.getSheetByName ("customdupremovelast") || ss.insertSheet ("customdupremovelast"));
  

}