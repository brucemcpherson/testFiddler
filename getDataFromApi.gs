function getDataFromApi() {
  
  // lets get some data from an API
  var result = getFromItunes ("REM");
  if (!result.ok) throw result.content;
  
  // either create or use an existing sheet
  var ss = SpreadsheetApp.openById('1181bwZspoKoP98o4KuzO0S11IsvE59qCwiw4la9kL4o');
  var sheet = ss.getSheetByName ("itunesapi") || ss.insertSheet("itunesapi");
  
  // first of all, create a sheet with all the data, clearing it first
  new cUseful.Fiddler(sheet.clearContents())
    .setData (result.data.results)
    .dumpValues();

  
  // we'll use fiddler to organize the data, and populate with selected fields from the API
  // after first clearing the sheet
  new cUseful.Fiddler(sheet.clearContents())
     // use the data from the API
    .setData (result.data.results)
    // but just keep a couple of the columns
    .filterColumns (function (column) {
      return ["artistName","collectionName","trackName"].indexOf(column) !== -1;
    })
    // and write it out
    .dumpValues();
    

  // Now if the columns are already set
  var result = getFromItunes ("Lady Gaga");
  if (!result.ok) throw result.content;


  // get the current data
  var fiddler = new cUseful.Fiddler(sheet);
 
  // these are the existing columns
  var columns = fiddler.getHeaders();
  
  // this is the data with the stuff we dont want filtered out
  var filteredData = result.data.results.map (function (row) {
    return Object.keys(row).reduce (function (p,c) {
      if (columns.indexOf (c) !== -1) {
        p[c] = row[c];
      }
      return p;
    },{});
  });
  
  // use the data from the API to insert at the end
  fiddler.insertRows (undefined ,filteredData.length , filteredData)  
  
  // and write it all out
    .dumpValues();

  
  // generaral itunes search
  function getFromItunes (searchTerm) {
  
    var response = cUseful.Utils.expBackoff( function () {
      return UrlFetchApp.fetch("https://itunes.apple.com/search" + "?term=" + encodeURIComponent(searchTerm), {
        muteHttpExceptions:true
      });
    });
    
    return response.getResponseCode() === 200 ?  {
      data: JSON.parse (response.getContentText()),
      ok:true
    } : {
      ok:false,
      code:response.getResponseCode(),
      content:response.getContentText()
    };
    
  }
  
}
function xx() {

  Logger.log ({a:1}.length);
}
function updateFromApi () {


  // either create or use an existing sheet
  var ss = SpreadsheetApp.openById('1181bwZspoKoP98o4KuzO0S11IsvE59qCwiw4la9kL4o');
  var sheet = ss.getSheetByName ("itunesapi") || ss.insertSheet("itunesapi");

  
  new cUseful.Fiddler(sheet)
  .mapRows (function (row) {
      // look up api.. for example using row.id or something
      // set the fields of interest
      row.name = "" ; // something from API
      return row;
  })
  .dumpValues();


}

   