
function testES6() {
  
  // need to import a couple of things if using as library
  // the rest are added to the prototypes
  var Set = cEs6Shim.Set;
  var Map = cEs6Shim.Map;
  
  var arr = ["a", "b" , "c","d","e"];

  // same as arr.slice();
  Logger.log (Array.from(arr));

  // same as split("");
  Logger.log (Array.from ("Bruce"));

  // same as arr.map(function (d) { return d.return d.toUpperCase(); });
  Logger.log (Array.from (arr , function (d) { return d.toUpperCase(); }));
  
  // can also convert array like to array
  (function () {
    // same as Array.prototype.slice.call (arguments);
    Logger.log (Array.from (arguments));
  }) ("x","y");
  
  // same as [1,1].map(function(d) { return 0; });
  Logger.log([1,1].fill(0));
  
  // like indexOf but with function
  Logger.log (arr.find (function (d) { return d ==="c" }));
  Logger.log (arr.findIndex (function (d) { return d ==="c" }));
  
  
  var arr2 = Array.from(arr);
  // like splice
  Logger.log (arr2.copyWithin (2,1, 3));
  
  // we can use Array.from to convert iterators to an array, since we dont have the for ... of syntax
  Logger.log (Array.from (arr.keys()));
  Logger.log (Array.from (arr.values()));
  
  
  // strings
  var str = "bohemian rhapsody";
  
  // same as str.slice (-2) === "dy"
  Logger.log (str.endsWith ("dy"));
  
  // same as str.indexOf ("ian") !== -1
  Logger.log (str.includes ("ian"));
  
  // same as new Array(11).join ("abc");
  Logger.log ("abc".repeat (10));
  
  // same as str.slice (0,2) === "bo"
  Logger.log (str.startsWith ("bo"));
  
  // maps - a more convenient way to deal with kv pairs
  var map = new Map([['mystery','tour' ], ['iamthe', 'walrus']]);
  map.set('bungalow', 'bill');
  Logger.log(map.get('bungalow'));
  // cant use .delete method
  map['delete']('iamthe');
  Logger.log(map.get('iamthe'));
  
  // iterators need to the for .. of syntax but you can make them into an array
  Logger.log(Array.from(map.keys()));
  Logger.log(Array.from(map.values()));
  
  // Sets
  var set = new Set(["yesterday", "yellow submarine"]);
  set.add("lady");
  set.add("madonna");
  Logger.log (set.has ("madonna"));
  Logger.log (set.has ("lady madonna"));
  // cant use .delete
  set['delete'] ("yesterday");
  Logger.log (Array.from(set.values()));

  
}
