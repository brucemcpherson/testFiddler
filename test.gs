/**
 * test fiddler
 * a functional way to play with sheet data
 * uses library - cUseful
 *  Mcbr-v4SsYKJP7JMohttAZyz3TLx7pV4j
 * this script is at 
 * https://github.com/brucemcpherson/testFiddler
 * https://script.google.com/d/
 * 1iAi7USY6CatRwvqSf-2vhsxrSKUfsP4_ohO9rzmtD-LuPzAxNrdh_Qdt/edit?usp=sharing
 */

function testFiddler() {

  var sheetValues = SpreadsheetApp
    .openById('1h9IGIShgVBVUrUjjawk5MaCEQte_7t32XeEP1Z5jXKQ')
    .getSheetByName('airport list')
    .getDataRange()
    .getValues();
  
  
  // where to write the tests.. change this some sheet of your own.
  var fiddleRange =  SpreadsheetApp
    .openById('1najG4ARQ2JsqEGxT8kKz_IeYWCuBzzpmyU0R9oq3I58')
    .getSheetByName('fiddleTest')
    .getDataRange();

  
  // get a fiddler
  var fiddler = new cUseful.Fiddler();

  // set up the values
  fiddler.setValues (sheetValues);
  var data = fiddler.getData();
  Logger.log(JSON.stringify(data[0]));
  
  // try without headers
  fiddler.setHasHeaders(false);
  Logger.log(JSON.stringify(fiddler.getData().slice(0,2)));
  
  // reset
  fiddler.setHasHeaders(true);
  Logger.log(JSON.stringify(fiddler.getData().slice(0,2)));

  // you can modify the data and it will be reflected when output
  fiddler.getData()[0].municipality += 
    ' (' + fiddler.getData()[0].iso_region + ')'; 
  Logger.log(JSON.stringify(fiddler.createValues().slice(0,2)));

  // can also set data via an object rather than values
  fiddler.setData([
    {name:'john',last:'smith'},
    {name:'jane',last:'doe'}
  ]);
 
  // write to a sheet and take a look
  showFiddler (fiddler , fiddleRange);

  //--- set the data back to original
  fiddler.setValues(sheetValues);

  
  // filter only rows in USA
  fiddler.filterRows (function (row,properties) {
    return row.iso_country === "US";
  });
  
  // write to a sheet and take a look
  showFiddler (fiddler , fiddleRange);

  
  //--- set the data back to original
  fiddler.setValues(sheetValues);

  // now get rid of a couple of columns
  fiddler.filterColumns (function (name,properties) {
    return name !== 'latitude_deg' && name !== 'longitude_deg';
  });
  
  // write to a sheet and take a look
  showFiddler (fiddler , fiddleRange);

  
  //--- set the data back to original
  fiddler.setValues(sheetValues);
  
  // do a map and change something
  fiddler.mapRows(function (row,properties) {
    row.municipality += ('(' + row.iso_country + ')' );
    return row;
  });
  
   // write to a sheet and take a look
  showFiddler (fiddler , fiddleRange);


  //--- set the data back to original
  fiddler.setValues(sheetValues);
  
  // change the names of some columns
  fiddler.mapHeaders (function(name,properties) {
    return name.replace('iso_','');
  });
  
  // write to a sheet and take a look
  showFiddler (fiddler , fiddleRange);

  //--- set the data back to original
  fiddler.setValues(sheetValues);
  // change the data in columns 
  // change feet to meters & the title
  fiddler.mapColumns (function (values,properties) {
    return properties.name === "elevation_ft" ? 
      values.map(function(d) { return d * 0.3048; }) : values;
  })
  .mapHeaders(function (name, properties) {
      return name.replace ("elevation_ft" , "elevation_meters");       
  });
  
  // write to a sheet and take a look
  showFiddler (fiddler , fiddleRange);

  
  //--- set the data back to original
  fiddler.setValues(sheetValues);
  // insert 2 at the beginning
  fiddler
  .insertRows(0,2)
  
  // insert 3 at the 5th position
  .insertRows(4,3)
  
  // insert 1 at the end
  .insertRows();
  
  // write to a sheet and take a look
  showFiddler (fiddler , fiddleRange);
  
  // delete blank rows
  fiddler.filterRows (function (row, properties) {
    return properties.values.some(function(d) { 
      return d !== '';
    });
  });

  // write to a sheet and take a look
  showFiddler (fiddler , fiddleRange);

  //--- set the data back to original
  fiddler.setValues(sheetValues);
  
  // insert one before country
  fiddler
  .insertColumn ('country' , 'iso_country')
  
  // insert one at the end
  .insertColumn ('elevation_meters');
  
  // write to a sheet and take a look
  showFiddler (fiddler , fiddleRange);
 

  //--- set the data back to original
  fiddler.setValues(sheetValues);
  
  // move a coouple of columns - to end
  fiddler
  .moveColumn ('latitude_deg')
  .moveColumn ('longitude_deg','latitude_deg');
  
  // write to a sheet and take a look
  showFiddler (fiddler , fiddleRange);

  
  //--- set the data back to original
  fiddler.setValues(sheetValues);
  
  // copy a column and change it
  fiddler
  .copyColumn ('elevation_ft' , 'elevation_meters' , 'elevation_ft')
  .mapColumn ('elevation_meters',function (value , properties) {
        return value * 0.3048;
  });
  
    // write to a sheet and take a look
  showFiddler (fiddler , fiddleRange);

  //--- set the data back to original
  fiddler.setValues(sheetValues);
  
  // add some data to rows
  fiddler
  .insertRows (0,2,[{name:'unknown 1'},{name:'unknown 2'}]);
  
  // write to a sheet and take a look
  showFiddler (fiddler , fiddleRange);


  //--- set the data back to original
  fiddler.setValues(sheetValues);
  
  // copy data from rows
  fiddler
  .insertRows (0,2,fiddler.getData().slice(0,2));
  
  // write to a sheet and take a look
  showFiddler (fiddler , fiddleRange);
     

  
  //--- set the data back to original
  fiddler.setValues(sheetValues);
  
  // do a match - all rows where country is canada
  var matches = fiddler.selectRows('iso_country',function (value , properties) {
    return value === "CA";
  });
  
  // show the result from a different column
  Logger.log (matches.map(function(d) {
    return fiddler.getData()[d].municipality;
  }));
  
  
  
  // insert a column at a specific place - the beginning
  // and add a timestamp
  fiddler
  .insertColumn ('first column' , fiddler.getHeaders()[0])
  .mapColumn('first column', function (value,properties) {
    return new Date().getTime();
  });

  // write to a sheet and take a look
  showFiddler (fiddler , fiddleRange);

  //--- set the data back to original
  fiddler.setValues(sheetValues);
  
  // do something based on a value in a different column
  fiddler
  .insertColumn ('high' , 'elevation_ft')
  .mapColumn('high',function (value,properties) {
    return properties.row.elevation_ft > 1500 ? (
      properties.row.elevation_ft > 3000 ? 'really' : 'quite')  : 'not';
  });

  // write to a sheet and take a look
  showFiddler (fiddler , fiddleRange);
  
  //--- set the data back to original
  fiddler.setValues(sheetValues);
}

// use this to clear output sheet and show results
function showFiddler (fiddlerObject , outputRange) {
  
  // clear and write result 
  outputRange
  .getSheet()
  .clearContents();
  
  fiddlerObject
  .getRange(outputRange)
  .setValues(fiddlerObject.createValues());
}