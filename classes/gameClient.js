import EvadesClient from 'evades-client';

class GameClient {
    constructor(server, region, target, onRunComplete) {
        this.client = new EvadesClient(server, region, target, onResult);
        this.client.eventManager.addEventListener("spectateResult", onRunComplete);
    }
}

export default GameClient;