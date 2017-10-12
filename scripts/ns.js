/**
 * a short cut to add nested properties to a an object
 * @param {object} [base] the base object
 * @param {string} propertyScheme something like "a.b.c" will extend as necessary
 * @return {object} base updated
 */
function propify (propertyScheme ,base) {
  
  // if base not specified, create it
  if (typeof base === typeof undefined) base = {};
  
  // make sure its an object
  if (typeof base !== typeof {} ) throw 'propify:base needs to be an object';
  
  // work through the scheme
  (propertyScheme || "").split (".")
    .reduce (function (p,c) {
    
      // add a branch if not already existing
      if (typeof p[c] === typeof undefined) p[c] = {};
      
      // make sure we're not overwriting anything
      if (typeof p[c] !== typeof {}) throw 'propify:branch ' + c + ' not an object in ' + propertyScheme;
      
      // move down the branch
      return p[c];

    } , base);
  
  // now should have the required shape
  return base;

}

function testPropertyBranch() {

  // get from library
  var propify = cUseful.Utils.propify;
  
  Logger.log (propify("details"));
  Logger.log (propify("details.profile"));
  
  var card = propify("contact.details.profile", {contact:{}});
  Logger.log (card);
  
  propify ("contact.details.profile.telephones", card);
  Logger.log (card);
  
  // can use a branch of the object to propify it, and will return the branch
  var profile = propify ("telephones", card.contact.details.profile);
  Logger.log (card);
  Logger.log (profile);
  
  // add another couple of branches 
  propify ("emails" , profile);
  propify ("urls", card.contact.details);
  
  Logger.log (card);
  
  // we can use the branch
  profile.telephones.mobile="1234"
  
  // or the full object
  card.contact.details.profile.telephones.home="1234";
  
  Logger.log (card);
  
  // should fail because mobile is not an object
  propify ("contact.details.profile.telephones.mobile", card);
  
  Logger.log (card);
}