import psutil
import time
import os
import datetime

def cpuPercent():
    cur = 0.0
    cpu = psutil.cpu_percent(interval=1, percpu=True)
    for index in cpu:
        cur = cur + index
    return cur / 4

def cpuTemp():
    cput = psutil.sensors_temperatures()['cpu_thermal'][0]
    return cput.current

def cpuFreq():
    cpu = psutil.cpu_freq()
    return cpu.current

def cpu():
    cur = 0.0
    cpuPercent = psutil.cpu_percent(interval=1, percpu=True)
    cpuTemp = psutil.sensors_temperatures()
    cpuFreq = psutil.cpu_freq()
    for index in cpuPercent:
        cur = cur + index
    return {
        'cpu_percent': cur / 4,
        'cpu_temp': cpuTemp['cpu-thermal'][0].current,
        'cpu_freq': cpuFreq.current
    }
def memory():
    mem = psutil.virtual_memory()
    return {
        'memory_percent': mem.percent,
        'memory_used': mem.used,
        'memory_total': mem.total
    }

def pysmsService():
    status = os.system('systemctl is-active --quiet gateway4_sms.service')
    if status == 0:
        # print 'Process is active'
        return datetime.datetime.now()
    else:
        pass
        # print 'Process is down'
        # return 'Inactive'
def pywebService():
    status = os.system('systemctl is-active --quiet gateway1_webserver.service')
    if status == 0:
        return datetime.datetime.now()
    else:
        pass

# if __name__ == "__main__":
    # while True:
    #     result = pysmsService()
    #     print result
    #     time.sleep(2)
