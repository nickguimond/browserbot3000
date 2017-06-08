FROM ubuntu:latest

RUN apt-get update
RUN apt-get install -y wget
RUN apt-get install unzip
RUN wget https://chromedriver.storage.googleapis.com/2.29/chromedriver_linux64.zip -O temp.zip
RUN unzip temp.zip
RUN chmod +x chromedriver
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update
RUN apt-get install -y google-chrome-stable
RUN apt-get install -y xvfb

ENTRYPOINT xvfb-run --server-args='-screen 0 1920x1080x24' ./chromedriver --url-base=/wd/hub --port=4444 --whitelisted-ips="" --verbose
#ENTRYPOINT ./chromedriver --url-base=/wd/hub --port=4444 --whitelisted-ips=172.17.0.1 --verbose     <<<<  for when headless chrome works perfect and no longer need xvfb