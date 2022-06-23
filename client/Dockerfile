FROM node:14
LABEL author="hoangph23 <hoangph23@fpt.com.vn>"
LABEL maintainer="hoangph23 <hoangph23@fpt.com.vn>"

# Install Node Module
# RUN npm install
# Then run npm start

RUN mkdir /ttgt-client
WORKDIR /ttgt-client

ADD package.json /ttgt-client
RUN npm install --ignore-scripts


ADD . /ttgt-client
ARG PORT=9000
ENV PORT ${PORT}

# ENTRYPOINT ["npm", "start"]
EXPOSE ${PORT}