FROM node:14
LABEL author="hoangph23 <hoangph23@fpt.com.vn>"
LABEL maintainer="hoangph23 <hoangph23@fpt.com.vn>"

# Install Node Module
# RUN npm install
# Then run npm start

RUN mkdir /source
WORKDIR /source

ADD package.json /source
RUN npm install --ignore-scripts


ADD . /source
ARG PORT=9000
ENV PORT ${PORT}

ENTRYPOINT ["npm", "start"]
EXPOSE ${PORT}