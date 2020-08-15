import json
from datetime import datetime as dtdatetime
import urllib.parse
import urllib.request

def getConfig():
    with open('/home/pi/Documents/pi-sms/config.json', encoding='utf-8-sig') as json_file:
        json_data = json.load(json_file)
        # print(json_data)
        return json_data

def req(values):
    try: 
        url = getConfig()['SERVER_URL'] + '/sms'

        data = urllib.parse.urlencode(values)
        data = data.encode('ascii') # data should be bytes
        req = urllib.request.Request(url, data)
        with urllib.request.urlopen(req) as response:
            res = response.read()
            return True
    except Exception as err:
            return False