let EvadesClient;
try {
    EvadesClient = import("evades-client");
} catch {
    throw "Disable USE_EVADES_CLIENT in the config! You need a closed-source package to use this feature.";
}

class GameHandler {
    constructor(server, host, teammates = []) {
        this.client = new EvadesClient(server, host, teammates);
    }

    addResultListener(listener) {
        this.client.eventManager.addEventListener("spectateResult", listener);
    }
}

export default GameHandler;