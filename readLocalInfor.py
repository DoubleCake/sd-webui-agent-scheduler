import json
with open("./user_info.json","r") as f:
    users = json.load(f)
print(users)
print(users.get("tianlong"))