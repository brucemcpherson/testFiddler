function shortenURL(){
  
  var ss= SpreadsheetApp.openById("1181bwZspoKoP98o4KuzO0S11IsvE59qCwiw4la9kL4o");  
  var range = ss.getSheetByName("shorten").getDataRange();
  range.getValues().slice(1).forEach (function (row,i) {
    var result = cUseful.Utils.expBackoff ( function () {
      return UrlShortener.Url.insert({
        longUrl: row[0]
      });
    });
    range.offset(i+1,1,1,1).setValue(result.id);
  });

}
