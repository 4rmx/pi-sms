#!/usr/bin/python
import sys
import os
import gammu
import time
from datetime import datetime as dtdatetime
from logger import logger
from onPost import req
import sqlite3
from util import *

sm = gammu.StateMachine()
sm.ReadConfig()
sm.Init()

def getSMS(conn):
    global sm
    status = sm.GetSMSStatus()
    remain = status['SIMUsed'] + status['PhoneUsed'] + status['TemplatesUsed']
    sms = []
    start = True

    while remain > 0:       
        if start:
            cursms = sm.GetNextSMS(Start = True, Folder = 0)
            start = False
        else:
            cursms = sm.GetNextSMS(Location = cursms[0]['Location'], Folder= 0)
    
        delSMS(cursms)

        remain = remain - len(cursms)
        sms.append(cursms)
    
    # print len(sms)
    data = gammu.LinkSMS(sms)
    for index in data:
        
        v = gammu.DecodeSMS(index)
        m = index[0]
        msgs = ''
        loc = []
        
        for m in index:
            # print m['Location']
            # print type(m['Location'])
            loc.append(int(m['Location']))

        if v == None:
            msgs = m['Text']
        else:
            for e in v['Entries']:
                if e['Buffer'] != None:
                    msgs += e['Buffer']

        message = {
            'sender' : m['Number'],
            'received' : str(m['DateTime']),
            'message' : msgs,
        }
        logger.info(message['message'])

        res = req(message)
        conn.execute("INSERT INTO inbox (sender,received,message,create_at, is_send) \
            VALUES (?, ?, ?, ?, ?)", (message['sender'], message['received'], message['message'], dtdatetime.now(), res)) 
        conn.commit()


def delSMS(cursms):
    for x in range(len(cursms)):
        sm.DeleteSMS(0, cursms[x]['Location'])

def autoRestart(cmd):
    print("fire restart")

if __name__ == "__main__":
    logger.info('gammu-sms start')
    try:
        conn = sqlite3.connect('/home/pi/Documents/pi-sms/sms.db')
        while True:
            getSignal = sm.GetSignalQuality()
            signal = 'signal(%) ' + str(getSignal['SignalPercent'])
            logger.debug(signal)
            getSMS(conn)
            time.sleep(2)
    except Exception as err:
        logger.error(err)
        logger.error('temp(C) ' + str(cpuTemp()))
        conn.close()