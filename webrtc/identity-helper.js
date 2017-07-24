'use strict';

/*
    dictionary RTCIdentityProviderDetails {
      required DOMString domain;
               DOMString protocol = "default";
    };
 */

// Parse a base64 JSON encoded string returned from getIdentityAssertion().
// This is also the string that is set in the a=identity line.
// Returns a { idp, assertion } where idp is of type RTCIdentityProviderDetails
// and assertion is the deserialized JSON that was returned by the
// IdP proxy's generateAssertion() function.
function parseAssertionResult(assertionResultStr) {
  const assertionResult = JSON.parse(atob(assertionResultStr));

  const { idp } = assertionResult;
  const assertion = JSON.parse(assertionResult.assertion);

  return { idp, assertion };
}

// Assert that an identity assertion string generated is found
// in generated SDP
function assert_has_identity_assertion(sdp, assertionResultStr) {
  assert_true(sdp.includes(`\r\na=identity:${assertionResultStr}`,
    'Expect SDP to have a=identity line containing assertion string'))
}
