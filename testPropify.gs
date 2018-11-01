

function testPropify() {

  // get from library
  var propify = cUseful.Utils.propify;
  
  Logger.log (propify("details")); // {details={}}
  Logger.log (propify("details.profile")); //{details={profile={}}}
  
  var card = propify("contact.details.profile", {contact:{}}); 
  Logger.log (card);    // {contact={details={profile={}}}}
  
  propify ("contact.details.profile.telephones", card);
  Logger.log (card);    // {contact={details={profile={telephones={}}}}}
  
  // can use a branch of the object to propify it, and will return the branch
  var profile = propify ("telephones", card.contact.details.profile); 
  Logger.log (card);    // {contact={details={profile={telephones={}}}}}
  Logger.log (profile); // {telephones={}}
  
  // add another couple of branches 
  propify ("emails" , profile);
  propify ("urls", card.contact.details);
  
  Logger.log (card);   // {contact={details={urls={}, profile={emails={}, telephones={}}}}}
  
  // we can use the branch
  profile.telephones.mobile="1234"
  
  // or the full object
  card.contact.details.profile.telephones.home="1234";
  
  Logger.log (card); // {contact={details={urls={}, profile={emails={}, telephones={mobile=1234, home=1234}}}}}
  
  // should fail because mobile is not an object
  propify ("contact.details.profile.telephones.mobile", card);
  
}