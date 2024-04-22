import pymongo
import requests
import urllib.parse

host = input("Host of MongoClient (leave blank for local): ")
if len(host) == 0:
    host = None

client = pymongo.MongoClient(host=host)
database = client.Rameses

bad_accounts = database.accounts.find({"careerVP": None})

for account_record in bad_accounts:
    api_data = requests.get(f"https://evades.io/api/account/{urllib.parse.quote(account_record['username'])}").json()
    print(api_data)
    account_record["careerVP"] = api_data["stats"]["highest_area_achieved_counter"]
    print(account_record)
    database.accounts.update_one({"_id": account_record["_id"]}, {"$set": account_record})