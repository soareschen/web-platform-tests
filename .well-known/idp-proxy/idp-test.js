'use strict'

const testOptions = getTestOptions(location);

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
  const assertion = {
    watermark: 'asserted by idp-test.js',
    location, testOptions,
    contents, origin, options
  }

  const assertionStr = JSON.stringify(assertion);

  const idpDetails = {
    domain: window.location.hostname,
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
    testOptions: { username='unknown' }
  } = assertion;

  return {
    identity: `${username}@${origin}`,
    contents
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
