'use strict'

/*
  The test identity provider is a naive IdP that provides
  absolutely no security for authentication. It can generate
  identity assertion for whatever identity that is requested.
  It validates identity assertion by simply decoding the JSON
  and return whatever that is inside, with no integrity
  protection and thus can be spoofed by anyone.

  While being not practical at all, the test IdP allows us
  to test various aspects of the identity API and allow tests
  to manipulate the IdP at will.
 */

// We pass around test options as query string to instruct
// the test IdP proxy script on what actions to perform.
// This hack is based on the fact that query string is allowed
// when specifying the IdP protocol.
function getTestOptions(urlStr) {
  const url = new URL(urlStr);
  const result = {};
  for(const [key, value] of url.searchParams.entries()) {
    result[key] = value;
  }
  return result;
}

/*
    callback GenerateAssertionCallback =
      Promise<RTCIdentityAssertionResult> (
        DOMString contents,
        DOMString origin,
        RTCIdentityProviderOptions options);

    dictionary RTCIdentityProviderOptions {
      DOMString protocol = "default";
      DOMString usernameHint;
      DOMString peerIdentity;
    };

    dictionary RTCIdentityAssertionResult {
      required RTCIdentityProviderDetails idp;
      required DOMString                  assertion;
    };

    dictionary RTCIdentityProviderDetails {
      required DOMString domain;
               DOMString protocol = "default";
    };
 */
function generateAssertion(contents, origin, options) {
  const idpOrigin = self.origin;
  const location = self.location;
  const { host } = location;
  const testOptions = getTestOptions(location);

  const assertion = {
    watermark: 'asserted by idp-test.js',
    location,
    idpOrigin,
    testOptions,
    contents, origin, options
  }

  const assertionStr = JSON.stringify(assertion);

  const idpDetails = {
    domain: host,
    protocol: 'idp-test.js'
  }

  return {
    idp: idpDetails,
    assertion: assertionStr
  }
}

/*
    callback ValidateAssertionCallback =
      Promise<RTCIdentityValidationResult> (
        DOMString assertion,
        DOMString origin);

    dictionary RTCIdentityValidationResult {
      required DOMString identity;
      required DOMString contents;
    };
 */
function validateAssertion(assertionStr, origin) {
  const assertion = JSON.parse(assertionStr);

  const {
    contents,
    options,
    testOptions
  } = assertion;

  const {
    usernameHint=`unknown@${self.location.hostname}`
  } = options;

  // The test options may specify what value to return
  // for the identity and contents fields. If unspecified,
  // the usernameHint and the original contents is returned
  const {
    action,
    returnIdentity=usernameHint,
    returnContents=contents
  } = testOptions;

  if(action === 'validate-throw-error') {
    throw new Error('Mock Internal IdP Error');

  } else {
    return {
      identity: returnIdentity,
      contents: returnContents
    }
  }
}

/*
  9.2.  Registering an IdP Proxy
    [Global,
     Exposed=RTCIdentityProviderGlobalScope]
    interface RTCIdentityProviderGlobalScope : WorkerGlobalScope {
      readonly attribute RTCIdentityProviderRegistrar rtcIdentityProvider;
    };

    [Exposed=RTCIdentityProviderGlobalScope]
    interface RTCIdentityProviderRegistrar {
      void register(RTCIdentityProvider idp);
    };

    dictionary RTCIdentityProvider {
      required GenerateAssertionCallback generateAssertion;
      required ValidateAssertionCallback validateAssertion;
    };
 */


//if(!(rtcIdentityProvider instanceof RTCIdentityProvider)) {
//  throw new Error('Failed to run IdP proxy as rtcIdentityProvider is not available');
//}

rtcIdentityProvider.register({
  generateAssertion,
  validateAssertion
});
