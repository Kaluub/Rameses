import json
import pymongo

host = input("Host of MongoClient (leave blank for local): ")
if len(host) == 0:
    host = None

client = pymongo.MongoClient(host=host)
database = client.Rameses

tournament_id = input("Tournament ID: ")
tournament_dump = database.tournaments.find_one({"id": tournament_id})

# tournament_file = open("../data/tournament.json", "r", encoding="UTF-8")
# tournament_dump = json.load(tournament_file)
# tournament_file.close()

formatted_text = f"Tournament dump from {tournament_dump['id']}:"

def sort_by_time(run):
    return run['timeSeconds']

def sort_by_area(run):
    area = run["area"].split(" ")[1]
    try:
        area = int(area)
        return area
    except:
        return 0

common_spectators = {
    "748524109620576339": "yeetyeet47",
    "710989952430768209": "AkTu",
    "901319009037869106": "veen",
    "768673501111648257": "Dreamz",
    "244540794579582976": "Raqsv",
    "461564949768962048": "Kaluub",
    "193891911776468994": "hula",
    "879110764466667521": "BOTSLAYER",
    "315537155831365635": "☺♣○•♣♥☻♦♠◘",
    "516707786252615680": "eagle45",
    "589254639547842560": "nosok"
}

for run in sorted(
        sorted(
            tournament_dump['leaderboard'],
            key=sort_by_time
        ),
        key=sort_by_area,
        reverse=True
    ):
    formatted_text += f"\n{run['player']} reached {run['area']} in {run['time']}"
    if run["spectator"] in common_spectators:
        formatted_text += f", spectated by {common_spectators[run['spectator']]}"
    else:
        formatted_text += f", spectated by a Discord user with ID {run['spectator']}."

write_file = open(f"../data/tournament-{tournament_dump['id']}.txt", "w", encoding="UTF-8")
write_file.write(formatted_text)

print(f"Formatted tournament and saved to {write_file.name}.")
write_file.close()