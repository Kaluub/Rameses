**Use Rameses:**
You can add [add Rameses to a server or your account](https://discord.com/oauth2/authorize?client_id=1041182147924467762) and use all of the features from there.

**Setup:**
If you would like to contribute to Rameses or host your own instance, you can follow these setup steps.
I recommend to use Linux or [WSL on Windows](https://learn.microsoft.com/en-us/windows/wsl/install), but many environments will do fine regardless.

1. Install [Git](https://git-scm.com/) and [Docker](https://docs.docker.com/engine/install/), or install Node.js and MongoDB manually.

2. Create your own Discord bot yourself, and invite it to your server. You can do this by going to the [Discord developer portal](https://discord.com/developers/applications) and creating a new application. Under the "bot" tab, create a new bot. You'll need to copy the token of the bot. To invite the bot to your server, you can go to the Oauth2 -> URL generator tab, then select the "bot" and "applications.commands" scopes, then use the URL generated. The bot shouldn't need any extra permissions.

4. (Optional) If you would like for the /speedruns function to work, you generate your own google token. You can do this by going to the [Google developer portal](https://console.cloud.google.com/apis/dashboard), then creating a new project, or using an existing one. Then clicking on enable apis and services (at the top), search for google sheets api and enable. To receive your key, you should go to the credentials tab on the left, click the down arrow on credentials (at the top), select api key and choose to allow google sheets. Once completed you will receive your key.

5. Clone the repository: `git clone https://github.com/Kaluub/Rameses.git`.

6. Create a `.env` config file & create a TOKEN entry to paste your bot token into. All of the valid configuration options can be found in `src/classes/config.js`. Example config file:
```
TOKEN=<Put your bot token here.>
DEBUG=TRUE
DEVELOPMENT_SERVER=<Put a server ID here.>
GOOGLE_API_KEY=<Put your google token here.>
```

7. To start the bot using Docker, run `./run.sh`.