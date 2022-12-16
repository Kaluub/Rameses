**Setting it up yourself:**
1. Install [Git](https://git-scm.com/), [Node.js](https://nodejs.org/en/download/) and [MongoDB](https://repo.mongodb.org/yum/amazon/2/mongodb-org/6.0/x86_64/RPMS/mongodb-org-server-6.0.3-1.amzn2.x86_64.rpm) for your device.
2. In any folder, run:
```
git clone https://github.com/Kaluub/Rameses.git
cd Rameses/
```
3. Install the dependancies using this command: `npm ci`
4. Create your own Discord bot yourself, and invite it to your server. You can do this by going to the [Discord developer portal](https://discord.com/developers/applications) and creating a new application. Under the "bot" tab, create a new bot. You'll need to copy the token of the bot. To invite the bot to your server, you can go to the Oauth2 -> URL generator tab, then select the "bot" and "applications.commands" scopes, then use the URL generated. The bot shouldn't need any extra permissions, but giving it the Administrator permission to prevent those headaches isn't a bad idea. If you'd also like to have the live Rameses bot in your server, [click here](https://discord.com/api/oauth2/authorize?client_id=1041182147924467762&permissions=2147805248&scope=applications.commands%20bot).
5. Create the token file. A helpful error will appear if you don't, but you'll need to create a file named "token" (no file extensions) and copy in your token from the developer portal.
6. For your first run, and any time you modify the application commands (slash commands, context menus, etc.), you should use `node app.js -i`. This will reset them all.
7. To start the bot otherwise, run `node app.js`. To stop the bot, press CTRL+C in the console.

**Additional information:**
You can change up the config to your liking by creating a new file named `.env`. All the valid configuration options are exposed in `config.js`.
Example config:
```
DEBUG=TRUE
DEVELOPMENT_SERVER=<Put a server ID here.>
```

**Updating the bot:**
Usually, just stopping the bot, running `git pull` or managing it through your favourite GitHub tool, then restarting the bot is enough. If not, there's probably some massive change made that requires specific database changes or something.

**Contributing to the bot:**
Glad you're interested! If you'd like to, consider looking through the code and finding bugs, missing features, or otherwise familiarize yourself with the code itself. If you have any questions, feel free to send me a message (preferably through Discord: Kaluub#1527)
