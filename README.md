**Setup:**
1. Install [Git](https://git-scm.com/) and [Docker](https://docs.docker.com/engine/install/), or install Node.js and MongoDB manually.

2. Create your own Discord bot yourself, and invite it to your server. You can do this by going to the [Discord developer portal](https://discord.com/developers/applications) and creating a new application. Under the "bot" tab, create a new bot. You'll need to copy the token of the bot. To invite the bot to your server, you can go to the Oauth2 -> URL generator tab, then select the "bot" and "applications.commands" scopes, then use the URL generated. The bot shouldn't need any extra permissions. If you'd also like to have the main Rameses bot in your server, [click here](https://discord.com/oauth2/authorize?client_id=1041182147924467762&permissions=313344&integration_type=0&scope=applications.commands+bot).

3. Create a `.env` config file & create a TOKEN entry to paste your bot token into. Example config file:
```
TOKEN=<Put your bot token here.>
DEBUG=TRUE
DEVELOPMENT_SERVER=<Put a server ID here.>
```
All of the valid configuration options can be found in `classes/config.js`.

4. To start the bot using Docker, run `./run.sh`.