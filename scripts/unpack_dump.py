# Interprets a database dump (username, vp) received from the game and put it into a better format
import json

try:
    file = open("./data/AccountDump.txt", "r", encoding="UTF-8")
    lines = file.readlines()
    players = {}
    count = 1
    name_conflicts = 0
    for line in lines:
        val = line.split("|")
        name = val[0].replace(" ", "")
        if not len(name): continue
        if name in players:
            print("Name conflict: " + name)
            name_conflicts += 1
            continue
        vp = int(val[-1].strip())
        if vp == 0: break
        players[name] = {"name": name, "vp": vp, "pos": count}
        count += 1
    json.dump(players, open("./data/VP.json", "w"), indent = 4)
    print("Done.")
except OSError:
    print("You are lacking the file needed to use this script!")