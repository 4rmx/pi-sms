import os
import sys
import logging
from logging import handlers
logger = logging.getLogger('sms')
logger.setLevel(logging.DEBUG)
st = logging.StreamHandler(sys.stdout)
st.setLevel(logging.DEBUG)
path = os.path.abspath("")
th = handlers.TimedRotatingFileHandler('/home/pi/Documents/pi-sms/python/log/sms.log', 'midnight', 7)
th.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
th.setFormatter(formatter)
st.setFormatter(formatter)
logger.addHandler(th)
logger.addHandler(st)