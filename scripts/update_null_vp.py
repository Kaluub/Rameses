import pymongo
import requests
import urllib.parse
import time

host = input("Host of MongoClient (leave blank for local): ")
if len(host) == 0:
    host = None

client = pymongo.MongoClient(host=host)
database = client.Rameses

bad_accounts = database.accounts.find({"careerVP": None})
to_remove = []

for account_record in bad_accounts:
    if "username" not in account_record:
        print("FATAL: NO USERNAME")
        print(f"FAIL: {account_record}")
        to_remove.append(account_record)
        continue
    api_data = requests.get(f"https://evades.io/api/account/{urllib.parse.quote(account_record.get('displayName', None) or account_record['username'])}")
    if not api_data.ok:
        print("FATAL: ACCOUNT LINK FAILED")
        print(f"FAIL: {account_record}")
        to_remove.append(account_record)
        continue
    api_data = api_data.json()
    account_record["careerVP"] = api_data["stats"]["highest_area_achieved_counter"]
    print(account_record)
    database.accounts.update_one({"_id": account_record["_id"]}, {"$set": account_record})

if len(to_remove):
    print(f"Will remove {len(to_remove)} accounts from DB in 5 seconds.")
    time.sleep(5)
    for goner in to_remove:
        database.accounts.delete_one(goner)