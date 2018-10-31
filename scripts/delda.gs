
function delete_da()
{
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  //ss = SpreadsheetApp.openById("1181bwZspoKoP98o4KuzO0S11IsvE59qCwiw4la9kL4o");
  //search pattern
  var search_pattern = ['DA1','DA2','DA3','DA4','DA5','DA6','DA7','DA8','DA9','DA10','DA11','DA12','DA13','DA14','DA15','DA16','DA17','DA18','DA19','DA20','DA21','DA22','DA23','DA24','DA25'];
   
  //all sheets with name KWxx
  ss.getSheets()
  .filter (function (sheet) {
    // assume any sheet called KWn is a target
    return sheet.getName().match (/^KW\d/); 
  })
 
  // now we have all the sheets that match
  .forEach (function (sheet) {
    // row 7, onwards
    var dataRange = sheet.getDataRange();
    dataRange = dataRange.offset (6,0,dataRange.getNumRows()-6);
    
    var data =  dataRange.getValues()
    .map (function (row,index) {
      // if any from H onwards on the row matches then blank out a-h on this row
      if (row.slice (8).some (function (d) {
          return search_pattern.indexOf(d) !== -1 ;
      })) {
        row.slice(0,8).forEach (function (d,i) { row[i] = "";});
      }
      return row;
    });
    
    // now write that out
    dataRange.setValues (data);
  })

}
